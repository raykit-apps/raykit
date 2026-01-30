import type { OutputOptions } from 'rollup'
import type { LibraryOptions, Plugin } from 'vite'
import { builtinModules } from 'node:module'
import path from 'node:path'
import colors from 'picocolors'
import { mergeConfig, normalizePath } from 'vite'
import { getElectronChromeTarget, getElectronNodeTarget, supportESM } from '../electron'
import { loadPackageData } from '../utils'

export interface ElectronPluginOptions {
  root?: string
}

function processEnvDefine(): Record<string, string> {
  return {
    'process.env': `process.env`,
    'global.process.env': `global.process.env`,
    'globalThis.process.env': `globalThis.process.env`,
  }
}

function resolveBuildOutputs(
  outputs: OutputOptions | OutputOptions[] | undefined,
  libOptions: LibraryOptions | false,
): OutputOptions | OutputOptions[] | undefined {
  if (libOptions && !Array.isArray(outputs)) {
    const libFormats = libOptions.formats || []
    return libFormats.map(format => ({ ...outputs, format }))
  }
  return outputs
}

/**
 * Vite plugin to preset config for Electron Main process
 */
export function electronMainConfigPresetPlugin(options: ElectronPluginOptions): Plugin {
  return {
    name: 'vite:electron-main-config-preset',
    apply: 'build',
    enforce: 'pre',
    config(config): void {
      const root = options?.root || process.cwd()

      const nodeTarget = getElectronNodeTarget()
      const pkg = loadPackageData() || { type: 'commonjs' }

      const format = pkg.type && pkg.type === 'module' && supportESM() ? 'es' : 'cjs'

      const defaultConfig: any = {
        resolve: {
          mainFields: ['module', 'jsnext:main', 'jsnext'],
          conditions: ['node'],
        },
        build: {
          outDir: path.resolve(root, 'out', 'main'),
          target: nodeTarget,
          assetsDir: 'chunks',
          rollupOptions: {
            external: ['electron', /^electron\/.+/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
            output: {
              entryFileNames: '[name].js',
            },
          },
          reportCompressedSize: false,
          minify: false,
        },
      }

      const build = config.build || {}
      const rollupOptions = build.rollupOptions || {}
      if (!rollupOptions.input) {
        const libOptions = build.lib
        const outputOptions = rollupOptions.output
        const formats = libOptions && libOptions.formats && libOptions.formats.length > 0
          ? []
          : [outputOptions && !Array.isArray(outputOptions) && outputOptions.format ? outputOptions.format : format]
        if (defaultConfig.build.lib) {
          defaultConfig.build.lib.formats = formats
        } else {
          defaultConfig.build.lib = { formats }
        }
      } else {
        defaultConfig.build.rollupOptions.output.format = format
      }

      defaultConfig.build.rollupOptions.output.assetFileNames = path.posix.join(
        build.assetsDir || defaultConfig.build.assetsDir,
        '[name]-[hash].[ext]',
      )

      const buildConfig = mergeConfig(defaultConfig.build, build)
      config.build = buildConfig

      config.resolve = mergeConfig(defaultConfig.resolve, config.resolve ?? {})

      config.define = config.define || {}
      config.define = { ...processEnvDefine(), ...config.define }

      config.publicDir = config.publicDir ?? 'resources'
      config.build.copyPublicDir = false
      config.build.modulePreload = false
      config.build.ssr = true
      config.build.ssrEmitAssets = true
      config.ssr = { ...config.ssr, ...{ noExternal: true } }
    },
  }
}

/**
 * Vite plugin to validate config for Electron Main process
 */
export function electronMainConfigValidatorPlugin(): Plugin {
  return {
    name: 'vite:electron-main-config-validator',
    apply: 'build',
    enforce: 'post',
    configResolved(config): void {
      const build = config.build
      if (!build.target) {
        throw new Error('build.target option is required in the electron vite main config.')
      } else {
        const targets = Array.isArray(build.target) ? build.target : [build.target]
        if (targets.some(t => !t.startsWith('node'))) {
          throw new Error('The electron vite main config build.target option must be "node?".')
        }
      }

      const libOptions = build.lib
      const rollupOptions = build.rollupOptions

      const resolvedOutputs = resolveBuildOutputs(rollupOptions.output, libOptions)

      if (resolvedOutputs) {
        const outputs = Array.isArray(resolvedOutputs) ? resolvedOutputs : [resolvedOutputs]
        if (outputs.length > 1) {
          throw new Error('The electron vite main config does not support multiple outputs.')
        } else {
          const output = outputs[0]
          if (['es', 'cjs'].includes(output.format || '')) {
            if (output.format === 'es' && !supportESM()) {
              throw new Error(
                'The electron vite main config output format does not support "es", '
                + 'you can upgrade electron to the latest version or switch to "cjs" format.',
              )
            }
          } else {
            throw new Error(
              `The electron vite main config output format must be "cjs"${supportESM() ? ' or "es"' : ''}.`,
            )
          }
        }
      }
    },
  }
}

/**
 * Vite plugin to preset config for Electron Preload script
 */
export function electronPreloadConfigPresetPlugin(options: ElectronPluginOptions): Plugin {
  return {
    name: 'vite:electron-preload-config-preset',
    apply: 'build',
    enforce: 'pre',
    config(config): void {
      const root = options?.root || process.cwd()
      const nodeTarget = getElectronNodeTarget()

      const defaultConfig: any = {
        resolve: {
          mainFields: ['module', 'jsnext:main', 'jsnext'],
          conditions: ['browser', 'node'],
        },
        build: {
          outDir: path.resolve(root, 'out', 'preload'),
          target: nodeTarget,
          assetsDir: 'chunks',
          rollupOptions: {
            external: ['electron', /^electron\/.+/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
            output: {
              format: 'cjs',
              entryFileNames: '[name].js',
              chunkFileNames: '[name].js',
              assetFileNames: '[name].[ext]',
            },
          },
          reportCompressedSize: false,
          minify: false,
          modulePreload: false,
          ssr: true,
          ssrEmitAssets: true,
          copyPublicDir: false,
          emptyOutDir: false,
        },
        ssr: {
          noExternal: true,
        },
      }

      const buildConfig = mergeConfig(defaultConfig.build, config.build || {})
      config.build = buildConfig
      config.resolve = mergeConfig(defaultConfig.resolve, config.resolve ?? {})

      config.define = { ...processEnvDefine(), ...config.define }
    },
  }
}

/**
 * Vite plugin to validate config for Electron Preload script
 */
export function electronPreloadConfigValidatorPlugin(): Plugin {
  return {
    name: 'vite:electron-preload-config-validator',
    apply: 'build',
    enforce: 'post',
    configResolved(config): void {
      const build = config.build
      if (!build.target) {
        throw new Error('build.target option is required in the electron vite preload config.')
      } else {
        const targets = Array.isArray(build.target) ? build.target : [build.target]
        if (targets.some(t => !t.startsWith('node'))) {
          throw new Error('The electron vite preload config build.target option must be "node?".')
        }
      }

      const libOptions = build.lib
      const rollupOptions = build.rollupOptions

      const resolvedOutputs = resolveBuildOutputs(rollupOptions.output, libOptions)

      if (resolvedOutputs) {
        const outputs = Array.isArray(resolvedOutputs) ? resolvedOutputs : [resolvedOutputs]
        if (outputs.length > 1) {
          throw new Error('The electron vite preload config does not support multiple outputs.')
        } else {
          const output = outputs[0]
          if (['es', 'cjs'].includes(output.format || '')) {
            if (output.format === 'es' && !supportESM()) {
              throw new Error(
                'The electron vite preload config output format does not support "es", '
                + 'you can upgrade electron to the latest version or switch to "cjs" format.',
              )
            }
          } else {
            throw new Error(
              `The electron vite preload config output format must be "cjs"${supportESM() ? ' or "es"' : ''}.`,
            )
          }
        }
      }
    },
  }
}

/**
 * Vite plugin to preset config for Generic Node process
 */
export function electronNodeConfigPresetPlugin(options: ElectronPluginOptions): Plugin {
  return {
    name: 'vite:electron-node-config-preset',
    apply: 'build',
    enforce: 'pre',
    config(config): void {
      const root = options?.root || process.cwd()
      const nodeTarget = getElectronNodeTarget()
      const pkg = loadPackageData() || { type: 'commonjs' }
      const format = pkg.type === 'module' ? 'es' : 'cjs'

      const defaultConfig: any = {
        resolve: {
          mainFields: ['module', 'jsnext:main', 'jsnext'],
          conditions: ['node'],
        },
        build: {
          outDir: path.resolve(root, 'out', 'node'),
          target: nodeTarget,
          rollupOptions: {
            external: [...builtinModules.flatMap(m => [m, `node:${m}`])],
            output: {
              format,
            },
          },
          reportCompressedSize: false,
          minify: false,
          ssr: true,
          ssrEmitAssets: true,
          copyPublicDir: false,
        },
        ssr: {
          noExternal: true,
        },
      }

      const buildConfig = mergeConfig(defaultConfig.build, config.build || {})
      config.build = buildConfig
      config.resolve = mergeConfig(defaultConfig.resolve, config.resolve ?? {})

      config.define = { ...processEnvDefine(), ...config.define }
    },
  }
}

/**
 * Vite plugin to validate config for Generic Node process
 */
export function electronNodeConfigValidatorPlugin(): Plugin {
  return {
    name: 'vite:electron-node-config-validator',
    apply: 'build',
    enforce: 'post',
    configResolved(config): void {
      const build = config.build
      if (!build.target) {
        throw new Error('build.target option is required in the electron vite node config.')
      } else {
        const targets = Array.isArray(build.target) ? build.target : [build.target]
        if (targets.some(t => !t.startsWith('node'))) {
          throw new Error('The electron vite node config build.target option must be "node?".')
        }
      }

      const libOptions = build.lib
      const rollupOptions = build.rollupOptions

      const resolvedOutputs = resolveBuildOutputs(rollupOptions.output, libOptions)

      if (resolvedOutputs) {
        const outputs = Array.isArray(resolvedOutputs) ? resolvedOutputs : [resolvedOutputs]
        if (outputs.length > 1) {
          throw new Error('The electron vite node config does not support multiple outputs.')
        } else {
          const output = outputs[0]
          if (['es', 'cjs'].includes(output.format || '')) {
            // Node target is usually flexible, but we check if we are in strict mode or something
            // For now, just validation of format existence is enough.
          } else {
            throw new Error(
              `The electron vite node config output format must be "cjs" or "es".`,
            )
          }
        }
      }
    },
  }
}

/**
 * Vite plugin to preset config for Electron Renderer process
 */
export function electronRendererConfigPresetPlugin(options?: ElectronPluginOptions): Plugin {
  return {
    name: 'vite:electron-renderer-config-preset',
    enforce: 'pre',
    config(config): void {
      const root = options?.root ?? process.cwd()

      config.base
        = config.mode === 'production' || process.env.NODE_ENV_ELECTRON_VITE === 'production' ? './' : config.base
      config.root = config.root ?? './src/browser'

      const chromeTarget = getElectronChromeTarget()

      const emptyOutDir = (): boolean => {
        let outDir = config.build?.outDir
        if (outDir) {
          if (!path.isAbsolute(outDir)) {
            outDir = path.resolve(root, outDir)
          }
          const resolvedRoot = normalizePath(path.resolve(root))
          return normalizePath(outDir).startsWith(`${resolvedRoot}/`)
        }
        return true
      }

      const defaultConfig = {
        build: {
          outDir: path.resolve(root, 'out', 'renderer'),
          target: chromeTarget,
          modulePreload: { polyfill: false },
          reportCompressedSize: false,
          minify: false,
          emptyOutDir: emptyOutDir(),
        },
      }

      if (config.build?.outDir) {
        config.build.outDir = path.resolve(root, config.build.outDir)
      }

      const buildConfig = mergeConfig(defaultConfig.build, config.build ?? {})
      config.build = buildConfig

      config.envDir = config.envDir || path.resolve(root)
    },
  }
}

/**
 * Vite plugin to validate config for Electron Renderer process
 */
export function electronRendererConfigValidatorPlugin(): Plugin {
  return {
    name: 'vite:electron-renderer-config-validator',
    enforce: 'post',
    configResolved(config): void {
      if (config.base !== './' && config.base !== '/') {
        config.logger.warn(colors.yellow('(!) Should not set "base" option for the electron vite renderer config.'))
      }

      const build = config.build
      if (!build.target) {
        throw new Error('build.target option is required in the electron vite renderer config.')
      } else {
        const targets = Array.isArray(build.target) ? build.target : [build.target]
        if (targets.some(t => !t.startsWith('chrome') && !/^es((202\d{1})|next)$/.test(t))) {
          config.logger.warn(
            'The electron vite renderer config build.target is not "chrome?" or "es?". This could be a mistake.',
          )
        }
      }
    },
  }
}
