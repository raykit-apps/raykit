import type { IDisposable } from '@raykit/common'
import type electron from 'electron'
import type { INativeWindowConfiguration } from '../common/window'

export interface IBaseWindow extends IDisposable {
  readonly id: number
  readonly win: electron.BaseWindow | null

  focus(): void

  hide(): void
  show(): void
}

export interface IHubWindow extends IBaseWindow {
  readonly views: electron.View[]

  close(): void
}

export interface IExtensionWindow extends IBaseWindow {
  readonly config?: INativeWindowConfiguration

  readonly view: electron.View

  load(): void

  close(): void
}

export interface IWindowState {
  width?: number
  height?: number
  x?: number
  y?: number
}
