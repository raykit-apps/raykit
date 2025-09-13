import type { BrowserWindow } from 'electron'
import { getResourcePath } from '@raykit/utils'
import { app, Menu, shell, Tray } from 'electron'

export function createTray(window: BrowserWindow) {
  let icon
  if (process.platform === 'darwin') {
    icon = getResourcePath('./icons/iconTemplate@4x.png')
  }
  else if (process.platform === 'win32') {
    icon = getResourcePath('./icons/icon.ico')
  }
  else {
    icon = getResourcePath('./icons/icon.png')
  }

  const appIcon = new Tray(icon)

  const createContextMenu = () => Menu.buildFromTemplate([
    { label: '帮助文档', click: () => { } },
    { label: '意见反馈', click: () => {
      process.nextTick(() => {
        shell.openExternal('https://github.com/raykit-apps/raykit/issues')
      })
    } },
    { type: 'separator' },
    { label: '系统设置', click: () => { } },
    { label: '关于', role: 'about', click: () => { } },
    { type: 'separator' },
    { label: '重启', click: () => {
      app.relaunch()
      app.quit()
    } },
    { role: 'quit', label: '退出' },
  ])

  appIcon.setToolTip('Raykit')
  appIcon.on('click', () => {
    window.show()
    window.focus()
  })

  appIcon.on('right-click', () => {
    appIcon.popUpContextMenu(createContextMenu())
  })

  return appIcon
}
