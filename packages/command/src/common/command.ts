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

/**
 * Type guard to check if an object is a valid Command.
 */
export function isCommand(obj: unknown): obj is Command {
  return typeof obj === 'object'
    && obj !== null
    && 'id' in obj
    && typeof (obj as Command).id === 'string'
}
