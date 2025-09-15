import path from 'node:path'
import { isDev } from './environment'

export function getResourcePath(fileName: string) {
  const basePath = isDev()
    ? path.join(import.meta.dirname, '../../resources')
    : path.join(process.resourcesPath)

  return path.join(basePath, fileName)
}
