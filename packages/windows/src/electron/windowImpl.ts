import type { IBaseWindow } from '@raykit/window/electron'
import type { BrowserWindowConstructorOptions } from 'electron'
import type electron from 'electron'
import { Disposable } from '@raykit/common'

export abstract class BaseWindow extends Disposable implements IBaseWindow {
  abstract readonly id: number

  protected _win: electron.BaseWindow | null = null
  get win() { return this._win }
  protected setWin(win: electron.BaseWindow, options?: BrowserWindowConstructorOptions) {
    this._win = win
  }

  constructor() {
    super()
  }
}
