import type { PluginOption } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss() as PluginOption, sveltekit() as PluginOption],
  build: {
    minify: true,
  },
})
