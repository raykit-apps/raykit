import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { WebContentsView } from 'electron'
import { WindowShell } from './window-shell'

export class WindowStore {
  private mainLabel?: string
  private shells: Map<string, WindowShell>

  constructor() {
    this.shells = new Map()
  }

  async createMainWindow() {
    if (this.mainLabel)
      return this.shells.get(this.mainLabel) as WindowShell

    const winShell = new WindowShell({
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
      // backgroundMaterial: 'mica',
      type: 'panel',
      vibrancy: 'content',
    })

    const view = new WebContentsView({
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(import.meta.dirname, `./preload.js`),
        nodeIntegrationInSubFrames: true,
      },
    })

    winShell.attachView(view)

    const label = this.register(winShell)

    this.mainLabel = label

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      await view.webContents.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/app`)
      winShell.window.on('show', () => {
        view.webContents.openDevTools({ mode: 'detach' })
      })
    } else {
      await view.webContents.loadFile(path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
    }

    return winShell
  }

  get mainWindow() {
    return this.createMainWindow()
  }

  getWindow(label: string) {
    return this.shells.get(label)
  }

  private register(shell: WindowShell): string {
    const label = randomUUID()
    this.shells.set(label, shell)
    shell.window.once('closed', () => {
      this.shells.delete(label)
      shell.destroy()
    })
    return label
  }

  createExtensionWindow() {}

  detachMainView() {}

  close(label: string) {
    this.shells.get(label)?.destroy()
    this.shells.delete(label)
  }

  quit() {
    this.shells.forEach(s => s.destroy())
    this.shells.clear()
  }
}
