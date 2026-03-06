import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { CommandContribution, CommandRegistry, CommandService } from '../common'

import { CommandBrowserContribution } from './command-browser-contribution'

/**
 * Browser command module.
 * Binds the command registry and browser command contribution.
 */
export const commandBrowserModule = new ContainerModule((options) => {
  options.bind(CommandRegistry).toSelf().inSingletonScope()
  options.bind(CommandService).to(CommandRegistry).inSingletonScope()

  options.bind(CommandBrowserContribution).toSelf().inSingletonScope()

  // Bind contribution provider for CommandContribution
  bindContributionProvider(options, CommandContribution)
})
