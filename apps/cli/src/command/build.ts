import type { InlineConfig } from 'vite'
import { build as viteBuild } from 'vite'
import { resolveConfig } from '../config'

export async function build(inlineConfig: InlineConfig = {}): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'production'
  const config = await resolveConfig(inlineConfig, 'build', 'production')

  if (!config.config) {
    return
  }

  // DOTO viteBuild
  viteBuild()
}
