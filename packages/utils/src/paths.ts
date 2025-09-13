import path from 'node:path'
import { app } from 'electron'

export function getResourcePath(fileName: string) {
  const isDev = !app.isPackaged

  const basePath = isDev
    ? path.join(import.meta.dirname, '../../resources')
    : path.join(process.resourcesPath)

  return path.join(basePath, fileName)
}
