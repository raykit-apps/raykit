import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: '.vite/build',
    lib: {
      formats: ['es'],
      entry: 'src/electron/main.ts',
      fileName: 'main',
    },
  },
})
