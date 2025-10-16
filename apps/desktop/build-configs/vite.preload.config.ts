import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: '.vite/build',
    lib: {
      formats: ['es'],
      entry: 'src/node/preload.ts',
      fileName: 'preload',
    },
    minify: true,
  },
})
