import type { IAppWindow } from './window'
import path from 'node:path'
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
    this._win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    // Load the renderer URL from environment variable
    const rendererUrl = process.env.ELECTRON_RENDERER_URL
    if (rendererUrl) {
      this._win.loadURL(rendererUrl)
    } else {
    // Fallback to loading from file system for preview mode
      this._win.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      this._win.webContents.openDevTools()
    }
    this._id = this._win.id
  }
}
