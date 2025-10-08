import type { WindowStore } from '@raykit/window'
import { initWindowStore } from '@raykit/window'
import { app, globalShortcut } from 'electron'
import { createTray } from './common/tray'

class RaykitMain {
  windowStore?: WindowStore

  main() {
    try {
      this.startup()
    } catch (error) {
      console.error(error)
      app.exit(1)
    }
  }

  private async startup(): Promise<void> {
    this.ensureSingleInstance()

    this.windowStore = initWindowStore()
    await app.whenReady()

    const winShell = await this.windowStore?.createMainWindow()
    createTray(winShell)

    this.registerAppEventListeners()
  }

  private async ensureSingleInstance() {
    const isSingleInstance = app.requestSingleInstanceLock()

    if (!isSingleInstance) {
      app.quit()
      process.exit(1)
    }
  }

  private registerAppEventListeners() {
    app.on('second-instance', async () => {
      const winShell = await this.windowStore?.mainWindow
      if (winShell) {
        if (winShell.window.isMinimized()) {
          winShell.window.restore()
        }
        winShell.show()
        winShell.focus()
      }
    })

    app.on('activate', async () => {
      this.windowStore?.createMainWindow()
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.windowStore?.quit()
        app.quit()
      }
    })

    app.on('will-quit', () => {
      globalShortcut.unregisterAll()
    })
  }
}

const raykit = new RaykitMain()
raykit.main()
