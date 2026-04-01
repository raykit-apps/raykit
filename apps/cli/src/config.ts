import type { MaybeArray } from 'rollup'
import type { ConfigEnv, InlineConfig, LogLevel, PluginOption, UserConfig as ViteConfig } from 'vite'
import type { AutoContainerModulesOption } from './plugins/auto-container-modules'
import fs from 'node:fs'
import path from 'node:path'
import { mergeConfig, normalizePath, loadConfigFromFile as viteLoadConfigFromFile } from 'vite'
import {

  createInternalAutoContainerModulesPlugin,
  normalizeAutoContainerModules,
} from './plugins/auto-container-modules'
import {
  electronMainConfigPresetPlugin,
  electronMainConfigValidatorPlugin,
  electronNodeConfigPresetPlugin,
  electronNodeConfigValidatorPlugin,
  electronPreloadConfigPresetPlugin,
  electronPreloadConfigValidatorPlugin,
  electronRendererConfigPresetPlugin,
  electronRendererConfigValidatorPlugin,
} from './plugins/electron'
import { deepClone, isObject } from './utils'

export interface BuildConfig {
  /**
   * Entry file path
   */
  entry: string
  /**
   * Vite configuration options
   */
  vite?: ViteConfig
  /**
   * Build target type
   * @default 'node'
   */
  target?: 'main' | 'node' | 'preload'
}

export interface RendererConfig {
  /**
   * Entry file path
   */
  entry: string
  /**
   * Vite configuration options
   */
  vite?: ViteConfig
}

export interface UserConfig {
  /**
   * Build configurations for main/preload/node processes
   */
  build: MaybeArray<BuildConfig>
  /**
   * Renderer configurations
   */
  renderer?: MaybeArray<RendererConfig>
  /**
   * Whether to launch Electron after build (development only)
   */
  launchElectron?: boolean
  /**
   * Auto discover and load container modules from dependency package manifests.
   */
  autoContainerModules?: AutoContainerModulesOption
}

export type UserConfigFnObject = (env: ConfigEnv) => UserConfig
export type UserConfigFnPromise = (env: ConfigEnv) => Promise<UserConfig>
export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>

export type UserConfigExport
  = | UserConfig
    | Promise<UserConfig>
    | UserConfigFnObject
    | UserConfigFnPromise
    | UserConfigFn

export function defineConfig(config: UserConfig): UserConfig
export function defineConfig(config: Promise<UserConfig>): Promise<UserConfig>
export function defineConfig(config: UserConfigFnObject): UserConfigFnObject
export function defineConfig(config: UserConfigFnPromise): UserConfigFnPromise
export function defineConfig(config: UserConfigFn): UserConfigFn
export function defineConfig(config: UserConfigExport): UserConfigExport
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}

export interface ResolvedConfigFile {
  path: string
  config: UserConfig
  dependencies: string[]
}

export interface ResolvedConfig {
  config?: UserConfig
  configFile?: string
  configFileDependencies: string[]
}

function resetEntry(viteConfig: ViteConfig, entry: string, root?: string): void {
  const resolvedRoot = root ?? viteConfig.root ?? process.cwd()
  if (viteConfig.build?.lib) {
    viteConfig.build.lib.entry = path.resolve(resolvedRoot, entry)
  } else {
    viteConfig.build = {
      lib: {
        entry: path.resolve(resolvedRoot, entry),
      },
    }
  }
}

function resetRollupInput(viteConfig: ViteConfig, entry: string, root?: string) {
  const resolvedRoot = root ?? viteConfig.root ?? process.cwd()
  if (viteConfig.build?.rollupOptions) {
    viteConfig.build.rollupOptions.input = path.resolve(resolvedRoot, entry)
  } else {
    viteConfig.build = {
      rollupOptions: {
        input: path.resolve(resolvedRoot, entry),
      },
    }
  }
}

