import type { Event } from '@raykit/base'
import { ContributionProvider, Disposable, DisposableCollection, Emitter, isObject, WaitUntilEvent } from '@raykit/base'
import { inject, injectable, named } from 'inversify'
import debounce from 'p-debounce'

/**
 * Represents a command with metadata.
 */
export interface Command {
  /**
   * Unique identifier for the command.
   */
  id: string

  /**
   * Human-readable label for the command.
   */
  label?: string

  /**
   * Category for grouping commands.
   */
  category?: string

  /**
   * CSS class for the command icon.
   */
  iconClass?: string
}

export namespace Command {
  export function is(arg: unknown): arg is Command {
    return isObject(arg) && 'id' in arg
  }

  export function equals(a: Command, b: Command): boolean {
    return (
      a.id === b.id
      && a.label === b.label
      && a.iconClass === b.iconClass
      && a.category === b.category
    )
  }
}

export interface CommandHandler {
  execute: (...args: any[]) => any

  isEnabled?: (...args: any[]) => boolean
  onDidChangeEnabled?: Event<void>

  isVisible?: (...args: any[]) => boolean

  isToggled?: (...args: any[]) => boolean
}

export const CommandContribution = Symbol('CommandContribution')

export interface CommandContribution {
  /**
   * Register commands and handlers.
   */
  registerCommands: (commands: CommandRegistry) => void
}

export interface CommandEvent {
  commandId: string
  args: any[]
}

export interface WillExecuteCommandEvent extends WaitUntilEvent, CommandEvent {
}

export const CommandService = Symbol('CommandService')

export interface CommandService {
  /**
   * Execute the active handler for the given command and arguments.
   *
   * Reject if a command cannot be executed.
   */
  executeCommand: <T>(command: string, ...args: any[]) => Promise<T | undefined>
  /**
   * An event is emitted when a command is about to be executed.
   *
   * It can be used to install or activate a command handler.
   */
  readonly onWillExecuteCommand: Event<WillExecuteCommandEvent>
  /**
   * An event is emitted when a command was executed.
   */
  readonly onDidExecuteCommand: Event<CommandEvent>
}

@injectable()
export class CommandRegistry implements CommandService {
  protected readonly _commands: { [id: string]: Command } = {}
  protected readonly _handlers: { [id: string]: CommandHandler[] } = {}

  protected readonly toUnregisterCommands = new Map<string, Disposable>()

  // List of recently used commands.
  protected _recent: string[] = []

  protected readonly onWillExecuteCommandEmitter = new Emitter<WillExecuteCommandEvent>()
  readonly onWillExecuteCommand = this.onWillExecuteCommandEmitter.event

  protected readonly onDidExecuteCommandEmitter = new Emitter<CommandEvent>()
  readonly onDidExecuteCommand = this.onDidExecuteCommandEmitter.event

  protected readonly onCommandsChangedEmitter = new Emitter<void>()
  readonly onCommandsChanged = this.onCommandsChangedEmitter.event

  constructor(
    @inject(ContributionProvider) @named(CommandContribution)
    protected readonly contributionProvider: ContributionProvider<CommandContribution>,
  ) { }

  onStart(): void {
    const contributions = this.contributionProvider.getContributions()
    for (const contrib of contributions) {
      contrib.registerCommands(this)
    }
  }

  * getAllCommands(): IterableIterator<Readonly<Command & { handlers: CommandHandler[] }>> {
    for (const command of Object.values(this._commands)) {
      yield { ...command, handlers: this._handlers[command.id] ?? [] }
    }
  }

  /**
   * Register the given command and handler if present.
   *
   * Throw if a command is already registered for the given command identifier.
   */
  registerCommand(command: Command, handler?: CommandHandler): Disposable {
    if (this._commands[command.id]) {
      console.warn(`A command ${command.id} is already registered.`)
      return Disposable.NULL
    }
    const toDispose = new DisposableCollection(this.doRegisterCommand(command))
    if (handler) {
      toDispose.push(this.registerHandler(command.id, handler))
    }
    this.toUnregisterCommands.set(command.id, toDispose)
    toDispose.push(Disposable.create(() => this.toUnregisterCommands.delete(command.id)))
    return toDispose
  }

  protected doRegisterCommand(command: Command): Disposable {
    this._commands[command.id] = command
    return {
      dispose: () => {
        delete this._commands[command.id]
      },
    }
  }

  /**
   * Unregister command from the registry
   *
   * @param command
   */
  unregisterCommand(command: Command): void
  /**
   * Unregister command from the registry
   *
   * @param id
   */
  unregisterCommand(id: string): void
  unregisterCommand(commandOrId: Command | string): void {
    const id = Command.is(commandOrId) ? commandOrId.id : commandOrId
    const toUnregister = this.toUnregisterCommands.get(id)
    if (toUnregister) {
      toUnregister.dispose()
    }
  }

