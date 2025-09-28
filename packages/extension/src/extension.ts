import path from 'node:path'
import { ExtensionManifest } from '@raykit/manifest'
import { readJSON } from 'fs-extra'

export async function loadExtensionManifest(extensionDir: string) {
  const extensionManifestPath = path.join(extensionDir, 'package.json')
  const manifestContent = await readJSON(extensionManifestPath)
  return ExtensionManifest.parse(manifestContent)
}
