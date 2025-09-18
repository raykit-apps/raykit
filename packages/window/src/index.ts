import path from 'node:path'
import { BrowserWindow } from 'electron'

export function initWindow() {
  return new WindowStore()
}

export class WindowStore {
  private mainWindow: BrowserWindow
  private windows: Map<string, BrowserWindow>

  constructor() {
    this.windows = new Map()
    this.mainWindow = this.createMainWindow()
  }

  createMainWindow() {
    const window = new BrowserWindow({
      width: 750,
      height: 475,
      minWidth: 400,
      minHeight: 400,
      maxWidth: 1200,
      maxHeight: 900,
      center: true,
      show: false,
      skipTaskbar: true,
      resizable: true,
      frame: false,
    })

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
      window.webContents.on('did-frame-finish-load', () => {
        window.webContents.openDevTools({ mode: 'detach' })
      })
    }
    else {
      window.loadFile(path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
    }

    return window
  }

  createWindow(label: string, opt?: any) {
    const window = new BrowserWindow({})

    return window
  }

  getMainWindow() {
    return this.mainWindow
  }

  detachMainWindow(label: string) {
    this.windows.set(label, this.mainWindow)
    this.mainWindow = this.createMainWindow()
  }

  getWindow(label: string) {
    return this.windows.get(label)
  }
}
