import type { ApplicationBrowserContribution } from '@raykit/core/browser'
import { inject } from 'inversify'
import { QuickSearchContribution } from './quick-search-contribution'
import { QuickViewContribution } from './quick-view-contribtion'

export class QuickInputContribution implements ApplicationBrowserContribution {
  constructor(
    @inject(QuickViewContribution) protected readonly quickView: QuickViewContribution,
    @inject(QuickSearchContribution) protected readonly quickSearch: QuickSearchContribution,
  ) {}

  onStart(): void {
    this.quickView.openView()
    this.quickSearch.openView()
  }
}
