import type { JSX } from 'solid-js/jsx-runtime'
import { SolidWidget } from '@raykit/widgets'
import { injectable } from 'inversify'

@injectable()
export class QuickSearchWidget extends SolidWidget {
  public static readonly ID = 'quick-search-widget'

  public static readonly LABEL = 'Quick Search'

  protected render(): JSX.Element {
    return <div>顶部搜索栏</div>
  }
}
