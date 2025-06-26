import type { PluginOption } from 'vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sveltekit } from '@sveltejs/kit/vite'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [
    sveltekit() as PluginOption,
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
    }),
  ],
  clearScreen: false,
  server: {
    port: 4399,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  build: {
    minify: true,
  },
})
