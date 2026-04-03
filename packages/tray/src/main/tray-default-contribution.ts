import type { TrayContribution, TrayMenuRegistry } from '../common'
import { IWindowMainService } from '@raykit/windows/main'
import { app, BrowserWindow } from 'electron'
import { inject, injectable } from 'inversify'

@injectable()
export class DefaultTrayContribution implements TrayContribution {
  constructor(
    @inject(IWindowMainService)
    protected readonly windowMainService: IWindowMainService,
  ) {}

  registerTrayItems(registry: TrayMenuRegistry): void {
    const appName = app.getName() || 'Raykit'

    registry.registerTrayItem({
      id: 'tray.open',
      label: `Open ${appName}`,
      order: 100,
      click: () => this.openMainWindow(),
    })
    registry.registerTrayItem({
      id: 'tray.hide',
      label: `Hide ${appName}`,
      order: 200,
      click: () => this.hideMainWindow(),
    })
    registry.registerTrayItem({
      id: 'tray.separator.default',
      type: 'separator',
      order: 300,
    })
    registry.registerTrayItem({
      id: 'tray.quit',
      label: `Quit ${appName}`,
      order: 400,
      click: () => app.quit(),
    })
  }

  protected async openMainWindow(): Promise<void> {
    const existingWindow = BrowserWindow.getAllWindows()[0]
    if (!existingWindow) {
      await this.windowMainService.openMainWindow()
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

  protected hideMainWindow(): void {
    for (const window of BrowserWindow.getAllWindows()) {
      window.hide()
    }
  }
}
