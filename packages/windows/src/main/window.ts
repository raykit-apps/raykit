// import type { Event } from '@raykit/base'
import type { BrowserWindow } from 'electron'
import type { IOpenWindowOptions } from '../common'

export const IWindowMainService = Symbol('IWindowMainService')
export interface IWindowMainService {
  open: (options: IOpenOptions) => Promise<IAppWindow[]>
}

export interface IOpenOptions extends IOpenWindowOptions {

}

export const IAppWindow = Symbol('IAppWindow')
export interface IAppWindow {
  // readonly onDidMaximize: Event<void>
  // readonly onDidUnmaximize: Event<void>
  // readonly onDidClose: Event<void>

  readonly id: number | null
  readonly win: BrowserWindow | null

  init: () => Promise<void>

  // focus: () => void

  // close: () => void

  // hide: () => void
}

export const WindowFactory = Symbol('WindowFactory')
export interface WindowFactory {
  (): Promise<IAppWindow>
}
