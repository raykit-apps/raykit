import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { ApplicationBrowser } from './application-browser'
import { ApplicationBrowserContribution } from './application-browser-contribution'

/**
 * Browser application module.
 * Bind the browser application and its contributions.
 */
export const applicationBrowserModule = new ContainerModule((options) => {
  options.bind(ApplicationBrowser).toSelf().inSingletonScope()
  bindContributionProvider(options, ApplicationBrowserContribution)
})
