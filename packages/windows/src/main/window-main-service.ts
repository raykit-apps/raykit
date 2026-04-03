import type { Event } from '@raykit/base'
import type { IpcMainInvokeEvent, WebContents } from 'electron'
import type {
  IOpenWindowRequest,
  WindowConfiguration,
  WindowContext,
  WindowRendererConfigurationPayload,
} from '../common'
import type {
  IAppWindow,
  IOpenMainOptions,
  IOpenOptions,
  IOpenStandaloneViewOptions,
  IWindowFullScreenChangedEvent,
  IWindowMainService,
  IWindowMoveEvent,
} from './window'
import { Disposable, DisposableStore, Emitter, toDisposable } from '@raykit/base'
import { app, BrowserWindow, ipcMain } from 'electron'
import { inject, injectable } from 'inversify'
import {
  MainWindowConfigurationId,
  ViewWindowConfigurationId,
  WindowChannels,
  WindowConfigurationRegistry,
} from '../common'
import { WindowFactory } from './window'
import {
  createDefaultMainWindowConfiguration,
  createDefaultStandaloneViewWindowConfiguration,
} from './window-default-configuration'
import { getWindowReuseKey, inferWindowRole, mergeWindowConfiguration } from './window-options'

interface ResolvedWindowOpenRequest {
  config: WindowConfiguration
  context: WindowContext
  reuseKey?: string
}

@injectable()
export class WindowMainService extends Disposable implements IWindowMainService {
  protected readonly windows = new Map<number, IAppWindow>()
  protected readonly windowEventDisposables = new Map<number, DisposableStore>()
  protected readonly reuseKeyToWindowId = new Map<string, number>()
  protected handlersRegistered = false

  protected readonly onDidOpenWindowEmitter = this._register(new Emitter<IAppWindow>())
  readonly onDidOpenWindow: Event<IAppWindow> = this.onDidOpenWindowEmitter.event

  protected readonly onDidDestroyWindowEmitter = this._register(new Emitter<IAppWindow>())
  readonly onDidDestroyWindow: Event<IAppWindow> = this.onDidDestroyWindowEmitter.event

  protected readonly onDidMoveWindowEmitter = this._register(new Emitter<IWindowMoveEvent>())
  readonly onDidMoveWindow: Event<IWindowMoveEvent> = this.onDidMoveWindowEmitter.event

  protected readonly onDidMaximizeWindowEmitter = this._register(new Emitter<IAppWindow>())
  readonly onDidMaximizeWindow: Event<IAppWindow> = this.onDidMaximizeWindowEmitter.event

  protected readonly onDidUnmaximizeWindowEmitter = this._register(new Emitter<IAppWindow>())
  readonly onDidUnmaximizeWindow: Event<IAppWindow> = this.onDidUnmaximizeWindowEmitter.event

  protected readonly onDidChangeFullScreenEmitter = this._register(new Emitter<IWindowFullScreenChangedEvent>())
  readonly onDidChangeFullScreen: Event<IWindowFullScreenChangedEvent> = this.onDidChangeFullScreenEmitter.event

  constructor(
    @inject(WindowFactory)
    protected readonly windowFactory: WindowFactory,
    @inject(WindowConfigurationRegistry)
    protected readonly windowConfigurationRegistry: WindowConfigurationRegistry,
  ) {
    super()
  }

  async open(options: IOpenOptions = {}) {
    await this.windowConfigurationRegistry.onStart()
    this.registerIpcHandlers()
    const win = await this.doOpen(this.resolveOpenRequest(options))
    return [win]
  }

  async openMainWindow(options: IOpenMainOptions = {}) {
    await this.windowConfigurationRegistry.onStart()
    this.registerIpcHandlers()
    return this.doOpen(this.resolveMainWindowRequest(options))
  }

  async openStandaloneView(options: IOpenStandaloneViewOptions) {
    await this.windowConfigurationRegistry.onStart()
    this.registerIpcHandlers()
    return this.doOpen(this.resolveStandaloneViewRequest(options))
  }

  getWindows(): IAppWindow[] {
    return [...this.windows.values()]
  }

