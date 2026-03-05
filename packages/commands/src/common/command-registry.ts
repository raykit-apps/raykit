import type { Emitter, Event } from '@raykit/base'
import type { Command } from './command'
import type { CommandHandler } from './command-handler'
import { Emitter as EmitterImpl } from '@raykit/base'

/**
 * Symbol for the CommandRegistry.
 */
export const CommandRegistry = Symbol('CommandRegistry')

/**
 * Event fired before a command is executed.
 */
export interface WillExecuteCommandEvent {
  commandId: string
  args: unknown[]
}

/**
 * Event fired after a command is executed.
 */
export interface DidExecuteCommandEvent {
  commandId: string
  args: unknown[]
  result: unknown
}

/**
 * Registry for commands and their handlers.
 */
export interface ICommandRegistry {
  /**
   * Event fired before a command is executed.
   */
  onWillExecuteCommand: Event<WillExecuteCommandEvent>

  /**
   * Event fired after a command is executed.
   */
  onDidExecuteCommand: Event<DidExecuteCommandEvent>

  /**
   * Register a command with its handler.
   * @param command The command to register
   * @param handler The handler for the command
   */
  registerCommand: <T>(command: Command, handler: CommandHandler<T>) => void

  /**
   * Register a command by ID with its handler.
   * @param commandId The command ID
   * @param handler The handler for the command
   */
  registerHandler: <T>(commandId: string, handler: CommandHandler<T>) => void

  /**
   * Get a command by its ID.
   * @param commandId The command ID
   * @returns The command or undefined if not found
   */
  getCommand: (commandId: string) => Command | undefined

  /**
   * Get all registered commands.
   * @returns Array of all commands
   */
  getAllCommands: () => Command[]

  /**
   * Execute a command by its ID.
   * @param commandId The command ID
   * @param args Arguments to pass to the command
   * @returns The result of the command execution
   */
  executeCommand: <T>(commandId: string, ...args: unknown[]) => Promise<T>

  /**
   * Check if a command has any enabled handlers.
   * @param commandId The command ID
   * @returns true if the command can be executed
   */
  isEnabled: (commandId: string) => boolean

  /**
   * Check if a command has any visible handlers.
   * @param commandId The command ID
   * @returns true if the command should be visible
   */
  isVisible: (commandId: string) => boolean
}

/**
 * Implementation of the CommandRegistry.
 */
export class CommandRegistryImpl implements ICommandRegistry {
  private commands = new Map<string, Command>()
  private handlers = new Map<string, CommandHandler<unknown>[]>()

  private willExecuteEmitter: Emitter<WillExecuteCommandEvent>
  private didExecuteEmitter: Emitter<DidExecuteCommandEvent>

  constructor() {
    this.willExecuteEmitter = new EmitterImpl<WillExecuteCommandEvent>()
    this.didExecuteEmitter = new EmitterImpl<DidExecuteCommandEvent>()
  }

  get onWillExecuteCommand(): Event<WillExecuteCommandEvent> {
    return this.willExecuteEmitter.event
  }

  get onDidExecuteCommand(): Event<DidExecuteCommandEvent> {
    return this.didExecuteEmitter.event
  }

  registerCommand<T>(command: Command, handler: CommandHandler<T>): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command ${command.id} is already registered.`)
      return
    }
    this.commands.set(command.id, command)
    this.addHandler(command.id, handler)
  }

  registerHandler<T>(commandId: string, handler: CommandHandler<T>): void {
    if (!this.commands.has(commandId)) {
      throw new Error(`Command ${commandId} is not registered.`)
    }
    this.addHandler(commandId, handler)
  }

  private addHandler<T>(commandId: string, handler: CommandHandler<T>): void {
    const handlers = this.handlers.get(commandId) || []
    handlers.push(handler as CommandHandler<unknown>)
    this.handlers.set(commandId, handlers)
  }

  getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId)
  }

  getAllCommands(): Command[] {
    return Array.from(this.commands.values())
  }

  async executeCommand<T>(commandId: string, ...args: unknown[]): Promise<T> {
    const command = this.commands.get(commandId)
    if (!command) {
      throw new Error(`Command ${commandId} not found.`)
    }

    const handlers = this.handlers.get(commandId) || []
    const activeHandler = handlers.find(h => !h.isEnabled || h.isEnabled())

    if (!activeHandler) {
      throw new Error(`No active handler found for command ${commandId}.`)
    }

    this.willExecuteEmitter.fire({ commandId, args })

    try {
      const result = await activeHandler.execute(...args)
      this.didExecuteEmitter.fire({ commandId, args, result })
      return result as T
    } catch (error) {
      this.didExecuteEmitter.fire({ commandId, args, result: error })
      throw error
    }
  }

  isEnabled(commandId: string): boolean {
    const handlers = this.handlers.get(commandId) || []
    return handlers.some(h => !h.isEnabled || h.isEnabled())
  }

  isVisible(commandId: string): boolean {
    const handlers = this.handlers.get(commandId) || []
    return handlers.some(h => !h.isVisible || h.isVisible())
  }
}
