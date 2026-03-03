import type { ContributionProvider } from '@raykit/base'
import type { ApplicationBrowser, ApplicationBrowserContribution } from '@raykit/core/browser'
import type { ICommandRegistry } from '../common'
import { inject, injectable, named } from 'inversify'
import { CommandContribution, CommandRegistry } from '../common'

/**
 * Browser command contribution.
 * Implements BrowserApplicationContribution to integrate command system into application lifecycle.
 */
@injectable()
export class CommandBrowserContribution implements ApplicationBrowserContribution {
  constructor(
    @inject(CommandRegistry)
    private readonly registry: ICommandRegistry,
    @inject(Symbol.for('ContributionProvider'))
    @named(CommandContribution)
    private readonly contributionProvider: ContributionProvider<CommandContribution>,
  ) {}

  configure(_app: ApplicationBrowser): void {
    // Collect all command contributions and register their commands
    const contributions = this.contributionProvider.getContributions()
    for (const contribution of contributions) {
      contribution.registerCommands(this.registry)
    }
  }
}
