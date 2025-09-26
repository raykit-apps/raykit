import type { BaseWindowConstructorOptions, WebContentsView } from 'electron'
import { BaseWindow } from 'electron'

export class WindowShell {
  public readonly window: BaseWindow
  private currentView?: WebContentsView

  constructor(options?: BaseWindowConstructorOptions) {
    this.window = new BaseWindow({ ...options, show: false })
  }

  get view() { return this.currentView }

  attachView(view: WebContentsView) {
    const oldView = this.detachView(view)
    if (oldView && !oldView.webContents.isDestroyed()) {
      oldView.webContents.close()
    }
  }

  detachView(view: WebContentsView) {
    this.window.setContentView(view)
    const oldView = this.currentView
    this.currentView = view
    return oldView
  }

  destroy() {
    if (this.currentView && !this.currentView.webContents.isDestroyed()) {
      this.currentView.webContents.close()
    }
    if (!this.window.isDestroyed()) {
      this.window.destroy()
    }
    this.currentView = undefined
  }

  show() { this.window.show() }

  hide() { this.window.hide() }

  focus() {
    this.window.focus()
    this.currentView?.webContents.focus()
  }
}
