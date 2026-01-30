import type { InlineConfig } from 'vite'
import type { BuildConfig, RendererConfig } from '../config'
import fs from 'node:fs'
import path from 'node:path'
import colors from 'picocolors'
import { createLogger, mergeConfig, build as viteBuild } from 'vite'
import { resolveConfig } from '../config'

export interface BuildOptions {
  outDir?: string
  emptyOutDir?: boolean
  minify?: boolean
}

interface BuildTask {
  name: string
  type: 'main' | 'preload' | 'node' | 'renderer'
  config: InlineConfig
  outputPath: string
}

export async function build(inlineConfig: InlineConfig = {}, options?: BuildOptions): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'production'
  const resolved = await resolveConfig(inlineConfig, 'build', 'production')

  if (!resolved.config) {
    throw new Error('Failed to load configuration')
  }

  const logger = createLogger(inlineConfig.logLevel)
  const config = resolved.config

  // Collect all build tasks
  const buildTasks: BuildTask[] = []

  // Process build configs (main, preload, node)
  const buildConfigs = Array.isArray(config.build) ? config.build : config.build ? [config.build] : []
  for (const buildConfig of buildConfigs) {
    const task = createBuildTask(buildConfig, inlineConfig.root, options)
    buildTasks.push(task)
  }

  // Process renderer configs
  const rendererConfigs = Array.isArray(config.renderer) ? config.renderer : config.renderer ? [config.renderer] : []
  for (const rendererConfig of rendererConfigs) {
    const task = createRendererTask(rendererConfig, inlineConfig.root, options)
    buildTasks.push(task)
  }

  if (buildTasks.length === 0) {
    logger.warn(colors.yellow('No build tasks found in configuration'))
    return
  }

  // Log build info
  logger.info(colors.cyan(`\nBuilding for production...`))
  logger.info(colors.gray(`Found ${buildTasks.length} build task(s):`))
  for (const task of buildTasks) {
    logger.info(colors.gray(`  - ${task.name} (${task.type})`))
  }
  logger.info('')

  // Execute builds
  const startTime = Date.now()

  // Build sequentially to avoid resource conflicts
  for (const task of buildTasks) {
    try {
      logger.info(colors.cyan(`Building ${task.name}...`))
      await executeBuild(task)
      logger.info(colors.green(`✓ ${task.name} built successfully`))
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error(colors.red(`✗ ${task.name} build failed:`))
      logger.error(colors.red(err.message))
      throw err
    }
  }

  const duration = Date.now() - startTime

  // Report results
  logger.info('')
  logger.info(colors.green(`✓ All builds completed successfully in ${duration}ms`))
}

function createBuildTask(buildConfig: BuildConfig, root?: string, options?: BuildOptions): BuildTask {
  const type = buildConfig.target || 'node'
  const name = `${type}:${path.basename(buildConfig.entry)}`

  // Deep clone by serializing and deserializing
  const viteConfig: InlineConfig = JSON.parse(JSON.stringify(buildConfig.vite || {}))

  // Apply options overrides
  if (options?.outDir) {
    viteConfig.build = viteConfig.build || {}
    viteConfig.build.outDir = options.outDir
  }
  if (options?.emptyOutDir !== undefined) {
    viteConfig.build = viteConfig.build || {}
    viteConfig.build.emptyOutDir = options.emptyOutDir
  }
  if (options?.minify !== undefined) {
    viteConfig.build = viteConfig.build || {}
    viteConfig.build.minify = options.minify
  }

  // Determine output path
  const outDir = viteConfig.build?.outDir || getDefaultOutDir(type, root)

  return {
    name,
    type,
    config: viteConfig,
    outputPath: outDir,
  }
}

function createRendererTask(rendererConfig: RendererConfig, root?: string, options?: BuildOptions): BuildTask {
  const name = `renderer:${path.basename(rendererConfig.entry)}`

  // Deep clone by serializing and deserializing
  const viteConfig: InlineConfig = JSON.parse(JSON.stringify(rendererConfig.vite || {}))

  // Apply options overrides
  if (options?.outDir) {
    viteConfig.build = viteConfig.build || {}
    viteConfig.build.outDir = options.outDir
  }
  if (options?.emptyOutDir !== undefined) {
    viteConfig.build = viteConfig.build || {}
    viteConfig.build.emptyOutDir = options.emptyOutDir
  }
  if (options?.minify !== undefined) {
    viteConfig.build = viteConfig.build || {}
    viteConfig.build.minify = options.minify
  }

  // Set base for renderer
  viteConfig.base = viteConfig.base || './'

  // Determine output path
  const outDir = viteConfig.build?.outDir || getDefaultOutDir('renderer', root)

  return {
    name,
    type: 'renderer',
    config: viteConfig,
    outputPath: outDir,
  }
}

function getDefaultOutDir(type: string, root?: string): string {
  const basePath = root || process.cwd()
  switch (type) {
    case 'main':
      return path.resolve(basePath, 'out', 'main')
    case 'preload':
      return path.resolve(basePath, 'out', 'preload')
    case 'node':
      return path.resolve(basePath, 'out', 'node')
    case 'renderer':
      return path.resolve(basePath, 'out', 'renderer')
    default:
      return path.resolve(basePath, 'out')
  }
}

async function executeBuild(task: BuildTask): Promise<void> {
  // Ensure output directory exists
  if (!fs.existsSync(task.outputPath)) {
    fs.mkdirSync(task.outputPath, { recursive: true })
  }

  // Set config to production mode
  const config = mergeConfig(task.config, {
    mode: 'production',
    build: {
      write: true,
    },
    logLevel: 'info' as const,
  })

  await viteBuild(config)
}
