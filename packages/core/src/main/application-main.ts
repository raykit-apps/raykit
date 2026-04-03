import { ContributionProvider } from '@raykit/base'
import { IWindowMainService } from '@raykit/windows/main'
import { app } from 'electron'
import { inject, injectable, named } from 'inversify'
import { ApplicationMainContribution } from './application-main-contribution'

@injectable()
export class ApplicationMain {
  constructor(
    @inject(ContributionProvider)
    @named(ApplicationMainContribution)
    protected readonly contributions: ContributionProvider<ApplicationMainContribution>,
    @inject(IWindowMainService)
    protected readonly windowMainService: IWindowMainService,
  ) {}

  /**
   * Start the main application.
   *
   * Start up consists of the following steps:
   * - start contributions (initialize, configure, onStart)
   * - complete startup
   */
  async start(): Promise<void> {
    this.hookApplicationEvents()
    await app.whenReady()
    await this.startContributions()
    this.openFirstWindow()
  }

  hookApplicationEvents() {
    app.on('will-quit', this.onWillQuit.bind(this))
  }

  protected onWillQuit(): void {
    this.stopContributions()
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
  protected stopContributions(): void {
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.onStop) {
        contribution.onStop(this)
      }
    }
  }

  protected async openFirstWindow() {
    await this.windowMainService.openMainWindow()
  }
}
