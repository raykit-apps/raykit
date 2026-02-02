import type { ICommandRegistry } from '../common'
import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { CommandContribution, CommandRegistry, CommandRegistryImpl } from '../common'
import { BrowserCommandContribution } from './browser-command-contribution'

/**
 * Browser command module.
 * Binds the command registry and browser command contribution.
 */
export const browserCommandModule = new ContainerModule((options) => {
  // Bind CommandRegistry as singleton
  options.bind<ICommandRegistry>(CommandRegistry).to(CommandRegistryImpl).inSingletonScope()

  // Bind BrowserCommandContribution
  options.bind(BrowserCommandContribution).toSelf().inSingletonScope()

  // Bind contribution provider for CommandContribution
  bindContributionProvider(options, CommandContribution)
})
