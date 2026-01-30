import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { BrowserApplication } from './browser-application'
import { BrowserApplicationContribution } from './browser-application-contribution'

/**
 * Browser application module.
 * Bind the browser application and its contributions.
 */
export const browserApplicationModule = new ContainerModule((options) => {
  options.bind(BrowserApplication).toSelf().inSingletonScope()
  bindContributionProvider(options, BrowserApplicationContribution)
})
