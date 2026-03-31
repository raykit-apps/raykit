import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { bindStatusBar } from './actions-bar'
import { ApplicationBrowser } from './application-browser'
import { ApplicationBrowserContribution } from './application-browser-contribution'
import { ApplicationBrowserStateService } from './application-browser-state'
import { ApplicationShell } from './shell/application-shell'
import { WidgetFactory, WidgetService } from './widget-service'

/**
 * Browser application module.
 * Bind the browser application and its contributions.
 */
export const applicationBrowserModule = new ContainerModule((options) => {
  options.bind(ApplicationBrowser).toSelf().inSingletonScope()
  options.bind(ApplicationBrowserStateService).toSelf().inSingletonScope()
  bindContributionProvider(options, ApplicationBrowserContribution)

  bindStatusBar(options)

  options.bind(ApplicationShell).toSelf().inSingletonScope()

  bindContributionProvider(options, WidgetFactory)
  options.bind(WidgetService).toSelf().inSingletonScope()
})
