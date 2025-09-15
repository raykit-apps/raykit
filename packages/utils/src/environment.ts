import { app } from 'electron'

export function isDev() {
  return process.env.NODE_ENV === 'development' || !app.isPackaged
}

export function isProd() {
  return process.env.NODE_ENV === 'production' && app.isPackaged
}

export function isTest() {
  return process.env.NODE_ENV === 'test'
}

export function isWindows() {
  return process.platform === 'win32'
}

export function isMac() {
  return process.platform === 'darwin'
}

export function isLinux() {
  return process.platform === 'linux'
}
