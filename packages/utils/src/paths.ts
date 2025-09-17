import path from 'node:path'
import { app } from 'electron'
import { isDev, isLinux, isWindows } from './environment'

function once(fn: () => string) {
  let cached: string

  return () => {
    if (!cached) {
      cached = fn()
    }
    return cached
  }
}

export const getResourceDir = once(() => {
  return isDev()
    ? path.join(import.meta.dirname, '../../resources')
    : path.join(process.resourcesPath)
})

export const getHomeDir = once(() => {
  return app.getPath('home')
})

export const getConfigDir = once(() => {
  if (isWindows()) {
    return ''
  }
  else if (isLinux()) {
    return ''
  }
  else {
    return ''
  }
})

export const getDataDir = once(() => {
  return app.getPath('userData')
})

export const getTempDir = once(() => {
  return path.join(app.getPath('temp'), 'Raykit')
})

export const getLogsDir = once(() => {
  return app.getPath('logs')
})

export const getLogFile = once(() => {
  return path.join(getLogsDir(), 'Raykit.log')
})

export const getExtensionsDir = once(() => {
  return path.join(getHomeDir(), '.raykit/extensions')
})
