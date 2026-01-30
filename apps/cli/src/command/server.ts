import type { ChildProcess } from 'node:child_process'
import type { InlineConfig, ViteDevServer } from 'vite'
import type { BuildConfig, RendererConfig } from '../config'
import colors from 'picocolors'
import { createLogger, mergeConfig, build as viteBuild, createServer as viteCreateServer } from 'vite'
import { resolveConfig } from '../config'
import { startElectron } from '../electron'
import { resolveHostname } from '../utils'

export async function createServer(
  inlineConfig: InlineConfig = {},
  options: { rendererOnly?: boolean },
): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'development'
  const config = await resolveConfig(inlineConfig, 'serve', 'development')
  if (config.config) {
    const logger = createLogger(inlineConfig.logLevel)

    let server: ViteDevServer | undefined
    let ps: ChildProcess | undefined

    const errorHook = (e: any): void => {
      logger.error(`${colors.bgRed(colors.white(' ERROR '))} ${colors.red(e.message)}`)
    }

    const buildConfig = config.config.build as BuildConfig[]
    if (buildConfig.length > 0 && !options.rendererOnly) {
      for (const userConfig of buildConfig) {
        let watchHook: () => void
        if (userConfig.target === 'main') {
          watchHook = (): void => {
            logger.info(colors.green(`\nelectron main process rebuilt successfully`))

            if (ps && config.config?.launchElectron) {
              ps.removeAllListeners()
              ps.kill()
              ps = startElectron(inlineConfig.root)

              logger.info(colors.green(`\nrestarting electron app...\n`))
            }
          }
        } else {
          watchHook = () => {}
        }
        await doBuild(userConfig.vite!, watchHook, errorHook)
      }
    }

    if (options.rendererOnly) {
      logger.warn(
        `\n${colors.yellow(colors.bold('(!)'))} ${colors.yellow('skipped building main process and preload scripts (using previous build)')}`,
      )
    }

    const rendererConfig = config.config.renderer as RendererConfig[]
    if (rendererConfig.length) {
      logger.info(colors.gray(`\n-------------------------\n`))

      server = await viteCreateServer(rendererConfig[0].vite)

      if (!server.httpServer) {
        throw new Error('HTTP server not available')
      }

      await server.listen()

      const conf = server.config.server

      const protocol = conf.https ? 'https:' : 'http:'
      const host = resolveHostname(conf.host)
      const port = conf.port
      process.env.ELECTRON_RENDERER_URL = `${protocol}//${host}:${port}`

      const slogger = server.config.logger

      slogger.info(colors.green(`dev server running for the electron renderer process at:\n`), {
        clear: !slogger.hasWarned && !options.rendererOnly,
      })

      server.printUrls()
    }

    if (config.config?.launchElectron && !options.rendererOnly) {
      ps = startElectron(inlineConfig.root)
    }

    logger.info(colors.green(`\nstarting electron app...\n`))
  }
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
