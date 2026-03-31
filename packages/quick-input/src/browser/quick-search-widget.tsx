import type { JSX } from 'solid-js/jsx-runtime'
import { SolidWidget } from '@raykit/widgets'
import { injectable, postConstruct } from 'inversify'

@injectable()
export class QuickSearchWidget extends SolidWidget {
  public static readonly ID = 'quick-search-widget'

  public static readonly LABEL = 'Quick Search'

  @postConstruct()
  protected init(): void {
    this.doInit()
  }

  protected doInit(): void {
    this.id = QuickSearchWidget.ID
    this.title.label = QuickSearchWidget.LABEL
  }

  protected render(): JSX.Element {
    return <div>顶部搜索栏</div>
  }
}
