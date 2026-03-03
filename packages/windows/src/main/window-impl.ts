import type { IAppWindow } from './window'
import { BrowserWindow } from 'electron'
import { injectable } from 'inversify'

@injectable()
export class AppWindow implements IAppWindow {
  private _id: number | null = null
  get id() {
    return this._id
  }

  private _win: BrowserWindow | null = null
  get win() {
    return this._win
  }

  constructor() {}

  async init() {
    // const url = await this.getMainViewUrl()
    this._win = new BrowserWindow({
      title: 'Raykit',
      // url,
    })
    this._id = this._win.id
  }

  async getMainViewUrl(): Promise<string> {
    return 'http://localhost:5173'
  }
}
