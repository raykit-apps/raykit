import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 输出目录
    outDir: 'dist',
    // 清空输出目录
    emptyOutDir: true,
    // 目标环境 - Node.js 22
    target: 'node22',
    // 构建为库模式
    lib: {
      // 入口文件
      entry: resolve(__dirname, 'src/exts-server.ts'),
      // 输出文件名
      fileName: 'exts-server',
      // 输出格式 - ES模块
      formats: ['es'],
    },
    rollupOptions: {
      // Node.js内置模块标记为外部依赖（包含node:前缀）
      external: [
        'http',
        'https',
        'url',
        'path',
        'fs',
        'os',
        'crypto',
        'events',
        'stream',
        'util',
        'buffer',
        'querystring',
        'zlib',
        'net',
        'tls',
        'dns',
        'child_process',
        'cluster',
        'worker_threads',
        'perf_hooks',
        'async_hooks',
        'inspector',
        // 支持 node: 前缀
        'node:http',
        'node:https',
        'node:url',
        'node:path',
        'node:fs',
        'node:os',
        'node:crypto',
        'node:events',
        'node:stream',
        'node:util',
        'node:buffer',
        'node:querystring',
        'node:zlib',
        'node:net',
        'node:tls',
        'node:dns',
        'node:child_process',
        'node:cluster',
        'node:worker_threads',
        'node:perf_hooks',
        'node:async_hooks',
        'node:inspector',
      ],
      output: {
        // 输出单个文件
        inlineDynamicImports: true,
      },
    },
    // 生成source map
    sourcemap: false,
    // 不进行代码混淆，保持可读性
    minify: true,
  },
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // TypeScript配置
  esbuild: {
    target: 'node22',
    platform: 'node',
    format: 'esm',
  },
  // 确保不会被视为浏览器环境
  define: {
    global: 'globalThis',
  },
  // Node.js环境配置
  ssr: {
    target: 'node',
    noExternal: [],
  },
})
