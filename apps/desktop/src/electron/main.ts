import type { WindowStore } from '@raykit/window'
import { initWindowStore } from '@raykit/window'
import { app, globalShortcut } from 'electron'
import started from 'electron-squirrel-startup'
import { createTray } from './common/tray'

if (started) {
  app.quit()
}
const isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

const windowStore: WindowStore = initWindowStore()

function readyFn() {
  const winShell = windowStore.createMainWindow()
  if (winShell)
    createTray(winShell)
}

app.whenReady().then(readyFn).catch(e => console.error('Failed create window:', e))

app.on('second-instance', () => {
  const winShell = windowStore?.mainWindow
  if (winShell) {
    if (winShell.window.isMinimized()) {
      winShell.window.restore()
    }
    winShell.show()
    winShell.focus()
  }
})
app.on('activate', async () => {
  windowStore?.createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    windowStore.quit()
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// class App {
//   public windowStore?: WindowStore

//   constructor() {
//     if (started) {
//       app.quit()
//     }
//     const isSingleInstance = app.requestSingleInstanceLock()
//     if (!isSingleInstance) {
//       app.quit()
//       process.exit(0)
//     }
//     else {
//       this.windowStore = initWindowStore()
//       this.beforeReady()
//       this.onReady()
//       this.onRunning()
//       this.onQuit()
//     }
//   }

//   beforeReady() {
//     if (process.platform === 'darwin') {
//       // if (isProd && !app.isInApplicationsFolder()) {
//       //   app.moveToApplicationsFolder()
//       // }
//       // else {
//       // app.dock?.hide()
//       // }
//     }
//   }

//   onReady() {
//     const readyFn = () => {
//       const winShell = this.windowStore?.createMainWindow()
//       if (winShell)
//         createTray(winShell)
//     }

//     app.whenReady().then(readyFn).catch(e => console.error('Failed create window:', e))
//   }

//   onRunning() {
//     app.on('second-instance', () => {
//       const winShell = this.windowStore?.mainWindow
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
//   }

//   onQuit() {
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

// export default new App()
