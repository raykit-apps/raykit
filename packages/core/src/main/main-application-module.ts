import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { MainApplication } from './main-application'
import { MainApplicationContribution } from './main-application-contribution'

/**
 * Main application module.
 * Bind the main application and its contributions.
 */
export const mainApplicationModule = new ContainerModule((options) => {
  options.bind(MainApplication).toSelf().inSingletonScope()
  bindContributionProvider(options, MainApplicationContribution)
})
