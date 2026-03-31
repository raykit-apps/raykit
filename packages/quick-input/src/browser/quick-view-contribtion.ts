import { AbstractViewContribution } from '@raykit/core/browser'
import { injectable } from 'inversify'
import { QuickViewWidget } from './quick-view-widget'

@injectable()
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
