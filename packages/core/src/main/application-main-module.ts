import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { ApplicationMain } from './application-main'
import { ApplicationMainContribution } from './application-main-contribution'

/**
 * Main application module.
 * Bind the main application and its contributions.
 */
export const applicationMainModule = new ContainerModule((options) => {
  options.bind(ApplicationMain).toSelf().inSingletonScope()
  bindContributionProvider(options, ApplicationMainContribution)
})
