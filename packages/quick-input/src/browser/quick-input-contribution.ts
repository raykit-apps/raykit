import type { ApplicationBrowserContribution } from '@raykit/core/browser'
import { ApplicationBrowserStateService } from '@raykit/core/browser'
import { inject, injectable } from 'inversify'
import { QuickSearchContribution } from './quick-search-contribution'
import { QuickViewContribution } from './quick-view-contribtion'

@injectable()
export class QuickInputContribution implements ApplicationBrowserContribution {
  constructor(
    @inject(ApplicationBrowserStateService) protected readonly stateService: ApplicationBrowserStateService,
    @inject(QuickViewContribution) protected readonly quickView: QuickViewContribution,
    @inject(QuickSearchContribution) protected readonly quickSearch: QuickSearchContribution,
  ) {}

  onStart(): void {
    this.stateService.reachedState('attached-shell')
      .then(() => Promise.all([
        this.quickSearch.openView(),
        this.quickView.openView(),
      ]))
      .catch((error) => {
        console.error('Could not open quick input views', error)
      })
  }
}
