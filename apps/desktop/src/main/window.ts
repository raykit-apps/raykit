import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'

export async function createWindow() {
  const win = new BrowserWindow({
    height: 475,
    width: 750,
    minHeight: 400,
    minWidth: 400,
    maxHeight: 900,
    maxWidth: 1200,
    center: true,
    resizable: true,
    skipTaskbar: true,
    // show: false,
    frame: false,
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  }
  else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.on('show', () => {
    win.webContents.openDevTools({ mode: 'detach' })
  })

  return win
}