export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
): Promise<ResolvedConfig> {
  const config = inlineConfig
  const mode = inlineConfig.mode || defaultMode

  process.env.NODE_ENV = defaultMode

  let userConfig: UserConfig | undefined
  let configFileDependencies: string[] = []

  let { configFile } = config
  if (configFile !== false) {
    const configEnv = {
      mode,
      command,
    }

    const loadResult = await loadConfigFromFile(
      configEnv,
      configFile,
      config.root,
      config.logLevel,
    )

    if (loadResult) {
      const root = config.root
      const packageRoot = path.dirname(loadResult.path)
      delete config.root
      delete config.configFile

      config.configFile = false

      let buildViteConfig: MaybeArray<BuildConfig> = loadResult.config.build ?? []
      if (isObject<BuildConfig>(buildViteConfig)) {
        buildViteConfig = [buildViteConfig]
      }
      if (buildViteConfig.filter(viteConfig => viteConfig.target === 'main').length > 1) {
        throw new Error('Only one main entry can be target.')
      }

      let rendererViteConfig: MaybeArray<RendererConfig> = loadResult.config.renderer ?? []
      if (isObject<RendererConfig>(rendererViteConfig)) {
        rendererViteConfig = [rendererViteConfig]
      }

      const autoContainerModulesConfigured = loadResult.config.autoContainerModules !== undefined && loadResult.config.autoContainerModules !== false
      const normalizedAutoContainerModules = normalizeAutoContainerModules(
        loadResult.config.autoContainerModules,
        buildViteConfig,
        rendererViteConfig,
      )

      if (buildViteConfig.length > 0) {
        buildViteConfig.forEach((userConfig) => {
          let viteConfig = userConfig.vite ?? {}
          resetEntry(viteConfig, userConfig.entry, config.root)

          viteConfig = mergeConfig(viteConfig, deepClone(config))

          viteConfig.mode = inlineConfig.mode || viteConfig.mode || defaultMode

          if (userConfig.target === 'main') {
            const builtInMainPlugins: PluginOption[] = [
              electronMainConfigPresetPlugin({ root }),
              electronMainConfigValidatorPlugin(),
            ]

            if (autoContainerModulesConfigured) {
              builtInMainPlugins.push(
                createInternalAutoContainerModulesPlugin({
                  runtime: 'main',
                  packageRoot,
                  enabled: normalizedAutoContainerModules.main,
                  virtualId: 'virtual:raykit/auto-main-modules',
                }),
              )
            }

            viteConfig.plugins = [...builtInMainPlugins, ...viteConfig.plugins || []]
          } else if (userConfig.target === 'preload') {
            const builtInPreloadPlugins: PluginOption[] = [
              electronPreloadConfigPresetPlugin({ root }),
              electronPreloadConfigValidatorPlugin(),
            ]
            viteConfig.plugins = [...builtInPreloadPlugins, ...viteConfig.plugins || []]
          } else {
            // Default to node target
            const builtInNodePlugins: PluginOption[] = [
              electronNodeConfigPresetPlugin({ root }),
              electronNodeConfigValidatorPlugin(),
            ]

            if (autoContainerModulesConfigured) {
              builtInNodePlugins.push(
                createInternalAutoContainerModulesPlugin({
                  runtime: 'node',
                  packageRoot,
                  enabled: normalizedAutoContainerModules.node,
                  virtualId: 'virtual:raykit/auto-node-modules',
                }),
              )
            }

            viteConfig.plugins = [...builtInNodePlugins, ...viteConfig.plugins || []]
          }

          userConfig.vite = viteConfig
        })
      }
      loadResult.config.build = buildViteConfig

      if (rendererViteConfig.length > 0) {
        rendererViteConfig.forEach((userConfig) => {
          let viteConfig = userConfig.vite ?? {}
          resetRollupInput(viteConfig, userConfig.entry, config.root)

          viteConfig = mergeConfig(viteConfig, deepClone(config))

          viteConfig.mode = inlineConfig.mode || viteConfig.mode || defaultMode

          const builtInRendererPlugins: PluginOption[] = [
            electronRendererConfigPresetPlugin({ root }),
            electronRendererConfigValidatorPlugin(),
          ]

          if (autoContainerModulesConfigured) {
            builtInRendererPlugins.push(
              createInternalAutoContainerModulesPlugin({
                runtime: 'browser',
                packageRoot,
                enabled: normalizedAutoContainerModules.browser,
                virtualId: 'virtual:raykit/auto-browser-modules',
              }),
            )
          }

          viteConfig.plugins = [...builtInRendererPlugins, ...viteConfig.plugins || []]

          userConfig.vite = viteConfig
        })
      }
      loadResult.config.renderer = rendererViteConfig

      userConfig = loadResult.config
      configFile = loadResult.path
      configFileDependencies = loadResult.dependencies
    }
  }

  const resolved: ResolvedConfig = {
    config: userConfig,
    configFile: configFile ? normalizePath(configFile) : undefined,
    configFileDependencies,
  }

  return resolved
}

const CONFIG_FILE_NAME = 'raykit.config'
const VITE_CONFIG_FILE_PATTERN = /^vite.config.(js|ts|mjs|cjs|mts|cts)$/

export async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
): Promise<ResolvedConfigFile | null> {
  if (configFile && VITE_CONFIG_FILE_PATTERN.test(configFile)) {
    throw new Error(`config file cannot be named ${configFile}.`)
  }

  const resolvedPath = configFile
    ? path.resolve(configFile)
    : findConfigFile(configRoot, ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts'])

  return viteLoadConfigFromFile(configEnv, resolvedPath, configRoot, logLevel) as Promise<ResolvedConfigFile | null>
}

function findConfigFile(configRoot: string, extensions: string[]): string {
  for (const ext of extensions) {
    const configFile = path.resolve(configRoot, `${CONFIG_FILE_NAME}.${ext}`)
    if (fs.existsSync(configFile)) {
      return configFile
    }
  }
  return ''
}
