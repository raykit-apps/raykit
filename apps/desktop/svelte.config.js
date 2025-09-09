import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'out/renderer',
      assets: 'out/renderer',
    }),
    alias: { '@/*': './src/renderer/lib/*' },
    files: {
      lib: 'src/renderer/lib',
      routes: 'src/renderer/routes',
      appTemplate: 'src/renderer/app.html',
    },
  },
}

export default config
