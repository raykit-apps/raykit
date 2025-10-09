import type { IInstantiationService } from '@raykit/instantiation'
import { DisposableStore } from '@raykit/common'
import { InstantiationService, ServiceCollection } from '@raykit/instantiation'
import { app } from 'electron'

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
    this.ensureSingleInstance()

    const [instantiationService] = this.createServices()

    try {
      await instantiationService.invokeFunction(async () => {
        //
      })
    } catch (error) {
      //
    }
  }

  private createServices(): [IInstantiationService] {
    const services = new ServiceCollection()
    const disposable = new DisposableStore()
    process.once('exit', () => disposable.dispose())

    return [new InstantiationService(services, true)]
  }

  private ensureSingleInstance() {
    const isSingleInstance = app.requestSingleInstanceLock()

    if (!isSingleInstance) {
      app.quit()
      process.exit(1)
    }
  }
}

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

const raykit = new RaykitMain()
raykit.main()
