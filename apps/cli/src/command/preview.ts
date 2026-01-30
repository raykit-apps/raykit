import type { InlineConfig } from 'vite'
import type { RendererConfig } from '../config'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import colors from 'picocolors'
import { createLogger } from 'vite'
import { resolveConfig } from '../config'
import { startElectron } from '../electron'

export interface PreviewOptions {
  skipBuild?: boolean
  port?: number
}

interface PreviewTask {
  name: string
  type: 'renderer'
  config: InlineConfig
  outputPath: string
}

export async function preview(inlineConfig: InlineConfig = {}, options: PreviewOptions = {}): Promise<void> {
  process.env.NODE_ENV_ELECTRON_VITE = 'production'

  const logger = createLogger(inlineConfig.logLevel)

  // If not skipping build, perform build first
  if (!options.skipBuild) {
    logger.info(colors.cyan('\nBuilding for preview...\n'))
    try {
      const { build } = await import('./build')
      await build(inlineConfig)
      logger.info(colors.green('\nBuild completed.\n'))
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      logger.error(colors.red(`Build failed: ${err.message}`))
      throw err
    }
  } else {
    logger.warn(colors.yellow('\nSkipping build step (--skip-build flag set)\n'))
  }

  // Resolve config for preview
  const resolved = await resolveConfig(inlineConfig, 'build', 'production')

  if (!resolved.config) {
    throw new Error('Failed to load configuration')
  }

  const config = resolved.config

  // Collect renderer preview tasks
  const previewTasks: PreviewTask[] = []

  // Process renderer configs
  const rendererConfigs = Array.isArray(config.renderer)
    ? config.renderer
    : config.renderer
      ? [config.renderer]
      : []

  for (const rendererConfig of rendererConfigs) {
    const task = createPreviewTask(rendererConfig, inlineConfig.root)
    previewTasks.push(task)
  }

  // Start static server for each renderer
  const servers: http.Server[] = []

  try {
    if (previewTasks.length > 0) {
      logger.info(colors.cyan('\nStarting preview servers...\n'))

      for (const task of previewTasks) {
        const port = options.port || findAvailablePort()
        const server = await startStaticServer(task.outputPath, port)
        servers.push(server)

        // Set environment variable for Electron to access
        const protocol = 'http:'
        const host = 'localhost'
        process.env.ELECTRON_RENDERER_URL = `${protocol}//${host}:${port}`

        logger.info(colors.green(`✓ Preview server for ${task.name} running at ${protocol}//${host}:${port}`))
      }
    }

    // Start Electron
    logger.info(colors.green('\nStarting Electron app for preview...\n'))
    const ps = startElectron(inlineConfig.root)

    // Wait for Electron to close
    await new Promise<void>((resolve) => {
      ps.on('close', (code) => {
        logger.info(colors.cyan(`\nElectron exited with code ${code}`))
        resolve()
      })
    })
  } finally {
    // Cleanup: close all servers
    for (const server of servers) {
      server.close()
    }
  }
}

function createPreviewTask(rendererConfig: RendererConfig, root?: string): PreviewTask {
  const name = `renderer:${path.basename(rendererConfig.entry)}`

  // Determine output path
  const outDir = rendererConfig.vite?.build?.outDir
    || getDefaultOutDir('renderer', root)

  return {
    name,
    type: 'renderer',
    config: rendererConfig.vite || {},
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

async function startStaticServer(outDir: string, port: number): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = req.url || '/'
      const filePath = path.join(outDir, url === '/' ? 'index.html' : url)

      // Security: prevent directory traversal
      const resolvedPath = path.resolve(filePath)
      const resolvedOutDir = path.resolve(outDir)
      if (!resolvedPath.startsWith(resolvedOutDir)) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }

      // Serve file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // Try index.html for SPA routing
            const indexPath = path.join(outDir, 'index.html')
            fs.readFile(indexPath, (indexErr, indexData) => {
              if (indexErr) {
                res.writeHead(404)
                res.end('Not Found')
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(indexData)
              }
            })
          } else {
            res.writeHead(500)
            res.end('Internal Server Error')
          }
          return
        }

        // Set content type based on extension
        const ext = path.extname(filePath).toLowerCase()
        const contentType = getContentType(ext)
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(data)
      })
    })

    server.listen(port, () => {
      resolve(server)
    })

    server.on('error', (err) => {
      reject(err)
    })
  })
}

function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
  }
  return contentTypes[ext] || 'application/octet-stream'
}

function findAvailablePort(): number {
  // Use a random port between 3000-9000
  return Math.floor(Math.random() * 6000) + 3000
}
