import type { BaseWindow } from 'electron'
// import { createTray } from '@electron/system/tray'
import { app, globalShortcut } from 'electron'
import { createWindow } from './window'

class App {
  public window?: BaseWindow
  // public plugin?: PluginHandler

  constructor() {
    // 防止多实例
    const isSingleInstance = app.requestSingleInstanceLock()
    if (!isSingleInstance) {
      app.quit()
      process.exit(0)
    }
    else {
      // this.plugin = new PluginHandler()
      this.beforeReady()
      this.onReady()
      this.onRunning()
      this.onQuit()
    }
  }

  beforeReady() {
    // 系统托盘
    // if (isMac) {
    //   if (isProd && !app.isInApplicationsFolder()) {
    //     app.moveToApplicationsFolder()
    //   }
    //   else {
    //     app.dock?.hide()
    //   }
    // }
  }

  onReady() {
    const readyFunction = async () => {
      this.window = await createWindow()
      // createTray(this.window)
    }

    app.whenReady().then(readyFunction).catch(e => console.error('Failed create window:', e))
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
        this.window = await createWindow()
      }
    })
  }

  onQuit() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // 注销全局快捷键
    app.on('will-quit', () => {
      globalShortcut.unregisterAll()
    })
  }
}

export default new App()
