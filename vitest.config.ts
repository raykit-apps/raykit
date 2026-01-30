import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/test/**/*.spec.[tj]s'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    deps: {
      moduleDirectories: ['node_modules', 'apps', 'extensions', 'packages'],
    },
    testTimeout: 20000,
    isolate: false,
  },
  esbuild: {
    target: 'node22',
  },
  publicDir: false,
})
