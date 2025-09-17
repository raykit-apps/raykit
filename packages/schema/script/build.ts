import path from 'node:path'
import { ExtensionManifest } from '@raykit/ext-manifest'
import fs from 'fs-extra'
import { getJsonSchema } from '../src'

const file = path.join(import.meta.dirname, '../.schema', 'raykit.schema.json')

fs.outputFileSync(file, getJsonSchema(ExtensionManifest))
