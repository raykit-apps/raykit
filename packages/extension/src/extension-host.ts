import type { ExtensionManifest } from '@raykit/manifest'
import path from 'node:path'
import { getExtensionsDir } from '@raykit/utils'
import { readJSON } from 'fs-extra'

export function initExtensionStore() {
  return new ExtensionStore(getExtensionsDir())
}

export interface ExtensionIndex {
  extensions: Map<string, ExtensionManifest>
}

export class ExtensionStore {
  private extensionDir: string
  private indexPath: string
  private extensionIndex?: ExtensionIndex

  constructor(extensionDir: string) {
    const indexPath = path.join(extensionDir, 'extension.json')

    const initIndexContent = async () => {
      await readJSON(this.indexPath).then((indexContent: ExtensionIndex) => {
        this.extensionsUpdated(indexContent)
      })
    }

    initIndexContent()

    this.extensionDir = extensionDir
    this.indexPath = indexPath
  }

  extensionsUpdated(index: ExtensionIndex) {}
}
