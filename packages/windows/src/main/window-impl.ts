import type { WebContents } from 'electron'
import type { IFrame, WindowConfiguration, WindowContext } from '../common'
import type { IAppWindow, ICreateWindowOptions } from './window'
import type { DisplayLike } from './window-state'
import fs from 'node:fs'
import path, { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Disposable, Emitter, Event, toDisposable } from '@raykit/base'
import { BrowserWindow, screen } from 'electron'
import { injectable } from 'inversify'
import { toBrowserWindowOptions } from './window-options'

@injectable()
export class AppWindow extends Disposable implements IAppWindow {
  protected _id = -1
  get id() {
    return this._id
  }

  protected _win?: BrowserWindow
  get win() {
    if (!this._win) {
      throw new Error('Window has not been initialized yet.')
    }
    return this._win
  }

  protected _config?: WindowConfiguration
  get config() {
    if (!this._config) {
      throw new Error('Window configuration has not been initialized yet.')
    }
    return this._config
  }

  protected _context?: WindowContext
  get context() {
    if (!this._context) {
      throw new Error('Window context has not been initialized yet.')
    }
    return this._context
  }

  protected readonly onDidCloseEmitter = this._register(new Emitter<void>())
  readonly onDidClose: Event<void> = this.onDidCloseEmitter.event

  protected readonly onDidMoveEmitter = this._register(new Emitter<IFrame>())
  readonly onDidMove: Event<IFrame> = this.onDidMoveEmitter.event

  protected readonly onDidMaximizeEmitter = this._register(new Emitter<void>())
  readonly onDidMaximize: Event<void> = this.onDidMaximizeEmitter.event

  protected readonly onDidUnmaximizeEmitter = this._register(new Emitter<void>())
  readonly onDidUnmaximize: Event<void> = this.onDidUnmaximizeEmitter.event

  protected readonly onDidEnterFullScreenEmitter = this._register(new Emitter<void>())
  readonly onDidEnterFullScreen: Event<void> = this.onDidEnterFullScreenEmitter.event

  protected readonly onDidLeaveFullScreenEmitter = this._register(new Emitter<void>())
  readonly onDidLeaveFullScreen: Event<void> = this.onDidLeaveFullScreenEmitter.event

  constructor() {
    super()

    this._register(toDisposable(() => {
      this._win = undefined
      this._config = undefined
      this._context = undefined
      this._id = -1
    }))
  }

  async init(options: ICreateWindowOptions) {
    if (this._win) {
      return
    }

    this._config = options.config
    this._context = options.context

    const mainDir = dirname(fileURLToPath(import.meta.url))
    const preloadPath = this.resolvePreloadPath(mainDir)

    this._win = new BrowserWindow(toBrowserWindowOptions(
      this.config,
      {
        additionalArguments: ['--raykit-window-config=raykit:window-config'],
        preload: preloadPath,
      },
      screen.getAllDisplays() as DisplayLike[],
    ))

    this._id = this._win.id

    this.registerBrowserWindowListeners(this._win)

    this._win.setMenuBarVisibility(false)
    if (this.config.maximized && !this.config.fullscreen) {
      this._win.maximize()
    }
  }

  async load() {
    const rendererUrl = process.env.ELECTRON_RENDERER_URL
    if (rendererUrl) {
      await this.win.loadURL(rendererUrl)
    } else {
      const mainDir = dirname(fileURLToPath(import.meta.url))
      await this.win.loadFile(path.join(mainDir, '../renderer/index.html'))
    }

    if (this.shouldOpenDevTools()) {
      this.win.webContents.openDevTools()
    }
  }

  focus() {
    this.win.focus()
  }

  show() {
    this.win.show()
  }

  hide() {
    this.win.hide()
  }

  close() {
    this.win.close()
  }

  getBounds(): IFrame {
    const bounds = this.win.getBounds()
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    }
  }

  matches(webContents: WebContents): boolean {
    return this.win.webContents.id === webContents.id
  }

  protected shouldOpenDevTools(): boolean {
    return (
      this.context.role === 'main'
      && (
        process.env.NODE_ENV === 'development'
        || process.env.NODE_ENV_ELECTRON_VITE === 'development'
      )
    )
  }

  protected resolvePreloadPath(mainDir: string): string | undefined {
    const preloadDir = resolve(mainDir, '../preload')
    const candidates = ['index.js', 'index.mjs', 'index.cjs']

    for (const candidate of candidates) {
      const preloadPath = path.join(preloadDir, candidate)
      if (fs.existsSync(preloadPath)) {
        return preloadPath
      }
    }

    console.warn(`Could not resolve preload entry from '${preloadDir}'. Renderer sandbox APIs will be unavailable.`)
    return undefined
  }

  protected registerBrowserWindowListeners(win: BrowserWindow): void {
    this._register(Event.fromNodeEventEmitter(win, 'maximize')(() => this.onDidMaximizeEmitter.fire()))
    this._register(Event.fromNodeEventEmitter(win, 'unmaximize')(() => this.onDidUnmaximizeEmitter.fire()))
    this._register(Event.fromNodeEventEmitter(win, 'enter-full-screen')(() => this.onDidEnterFullScreenEmitter.fire()))
    this._register(Event.fromNodeEventEmitter(win, 'leave-full-screen')(() => this.onDidLeaveFullScreenEmitter.fire()))
    this._register(Event.fromNodeEventEmitter(win, 'move', () => this.getBounds())(bounds => this.onDidMoveEmitter.fire(bounds)))
    this._register(Event.fromNodeEventEmitter(win, 'closed')(() => {
      this.onDidCloseEmitter.fire()
      this.dispose()
    }))
  }
}