  /**
   * Register the given handler for the given command identifier.
   *
   * If there is already a handler for the given command
   * then the given handler is registered as more specific, and
   * has higher priority during enablement, visibility and toggle state evaluations.
   */
  registerHandler(commandId: string, handler: CommandHandler): Disposable {
    let handlers = this._handlers[commandId]
    if (!handlers) {
      this._handlers[commandId] = handlers = []
    }
    handlers.unshift(handler)
    this.fireDidChange()
    return {
      dispose: () => {
        const idx = handlers.indexOf(handler)
        if (idx >= 0) {
          handlers.splice(idx, 1)
          this.fireDidChange()
        }
      },
    }
  }

  protected fireDidChange = debounce(() => this.doFireDidChange(), 0)

  protected doFireDidChange(): void {
    this.onCommandsChangedEmitter.fire()
  }

  /**
   * Test whether there is an active handler for the given command.
   */
  isEnabled(command: string, ...args: any[]): boolean {
    return typeof this.getActiveHandler(command, ...args) !== 'undefined'
  }

  /**
   * Test whether there is a visible handler for the given command.
   */
  isVisible(command: string, ...args: any[]): boolean {
    return typeof this.getVisibleHandler(command, ...args) !== 'undefined'
  }

  /**
   * Test whether there is a toggled handler for the given command.
   */
  isToggled(command: string, ...args: any[]): boolean {
    return typeof this.getToggledHandler(command, ...args) !== 'undefined'
  }

  /**
   * Execute the active handler for the given command and arguments.
   *
   * Reject if a command cannot be executed.
   */
  async executeCommand<T>(commandId: string, ...args: any[]): Promise<T | undefined> {
    const handler = this.getActiveHandler(commandId, ...args)
    if (handler) {
      await this.fireWillExecuteCommand(commandId, args)
      const result = await handler.execute(...args)
      this.onDidExecuteCommandEmitter.fire({ commandId, args })
      return result
    }
    throw Object.assign(new Error(`The command '${commandId}' cannot be executed. There are no active handlers available for the command.`), { code: 'NO_ACTIVE_HANDLER' })
  }

  protected async fireWillExecuteCommand(commandId: string, args: any[] = []): Promise<void> {
    await WaitUntilEvent.fire(this.onWillExecuteCommandEmitter, { commandId, args }, 30000)
  }

  /**
   * Get a visible handler for the given command or `undefined`.
   */
  getVisibleHandler(commandId: string, ...args: any[]): CommandHandler | undefined {
    const handlers = this._handlers[commandId]
    if (handlers) {
      for (const handler of handlers) {
        try {
          if (!handler.isVisible || handler.isVisible(...args)) {
            return handler
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
    return undefined
  }

  /**
   * Get an active handler for the given command or `undefined`.
   */
  getActiveHandler(commandId: string, ...args: any[]): CommandHandler | undefined {
    const handlers = this._handlers[commandId]
    if (handlers) {
      for (const handler of handlers) {
        try {
          if (!handler.isEnabled || handler.isEnabled(...args)) {
            return handler
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
    return undefined
  }

  /**
   * Get a toggled handler for the given command or `undefined`.
   */
  getToggledHandler(commandId: string, ...args: any[]): CommandHandler | undefined {
    const handlers = this._handlers[commandId]
    if (handlers) {
      for (const handler of handlers) {
        try {
          if (handler.isToggled && handler.isToggled(...args)) {
            return handler
          }
        } catch (error) {
          console.error(error)
        }
      }
    }
    return undefined
  }

  /**
   * Returns with all handlers for the given command. If the command does not have any handlers,
   * or the command is not registered, returns an empty array.
   */
  getAllHandlers(commandId: string): CommandHandler[] {
    const handlers = this._handlers[commandId]
    return handlers ? handlers.slice() : []
  }

  /**
   * Get all registered commands.
   */
  get commands(): Command[] {
    return Object.values(this._commands)
  }

  /**
   * Get a command for the given command identifier.
   */
  getCommand(id: string): Command | undefined {
    return this._commands[id]
  }

  /**
   * Get all registered commands identifiers.
   */
  get commandIds(): string[] {
    return Object.keys(this._commands)
  }

  /**
   * Get the list of recently used commands.
   */
  get recent(): Command[] {
    const commands: Command[] = []
    for (const recentId of this._recent) {
      const command = this.getCommand(recentId)
      if (command) {
        commands.push(command)
      }
    }
    return commands
  }

  /**
   * Set the list of recently used commands.
   * @param commands the list of recently used commands.
   */
  set recent(commands: Command[]) {
    this._recent = Array.from(new Set(commands.map(e => e.id)))
  }

  /**
   * Adds a command to recently used list.
   * Prioritizes commands that were recently executed to be most recent.
   *
   * @param recent a recent command, or array of recent commands.
   */
  addRecentCommand(recent: Command | Command[]): void {
    for (const recentCommand of Array.isArray(recent) ? recent : [recent]) {
      const index = this._recent.findIndex(commandId => commandId === recentCommand.id)
      if (index >= 0) {
        this._recent.splice(index, 1)
      }
      this._recent.unshift(recentCommand.id)
    }
  }

  /**
   * Clear the list of recently used commands.
   */
  clearCommandHistory(): void {
    this.recent = []
  }
}
