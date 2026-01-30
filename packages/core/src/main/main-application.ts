import type { MaybePromise } from '@raykit/base'
import { ContributionProvider } from '@raykit/base'
import { inject, injectable, named } from 'inversify'
import { MainApplicationContribution } from './main-application-contribution'

@injectable()
export class MainApplication {
  constructor(
    @inject(ContributionProvider)
    @named(MainApplicationContribution)
    protected readonly contributions: ContributionProvider<MainApplicationContribution>,
  ) {}

  /**
   * Start the main application.
   *
   * Start up consists of the following steps:
   * - start contributions (initialize, configure, onStart)
   * - complete startup
   */
  async start(): Promise<void> {
    await this.startContributions()
  }

  /**
   * Initialize and start the contributions.
   */
  protected async startContributions(): Promise<void> {
    const promises = []
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.onStart) {
        promises.push(contribution.onStart(this))
      }
    }
    await Promise.all(promises)
  }

  /**
   * Stop the contributions.
   */
  stopContributions(): void {
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.onStop) {
        contribution.onStop(this)
      }
    }
  }
}
