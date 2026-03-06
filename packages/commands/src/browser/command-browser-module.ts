import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { CommandContribution, CommandRegistry, ICommandRegistry } from '../common'

import { CommandBrowserContribution } from './command-browser-contribution'

/**
 * Browser command module.
 * Binds the command registry and browser command contribution.
 */
export const commandBrowserModule = new ContainerModule((options) => {
  // Bind CommandRegistry as singleton
  options.bind<ICommandRegistry>(ICommandRegistry).to(CommandRegistry).inSingletonScope()

  // Bind BrowserCommandContribution
  options.bind(CommandBrowserContribution).toSelf().inSingletonScope()

  // Bind contribution provider for CommandContribution
  bindContributionProvider(options, CommandContribution)
})
