import type { MaybePromise } from '@raykit/base'
import { ContributionProvider } from '@raykit/base'
import { inject, injectable, named } from 'inversify'
import { BrowserApplicationContribution } from './browser-application-contribution'

@injectable()
export class BrowserApplication {
  constructor(
    @inject(ContributionProvider)
    @named(BrowserApplicationContribution)
    protected readonly contributions: ContributionProvider<BrowserApplicationContribution>,
  ) {}

  /**
   * Start the browser application.
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
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.initialize) {
        try {
          await this.measure(`${contribution.constructor.name}.initialize`, () => contribution.initialize!())
        } catch (error) {
          console.error('Could not initialize contribution', error)
        }
      }
    }

    for (const contribution of this.contributions.getContributions()) {
      if (contribution.configure) {
        try {
          await this.measure(`${contribution.constructor.name}.configure`, () => contribution.configure?.(this))
        } catch (error) {
          console.error('Could not configure contribution', error)
        }
      }
    }

    for (const contribution of this.contributions.getContributions()) {
      if (contribution.onStart) {
        try {
          await this.measure(`${contribution.constructor.name}.onStart`, () => contribution.onStart?.(this))
        } catch (error) {
          console.error('Could not start contribution', error)
        }
      }
    }
  }

  /**
   * Stop the contributions.
   */
  stopContributions(): void {
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.onStop) {
        try {
          contribution.onStop?.(this)
        } catch (error) {
          console.error('Could not stop contribution', error)
        }
      }
    }
  }

  /**
   * Measure the execution time of a function.
   */
  protected async measure<T>(name: string, fn: () => MaybePromise<T>): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const elapsed = performance.now() - start
      if (elapsed > 100) {
        console.warn(`Slow contribution ${name}: ${elapsed.toFixed(2)}ms`)
      }
    }
  }
}
