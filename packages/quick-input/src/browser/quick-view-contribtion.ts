import { AbstractViewContribution } from '@raykit/core/browser'
import { injectable, injectFromHierarchy } from 'inversify'
import { QuickViewWidget } from './quick-view-widget'

@injectable()
@injectFromHierarchy()
export class QuickViewContribution extends AbstractViewContribution<QuickViewWidget> {
  constructor() {
    super({
      widgetId: QuickViewWidget.ID,
      widgetName: QuickViewWidget.LABEL,
      defaultWidgetOptions: {
        area: 'main',
      },
    })
  }
}
