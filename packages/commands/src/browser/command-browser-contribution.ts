import type { ApplicationBrowserContribution } from '@raykit/core/browser'
import { inject, injectable } from 'inversify'
import { CommandRegistry } from '../common'

/**
 * Browser command contribution.
 * Implements BrowserApplicationContribution to integrate command system into application lifecycle.
 */
@injectable()
export class CommandBrowserContribution implements ApplicationBrowserContribution {
  constructor(
    @inject(CommandRegistry)
    private readonly commands: CommandRegistry,
  ) {}

  onStart() {
    this.commands.onStart()
  }
}
