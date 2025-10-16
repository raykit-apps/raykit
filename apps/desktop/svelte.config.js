import path from 'node:path'
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: '.vite/renderer/main_window',
    }),
    alias: {
      $lib: path.resolve('./src/renderer/lib'),
    },
    files: {
      src: 'src/renderer',
    },
  },
}

export default config
