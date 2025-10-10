import type { IInstantiationService } from '@raykit/instantiation'
import path from 'node:path'
import { DisposableStore } from '@raykit/common'
import { InstantiationService, ServiceCollection } from '@raykit/instantiation'
import { app, BrowserWindow } from 'electron'

class RaykitMain {
  main(): void {
    try {
      this.startup()
    } catch (error) {
      console.error(error)
      app.exit(1)
    }
  }

  private async startup(): Promise<void> {
    // const [instantiationService] = this.createServices()

    // 创建窗口
    const window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        // preload: path.join(__dirname, 'preload.js'),
      },
    })
    window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/app`)

    try {
      // await instantiationService.invokeFunction(async () => {
      //   //
      // })
    } catch {
      //
    }
  }

  private createServices(): [IInstantiationService] {
    const services = new ServiceCollection()
    const disposable = new DisposableStore()
    process.once('exit', () => disposable.dispose())

    return [new InstantiationService(services, true)]
  }
}

const raykit = new RaykitMain()
raykit.main()

// class RaykitMain {
//   windowStore?: WindowStore

//   main() {
//     try {
//       this.startup()
//     } catch (error) {
//       console.error(error)
//       app.exit(1)
//     }
//   }

//   private async startup(): Promise<void> {
//     this.ensureSingleInstance()

//     this.windowStore = initWindowStore()
//     await app.whenReady()

//     const winShell = await this.windowStore?.createMainWindow()
//     createTray(winShell)

//     this.registerAppEventListeners()
//   }

//   private async ensureSingleInstance() {
//     const isSingleInstance = app.requestSingleInstanceLock()

//     if (!isSingleInstance) {
//       app.quit()
//       process.exit(1)
//     }
//   }

//   private registerAppEventListeners() {
//     app.on('second-instance', async () => {
//       const winShell = await this.windowStore?.mainWindow
//       if (winShell) {
//         if (winShell.window.isMinimized()) {
//           winShell.window.restore()
//         }
//         winShell.show()
//         winShell.focus()
//       }
//     })

//     app.on('activate', async () => {
//       this.windowStore?.createMainWindow()
//     })

//     app.on('window-all-closed', () => {
//       if (process.platform !== 'darwin') {
//         this.windowStore?.quit()
//         app.quit()
//       }
//     })

//     app.on('will-quit', () => {
//       globalShortcut.unregisterAll()
//     })
//   }
// }