  getWindowById(id: number): IAppWindow | undefined {
    return this.windows.get(id)
  }

  revealWindow(window: IAppWindow): void {
    const win = window.win

    if (win.isMinimized()) {
      win.restore()
    }
    if (!win.isVisible()) {
      win.show()
    }

    win.focus()
  }

  override dispose(): void {
    if (this._store.isDisposed) {
      return
    }

    for (const windowStore of this.windowEventDisposables.values()) {
      windowStore.dispose()
    }
    this.windowEventDisposables.clear()

    for (const window of this.windows.values()) {
      window.dispose()
    }
    this.windows.clear()
    this.reuseKeyToWindowId.clear()

    super.dispose()
  }

  protected async doOpen(request: ResolvedWindowOpenRequest): Promise<IAppWindow> {
    const reusableWindow = request.reuseKey ? this.getReusableWindow(request.reuseKey) : undefined
    if (reusableWindow) {
      this.revealWindow(reusableWindow)
      return reusableWindow
    }

    const window = await this.windowFactory({
      config: request.config,
      context: request.context,
    })

    this.registerWindow(window, request.reuseKey)
    await window.load()
    return window
  }

  protected registerWindow(window: IAppWindow, reuseKey?: string): void {
    const windowId = window.id
    const windowStore = new DisposableStore()

    this.windows.set(windowId, window)
    this.windowEventDisposables.set(windowId, windowStore)
    if (reuseKey) {
      this.reuseKeyToWindowId.set(reuseKey, windowId)
    }

    windowStore.add(window.onDidMaximize(() => {
      this.onDidMaximizeWindowEmitter.fire(window)
    }))
    windowStore.add(window.onDidUnmaximize(() => {
      this.onDidUnmaximizeWindowEmitter.fire(window)
    }))
    windowStore.add(window.onDidMove((bounds) => {
      this.onDidMoveWindowEmitter.fire({ bounds, window })
    }))
    windowStore.add(window.onDidEnterFullScreen(() => {
      this.onDidChangeFullScreenEmitter.fire({ fullscreen: true, window })
    }))
    windowStore.add(window.onDidLeaveFullScreen(() => {
      this.onDidChangeFullScreenEmitter.fire({ fullscreen: false, window })
    }))
    windowStore.add(window.onDidClose(() => {
      if (!this.windows.has(windowId)) {
        return
      }

      this.unregisterWindow(windowId, reuseKey)
      this.onDidDestroyWindowEmitter.fire(window)
    }))

    this.onDidOpenWindowEmitter.fire(window)
  }

  protected unregisterWindow(windowId: number, reuseKey?: string): void {
    this.windows.delete(windowId)

    const windowStore = this.windowEventDisposables.get(windowId)
    this.windowEventDisposables.delete(windowId)
    windowStore?.dispose()

    if (reuseKey) {
      this.reuseKeyToWindowId.delete(reuseKey)
    }
  }

  protected getReusableWindow(reuseKey: string): IAppWindow | undefined {
    const windowId = this.reuseKeyToWindowId.get(reuseKey)
    if (windowId === undefined) {
      return undefined
    }
    return this.windows.get(windowId)
  }

  protected resolveOpenRequest(options: IOpenOptions): ResolvedWindowOpenRequest {
    const configurationId = options.configId ?? MainWindowConfigurationId
    const baseConfiguration = this.getBaseConfiguration(configurationId)
    const config = mergeWindowConfiguration(baseConfiguration, options.window)
    const context: WindowContext = {
      configurationId,
      role: config.role ?? inferWindowRole(configurationId),
    }

    return {
      config,
      context,
      reuseKey: this.shouldReuseWindow(options)
        ? getWindowReuseKey(config, context, options.forceReuseWindow)
        : undefined,
    }
  }

  protected resolveMainWindowRequest(options: IOpenMainOptions): ResolvedWindowOpenRequest {
    const baseConfiguration = this.getBaseConfiguration(MainWindowConfigurationId)
    const config = mergeWindowConfiguration(baseConfiguration, {
      ...options.window,
      id: MainWindowConfigurationId,
      role: 'main',
    })
    const context: WindowContext = {
      configurationId: MainWindowConfigurationId,
      role: 'main',
    }

    return {
      config,
      context,
      reuseKey: options.forceNewWindow
        ? undefined
        : getWindowReuseKey(config, context, options.forceReuseWindow),
    }
  }

