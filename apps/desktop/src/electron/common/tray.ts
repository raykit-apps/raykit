import type { WindowShell } from '@raykit/window'
import path from 'node:path'
import { getResourceDir, isMac, isWindows } from '@raykit/utils'
import { app, Menu, shell, Tray } from 'electron'

export function createTray(winShell: WindowShell) {
  let icon
  if (isMac()) {
    icon = path.join(getResourceDir(), './icons/iconTemplate@4x.png')
  }
  else if (isWindows()) {
    icon = path.join(getResourceDir(), './icons/icon.ico')
  }
  else {
    icon = path.join(getResourceDir(), './icons/icon.png')
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
    winShell.show()
    winShell.focus()
  })

  appIcon.on('right-click', () => {
    appIcon.popUpContextMenu(createContextMenu())
  })

  return appIcon
}
