import { AbstractViewContribution } from '@raykit/core/browser'
import { injectable, injectFromHierarchy } from 'inversify'
import { QuickSearchWidget } from './quick-search-widget'

@injectable()
@injectFromHierarchy()
export class QuickSearchContribution extends AbstractViewContribution<QuickSearchWidget> {
  constructor() {
    super({
      widgetId: QuickSearchWidget.ID,
      widgetName: QuickSearchWidget.LABEL,
      defaultWidgetOptions: {
        area: 'top',
      },
    })
  }
}