  protected resolveStandaloneViewRequest(options: IOpenStandaloneViewOptions): ResolvedWindowOpenRequest {
    const configurationId = options.configId ?? ViewWindowConfigurationId
    const baseConfiguration = this.getBaseConfiguration(configurationId)
    const config = mergeWindowConfiguration(baseConfiguration, {
      ...options.window,
      id: configurationId,
      role: 'view',
      title: options.viewLabel ?? baseConfiguration.title,
    })
    const context: WindowContext = {
      configurationId,
      role: 'view',
      viewId: options.viewId,
      viewLabel: options.viewLabel,
    }

    return {
      config,
      context,
      reuseKey: options.forceNewWindow
        ? undefined
        : getWindowReuseKey(config, context, options.forceReuseWindow),
    }
  }

  protected getBaseConfiguration(configurationId: string): WindowConfiguration {
    const contributedConfiguration = this.windowConfigurationRegistry.getWindowConfiguration(configurationId)

    if (configurationId === MainWindowConfigurationId) {
      return mergeWindowConfiguration(createDefaultMainWindowConfiguration(), contributedConfiguration)
    }

    return mergeWindowConfiguration(
      createDefaultStandaloneViewWindowConfiguration(),
      contributedConfiguration ?? {
        id: configurationId,
        role: inferWindowRole(configurationId),
      },
    )
  }

  protected shouldReuseWindow(options: IOpenWindowRequest): boolean {
    if (options.forceNewWindow) {
      return false
    }
    if (options.forceReuseWindow) {
      return true
    }
    return options.preferNewWindow !== true
  }

  protected registerIpcHandlers(): void {
    if (this.handlersRegistered) {
      return
    }

    this.handlersRegistered = true

    ipcMain.handle(WindowChannels.fetchShellEnv, () => ({ ...process.env }))
    ipcMain.handle(WindowChannels.resolveConfiguration, (event) => {
      return this.createRendererConfiguration(event)
    })
    ipcMain.handle(WindowChannels.open, async (_event, request?: IOpenOptions) => {
      const [window] = await this.open(request)
      return window.id
    })
    ipcMain.handle(WindowChannels.openMain, async (_event, request?: IOpenMainOptions) => {
      const window = await this.openMainWindow(request)
      return window.id
    })
    ipcMain.handle(WindowChannels.openStandaloneView, async (_event, request: IOpenStandaloneViewOptions) => {
      const window = await this.openStandaloneView(request)
      return window.id
    })

    this._register(toDisposable(() => {
      ipcMain.removeHandler(WindowChannels.fetchShellEnv)
      ipcMain.removeHandler(WindowChannels.resolveConfiguration)
      ipcMain.removeHandler(WindowChannels.open)
      ipcMain.removeHandler(WindowChannels.openMain)
      ipcMain.removeHandler(WindowChannels.openStandaloneView)
      this.handlersRegistered = false
    }))
  }

  protected createRendererConfiguration(event: IpcMainInvokeEvent): WindowRendererConfigurationPayload & Record<string, unknown> {
    const appWindow = this.getWindowByWebContents(event.sender)
    const browserWindow = appWindow?.win ?? BrowserWindow.fromWebContents(event.sender)

    return {
      appRoot: process.cwd(),
      nls: {
        language: undefined,
        messages: [],
      },
      product: {
        name: app.getName(),
        version: app.getVersion(),
      },
      userEnv: {},
      window: appWindow?.context ?? {
        configurationId: MainWindowConfigurationId,
        role: 'main',
      },
      windowId: browserWindow?.id ?? -1,
    }
  }

  protected getWindowByWebContents(webContents: WebContents): IAppWindow | undefined {
    for (const window of this.windows.values()) {
      if (window.matches(webContents)) {
        return window
      }
    }
    return undefined
  }
}
