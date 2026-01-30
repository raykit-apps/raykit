import type { ChildProcess } from 'node:child_process'
import type { InlineConfig, ViteDevServer } from 'vite'
import type { RendererConfig } from '../config'
import colors from 'picocolors'
import { createLogger, mergeConfig, build as viteBuild, createServer as viteCreateServer } from 'vite'
import { resolveConfig } from '../config'
import { startElectron } from '../electron'
import { resolveHostname } from '../utils'

export interface ServerOptions {
  rendererOnly?: boolean
}

export async function createServer(
  inlineConfig: InlineConfig = {},
  options: ServerOptions = {},
): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'development'
  const config = await resolveConfig(inlineConfig, 'serve', 'development')

  if (!config.config) {
    throw new Error('Failed to load configuration')
  }

  const logger = createLogger(inlineConfig.logLevel)
  const resolvedConfig = config.config

  // Track resources for cleanup
  const servers: ViteDevServer[] = []
  let electronProcess: ChildProcess | undefined

  try {
    // Phase 1: Build main, preload, and node processes (if not rendererOnly)
    const buildConfig = resolvedConfig.build as import('../config.js').BuildConfig[]
    if (buildConfig.length > 0 && !options.rendererOnly) {
      await buildProcesses(buildConfig, resolvedConfig, inlineConfig.root, logger, (ps) => {
        electronProcess = ps
      })
    }

    // Phase 2: Start renderer dev servers
    const rendererConfig = resolvedConfig.renderer as RendererConfig[]
    if (rendererConfig.length > 0) {
      await startRendererServers(rendererConfig, servers, options.rendererOnly, logger)
    }

    // Phase 3: Start Electron (if configured and not rendererOnly)
    if (resolvedConfig.launchElectron && !options.rendererOnly) {
      electronProcess = startElectron(inlineConfig.root)
      logger.info(colors.green('\nStarting Electron app...\n'))
    }

    // Keep the process running
    await waitForExit(electronProcess)
  } finally {
    // Cleanup
    await cleanup(servers, electronProcess, logger)
  }
}

async function buildProcesses(
  buildConfigs: Array<{ target?: 'main' | 'preload' | 'node', entry: string, vite?: any }>,
  resolvedConfig: any,
  root: string | undefined,
  logger: ReturnType<typeof createLogger>,
  onElectronStart: (ps: ChildProcess) => void,
): Promise<void> {
  logger.info(colors.cyan('\nBuilding main/preload/node processes...\n'))

  for (const userConfig of buildConfigs) {
    let watchHook: () => void

    if (userConfig.target === 'main') {
      let electronProcess: ChildProcess | undefined

      watchHook = (): void => {
        logger.info(colors.green(`\nElectron main process rebuilt successfully`))

        if (electronProcess && resolvedConfig.launchElectron) {
          electronProcess.removeAllListeners()
          electronProcess.kill()
          electronProcess = startElectron(root)
          onElectronStart(electronProcess)

          logger.info(colors.green(`\nRestarting Electron app...\n`))
        }
      }

      // Start Electron after initial build if main process
      if (resolvedConfig.launchElectron) {
        // This will be started after the server is ready
      }
    } else {
      watchHook = (): void => {
        logger.info(colors.green(`\n${userConfig.target || 'node'} process rebuilt successfully`))
      }
    }

    const errorHook = (e: Error): void => {
      logger.error(`${colors.bgRed(colors.white(' ERROR '))} ${colors.red(e.message)}`)
    }

    await doBuild(userConfig.vite!, watchHook, errorHook)
    logger.info(colors.green(`✓ ${userConfig.target || 'node'} process built successfully`))
  }
}

async function startRendererServers(
  rendererConfigs: RendererConfig[],
  servers: ViteDevServer[],
  rendererOnly: boolean | undefined,
  logger: ReturnType<typeof createLogger>,
): Promise<void> {
  logger.info(colors.gray(`\n-------------------------\n`))

  if (rendererConfigs.length === 1) {
    // Single renderer - use existing behavior
    const server = await viteCreateServer(rendererConfigs[0].vite)

    if (!server.httpServer) {
      throw new Error('HTTP server not available')
    }

    await server.listen()
    servers.push(server)

    const conf = server.config.server
    const protocol = conf.https ? 'https:' : 'http:'
    const host = resolveHostname(conf.host)
    const port = conf.port

    process.env.ELECTRON_RENDERER_URL = `${protocol}//${host}:${port}`

    const slogger = server.config.logger
    slogger.info(colors.green(`Dev server running for the electron renderer process at:\n`), {
      clear: !slogger.hasWarned && !rendererOnly,
    })

    server.printUrls()
  } else {
    // Multiple renderers
    logger.info(colors.cyan(`Starting ${rendererConfigs.length} renderer dev servers...\n`))

    for (let i = 0; i < rendererConfigs.length; i++) {
      const rendererConfig = rendererConfigs[i]
      const serverIndex = i + 1

      // Configure server with different port to avoid conflicts
      const config = mergeConfig(rendererConfig.vite || {}, {
        server: {
          port: 5173 + i, // Start from port 5173
          strictPort: false, // Allow fallback to next available port
        },
      })

      const server = await viteCreateServer(config)

      if (!server.httpServer) {
        throw new Error(`HTTP server not available for renderer ${serverIndex}`)
      }

      await server.listen()
      servers.push(server)

      const conf = server.config.server
      const protocol = conf.https ? 'https:' : 'http:'
      const host = resolveHostname(conf.host)
      const port = conf.port

      // Store URL with index for multi-renderer support
      if (i === 0) {
        process.env.ELECTRON_RENDERER_URL = `${protocol}//${host}:${port}`
      }
      process.env[`ELECTRON_RENDERER_URL_${serverIndex}`] = `${protocol}//${host}:${port}`

      logger.info(colors.green(`✓ Renderer ${serverIndex} dev server running at ${protocol}//${host}:${port}`))
    }

    logger.info('')
  }
}

async function waitForExit(electronProcess: ChildProcess | undefined): Promise<void> {
  if (!electronProcess) {
    // If no electron process, keep running until SIGINT
    return new Promise((resolve) => {
      process.on('SIGINT', () => {
        resolve()
      })
    })
  }

  return new Promise((resolve) => {
    electronProcess.on('close', () => {
      resolve()
    })
  })
}

async function cleanup(
  servers: ViteDevServer[],
  electronProcess: ChildProcess | undefined,
  logger: ReturnType<typeof createLogger>,
): Promise<void> {
  logger.info(colors.cyan('\nCleaning up...'))

  // Close all dev servers
  for (const server of servers) {
    await server.close()
  }

  // Kill electron process if still running
  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill()
  }

  logger.info(colors.green('Cleanup completed'))
}

async function doBuild(config: InlineConfig, watchHook: () => void, errorHook: (e: Error) => void): Promise<void> {
  return new Promise((resolve) => {
    if (config.build?.watch) {
      let firstBundle = true
      const closeBundle = (): void => {
        if (firstBundle) {
          firstBundle = false
          resolve()
        } else {
          watchHook()
        }
      }

      config = mergeConfig(config, {
        plugins: [
          {
            name: 'vite:electron-watcher',
            closeBundle,
          },
        ],
      })
    }

    viteBuild(config)
      .then(() => {
        if (!config.build?.watch) {
          resolve()
        }
      })
      .catch(e => errorHook(e))
  })
}
