import type { JSX } from 'solid-js/jsx-runtime'
import { SolidWidget } from '@raykit/widgets'
import { injectable, postConstruct } from 'inversify'

@injectable()
export class QuickViewWidget extends SolidWidget {
  public static readonly ID = 'quick-view-widget'

  public static readonly LABEL = 'Quick View'

  @postConstruct()
  protected init(): void {
    this.doInit()
  }

  protected doInit(): void {
    this.id = QuickViewWidget.ID
    this.title.label = QuickViewWidget.LABEL
  }

  protected render(): JSX.Element {
    return <div>中间视图</div>
  }
}
