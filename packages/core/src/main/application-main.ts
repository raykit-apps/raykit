import { ContributionProvider } from '@raykit/base'
import { inject, injectable, named } from 'inversify'
import { ApplicationMainContribution } from './application-main-contribution'

@injectable()
export class ApplicationMain {
  constructor(
    @inject(ContributionProvider)
    @named(ApplicationMainContribution)
    protected readonly contributions: ContributionProvider<ApplicationMainContribution>,
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
