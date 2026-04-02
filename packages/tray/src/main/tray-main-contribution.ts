import type { ApplicationMainContribution } from '@raykit/core/main'
import type { MenuItemConstructorOptions } from 'electron'
import type { TrayMenuItem } from '../common'
import { Buffer } from 'node:buffer'
import { Disposable, toDisposable } from '@raykit/base'
import { IWindowMainService } from '@raykit/windows/main'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import { inject, injectable } from 'inversify'
import { TrayMenuRegistry } from '../common'

@injectable()
export class TrayMainContribution extends Disposable implements ApplicationMainContribution {
  protected tray?: Tray

  constructor(
    @inject(TrayMenuRegistry)
    protected readonly trayMenuRegistry: TrayMenuRegistry,
    @inject(IWindowMainService)
    protected readonly windowMainService: IWindowMainService,
  ) {
    super()
  }

  async onStart(): Promise<void> {
    await this.trayMenuRegistry.onStart()

    if (this.tray) {
      return
    }

    const tray = new Tray(createDefaultTrayIcon())
    this.tray = tray

    tray.setToolTip(app.getName())
    tray.on('click', () => {
      void this.openMainWindow().catch((error) => {
        console.error('Could not show the main window from the tray.', error)
      })
    })

    this._register(this.trayMenuRegistry.onTrayMenuItemsChanged(() => {
      this.updateContextMenu()
    }))
    this._register(toDisposable(() => {
      tray.removeAllListeners()
      tray.destroy()
      if (this.tray === tray) {
        this.tray = undefined
      }
    }))

    this.updateContextMenu()
  }

  onStop(): void {
    this.dispose()
  }

  protected updateContextMenu(): void {
    if (!this.tray) {
      return
    }

    this.tray.setContextMenu(
      Menu.buildFromTemplate(this.trayMenuRegistry.getItems().map(item => this.toMenuItem(item))),
    )
  }

  protected async openMainWindow(): Promise<void> {
    const existingWindow = BrowserWindow.getAllWindows()[0]
    if (!existingWindow) {
      await this.windowMainService.open({})
      return
    }

    if (existingWindow.isMinimized()) {
      existingWindow.restore()
    }
    if (!existingWindow.isVisible()) {
      existingWindow.show()
    }

    existingWindow.focus()
  }

  protected toMenuItem(item: TrayMenuItem): MenuItemConstructorOptions {
    const itemClick = item.click
    const click = itemClick
      ? () => {
          void Promise.resolve(itemClick()).catch((error) => {
            console.error(`Could not execute tray menu item '${item.id}'.`, error)
          })
        }
      : undefined

    return {
      accelerator: item.accelerator,
      checked: item.checked,
      click,
      enabled: item.enabled,
      label: item.label,
      submenu: item.submenu?.map(child => this.toMenuItem(child)),
      type: item.type,
      visible: item.visible,
    }
  }
}

function createDefaultTrayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#006A6B" />
      <path d="M9 9h14l-4.2 7 5.2 7H19l-3.1-4.8L12.8 23H8l5.2-7L9 9zm6.9 3-2.2 3.6 2.3 3.5 2.2-3.5L15.9 12z" fill="#F6FFF9" />
    </svg>
  `.trim()

  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`)
}
