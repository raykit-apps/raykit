import { createRequire } from 'node:module'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import ts from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

export default defineConfig([
  {
    input: ['src/index.ts', 'src/cli.ts'],
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/lib-[hash].js',
        format: 'es',
      },
    ],
    external,
    plugins: [
      del({ targets: 'dist', hook: 'buildStart' }),
      json(),
      ts({ compilerOptions: { rootDir: 'src', declaration: true, declarationDir: 'dist/types' } }),
      resolve(),
    ],
    treeshake: {
      moduleSideEffects: false,
    },
  },
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: pkg.types, format: 'es' }],
    plugins: [dts(), del({ targets: 'dist/types', hook: 'buildEnd' })],
  },
])
