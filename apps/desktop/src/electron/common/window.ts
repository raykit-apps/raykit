import path from 'node:path'
import { BrowserWindow } from 'electron'

export function createWindow() {
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
