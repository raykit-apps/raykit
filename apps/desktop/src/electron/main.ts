import type { BrowserWindow } from 'electron'
import { app, globalShortcut, ipcMain } from 'electron'
import started from 'electron-squirrel-startup'
import { createTray } from './common/tray'
import { createWindow } from './common/window'

class App {
  public window?: BrowserWindow

  constructor() {
    if (started) {
      app.quit()
    }
    const isSingleInstance = app.requestSingleInstanceLock()
    if (!isSingleInstance) {
      app.quit()
      process.exit(0)
    }
    else {
      this.beforeReady()
      this.onReady()
      this.onRunning()
      this.onQuit()
    }
  }

  beforeReady() {
    if (process.platform === 'darwin') {
      // if (isProd && !app.isInApplicationsFolder()) {
      //   app.moveToApplicationsFolder()
      // }
      // else {
      app.dock?.hide()
      // }
    }
  }

  onReady() {
    const readyFn = () => {
      this.window = createWindow()
      createTray(this.window)
    }

    app.whenReady().then(readyFn).catch(e => console.error('Failed create window:', e))
  }

  onRunning() {
    app.on('second-instance', () => {
      const win = this.window
      if (win) {
        if (win.isMinimized()) {
          win.restore()
        }
        win.focus()
      }
    })
    app.on('activate', async () => {
      if (!this.window) {
        this.window = createWindow()
      }
    })
  }

  onQuit() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('will-quit', () => {
      globalShortcut.unregisterAll()
    })
  }
}

export default new App()
