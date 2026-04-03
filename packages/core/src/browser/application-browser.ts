import type { MaybePromise } from '@raykit/base'
import type { WindowContext } from '@raykit/windows'
import { ContributionProvider } from '@raykit/base'
import { Widget } from '@raykit/widgets'
import { WindowBrowserService } from '@raykit/windows/browser'
import { inject, injectable, named, optional } from 'inversify'
import { ApplicationBrowserContribution } from './application-browser-contribution'
import { ApplicationBrowserStateService } from './application-browser-state'
import { ApplicationShell } from './shell/application-shell'
import { WidgetService } from './widget-service'

@injectable()
export class ApplicationBrowser {
  protected currentWindowContext?: WindowContext

  constructor(
    @inject(ContributionProvider)
    @named(ApplicationBrowserContribution)
    protected readonly contributions: ContributionProvider<ApplicationBrowserContribution>,
    @inject(ApplicationShell) protected readonly _shell: ApplicationShell,
    @inject(ApplicationBrowserStateService) protected readonly stateService: ApplicationBrowserStateService,
    @inject(WidgetService) protected readonly widgetService: WidgetService,
    @inject(WindowBrowserService) @optional() protected readonly windowBrowserService?: WindowBrowserService,
  ) {}

  get shell(): ApplicationShell {
    return this._shell
  }

  /**
   * Start the browser application.
   *
   * Start up consists of the following steps:
   * - start contributions (initialize, configure, onStart)
   * - complete startup
   */
  async start(): Promise<void> {
    await this.configureCurrentWindow()
    await this.startContributions()
    this.stateService.state = 'started-contributions'

    const host = await this.getHost()
    this.attachShell(host)
    this.stateService.state = 'attached-shell'

    await this.initializeLayout()
    this.stateService.state = 'initialized-layout'

    this.registerEventListeners()

    this.stateService.state = 'ready'
  }

  protected getHost(): Promise<HTMLElement> {
    if (document.body) {
      return Promise.resolve(document.body)
    }
    return new Promise<HTMLElement>(resolve =>
      window.addEventListener('load', () => resolve(document.body), { once: true }),
    )
  }

  protected registerEventListeners(): void {
    window.addEventListener('resize', () => this.shell.update())
  }

  protected attachShell(host: HTMLElement): void {
    // const ref = this.getStartupIndicator(host)
    Widget.attach(this.shell, host)
  }

  protected async initializeLayout(): Promise<void> {
    await this.initializeCurrentWindowLayout()
    await this.createDefaultLayout()
  }

  protected async configureCurrentWindow(): Promise<void> {
    this.currentWindowContext = await this.windowBrowserService?.getCurrentWindowContext()

    if (this.currentWindowContext?.role === 'view' && this.currentWindowContext.viewId) {
      this.shell.configureStandaloneView(this.currentWindowContext.viewId)
    }
  }

  protected async initializeCurrentWindowLayout(): Promise<void> {
    if (this.currentWindowContext?.role !== 'view' || !this.currentWindowContext.viewId) {
      return
    }

    const widget = await this.widgetService.getOrCreateWidget(this.currentWindowContext.viewId)
    await this.shell.addWidget(widget, { area: 'main' })
  }

  protected async createDefaultLayout(): Promise<void> {
    for (const contribution of this.contributions.getContributions()) {
      if (contribution.initializeLayout) {
        await this.measure(`${contribution.constructor.name}.initializeLayout`, () => contribution.initializeLayout!(this))
      }
    }
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
