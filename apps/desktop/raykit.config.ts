import { defineConfig } from '@raykit/cli'

export default defineConfig({
  build: [
    {
      entry: './src/main/index.ts',
      target: 'main',
    },
    {
      entry: './src/preload/index.ts',
      target: 'preload',
    },
  ],
  renderer: {
    entry: './src/browser/index.html',
  },
  launchElectron: true,
})
