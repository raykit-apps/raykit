import type { ICommandRegistry } from './command-registry'

/**
 * Symbol for the CommandContribution.
 */
export const CommandContribution = Symbol('CommandContribution')

/**
 * Contribution interface for modules to register commands.
 */
export interface CommandContribution {
  /**
   * Register commands with the registry.
   * @param registry The command registry to register commands with
   */
  registerCommands: (registry: ICommandRegistry) => void
}

/**
 * Type guard to check if an object is a valid CommandContribution.
 */
export function isCommandContribution(obj: unknown): obj is CommandContribution {
  return typeof obj === 'object'
    && obj !== null
    && 'registerCommands' in obj
    && typeof (obj as CommandContribution).registerCommands === 'function'
}
