import type { PluginOption } from '@raykit/cli'
import { defineConfig } from '@raykit/cli'
import tailwindcss from '@tailwindcss/vite'
import swc from 'unplugin-swc'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  build: [
    {
      entry: './src/main/index.ts',
      target: 'main',
      vite: {
        plugins: [swc.vite() as PluginOption],
      },
    },
    {
      entry: './src/preload/index.ts',
      target: 'preload',
    },
  ],
  renderer: {
    entry: './src/browser/index.html',
    vite: {
      plugins: [
        tailwindcss(),
        solidPlugin({
          babel: {
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        }),
      ],
    },
  },
  launchElectron: true,
})
