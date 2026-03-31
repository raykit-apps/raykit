import { ApplicationBrowserContribution, bindViewContribution, WidgetFactory } from '@raykit/core/browser'
import { ContainerModule } from 'inversify'
import { QuickInputContribution } from './quick-input-contribution'
import { QuickSearchContribution } from './quick-search-contribution'
import { QuickSearchWidget } from './quick-search-widget'
import { QuickViewContribution } from './quick-view-contribtion'
import { QuickViewWidget } from './quick-view-widget'

export const quickInputModule = new ContainerModule((options) => {
  options.bind(ApplicationBrowserContribution).to(QuickInputContribution).inSingletonScope()

  options.bind(QuickSearchWidget).toSelf().inSingletonScope()
  options.bind(WidgetFactory).toDynamicValue(context => ({
    id: QuickSearchWidget.ID,
    createWidget: () => context.get(QuickSearchWidget),
  })).inSingletonScope()
  bindViewContribution(options, QuickSearchContribution)

  options.bind(QuickViewWidget).toSelf().inSingletonScope()
  options.bind(WidgetFactory).toDynamicValue(context => ({
    id: QuickViewWidget.ID,
    createWidget: () => context.get(QuickViewWidget),
  })).inSingletonScope()
  bindViewContribution(options, QuickViewContribution)
})
