import type { MaybePromise } from '@raykit/base'

/**
 * Represents a handler for a command.
 */
export interface CommandHandler<T = unknown> {
  /**
   * Execute the command with the given arguments.
   * @param args Arguments passed to the command
   * @returns The result of the command execution
   */
  execute: (...args: unknown[]) => MaybePromise<T>

  /**
   * Check if the command is currently enabled.
   * @returns true if the command can be executed
   */
  isEnabled?: () => boolean

  /**
   * Check if the command is currently visible.
   * @returns true if the command should be visible in UI
   */
  isVisible?: () => boolean

  /**
   * Check if the command is currently toggled.
   * @returns true if the command is in a toggled state
   */
  isToggled?: () => boolean
}

/**
 * Type guard to check if an object is a valid CommandHandler.
 */
export function isCommandHandler(obj: unknown): obj is CommandHandler {
  return typeof obj === 'object'
    && obj !== null
    && 'execute' in obj
    && typeof (obj as CommandHandler).execute === 'function'
}
