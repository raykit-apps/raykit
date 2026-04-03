import type { Event, IDisposable } from '@raykit/base'
import type { BrowserWindow, WebContents } from 'electron'
import type {
  IFrame,
  IOpenMainWindow,
  IOpenStandaloneViewWindow,
  IOpenWindowRequest,
  WindowConfiguration,
  WindowContext,
} from '../common'

export const IWindowMainService = Symbol('IWindowMainService')
export interface IWindowMainService {
  readonly onDidOpenWindow: Event<IAppWindow>
  readonly onDidDestroyWindow: Event<IAppWindow>
  readonly onDidMoveWindow: Event<IWindowMoveEvent>
  readonly onDidMaximizeWindow: Event<IAppWindow>
  readonly onDidUnmaximizeWindow: Event<IAppWindow>
  readonly onDidChangeFullScreen: Event<IWindowFullScreenChangedEvent>
  open: (options?: IOpenOptions) => Promise<IAppWindow[]>
  openMainWindow: (options?: IOpenMainOptions) => Promise<IAppWindow>
  openStandaloneView: (options: IOpenStandaloneViewOptions) => Promise<IAppWindow>
  getWindows: () => IAppWindow[]
  getWindowById: (id: number) => IAppWindow | undefined
  revealWindow: (window: IAppWindow) => void
}

export interface IOpenOptions extends IOpenWindowRequest {}
export interface IOpenMainOptions extends IOpenMainWindow {}
export interface IOpenStandaloneViewOptions extends IOpenStandaloneViewWindow {}

export const IAppWindow = Symbol('IAppWindow')
export interface IAppWindow extends IDisposable {
  readonly onDidClose: Event<void>
  readonly onDidMove: Event<IFrame>
  readonly onDidMaximize: Event<void>
  readonly onDidUnmaximize: Event<void>
  readonly onDidEnterFullScreen: Event<void>
  readonly onDidLeaveFullScreen: Event<void>
  readonly id: number
  readonly win: BrowserWindow
  readonly config: WindowConfiguration
  readonly context: WindowContext
  init: (options: ICreateWindowOptions) => Promise<void>
  load: () => Promise<void>
  getBounds: () => IFrame
  matches: (webContents: WebContents) => boolean
  focus: () => void
  show: () => void
  hide: () => void
  close: () => void
}

export interface IWindowMoveEvent {
  window: IAppWindow
  bounds: IFrame
}

export interface IWindowFullScreenChangedEvent {
  window: IAppWindow
  fullscreen: boolean
}

export const WindowFactory = Symbol('WindowFactory')
export interface WindowFactory {
  (options: ICreateWindowOptions): Promise<IAppWindow>
}

export interface ICreateWindowOptions {
  config: WindowConfiguration
  context: WindowContext
}
