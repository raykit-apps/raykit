/**
 * Main preload script for raykit sandbox.
 * Provides full Electron API exposure through contextBridge.
 */

import type { ISandboxConfiguration } from '../common/sandbox-types.js'

import { contextBridge, ipcRenderer, webFrame, webUtils } from 'electron'

// #region Utilities

/**
 * Validates that an IPC channel starts with 'raykit:' prefix.
 * @throws Error if channel doesn't start with 'raykit:'
 */
function validateIPC(channel: string): true | never {
  if (!channel?.startsWith('raykit:')) {
    throw new Error(`Unsupported event IPC channel '${channel}'`)
  }
  return true
}

/**
 * Parses command line arguments to extract a value.
 * @param key - The argument key (without -- prefix)
 * @returns The argument value or undefined
 */
function parseArgv(key: string): string | undefined {
  for (const arg of process.argv) {
    if (arg.indexOf(`--${key}=`) === 0) {
      return arg.split('=')[1]
    }
  }
  return undefined
}

// #endregion

// #region Resolve Configuration

let configuration: ISandboxConfiguration | undefined

const resolveConfiguration: Promise<ISandboxConfiguration> = (async () => {
  const windowConfigIpcChannel = parseArgv('raykit-window-config')
  if (!windowConfigIpcChannel) {
    throw new Error(
      'Preload: did not find expected raykit-window-config in renderer process arguments list.',
    )
  }

  try {
    validateIPC(windowConfigIpcChannel)

    // Resolve configuration from electron-main
    const resolvedConfiguration: ISandboxConfiguration = (configuration
      = await ipcRenderer.invoke(windowConfigIpcChannel))

    // Apply userEnv directly
    Object.assign(process.env, resolvedConfiguration.userEnv)

    // Apply zoom level early before even building the window DOM elements
    webFrame.setZoomLevel(resolvedConfiguration.zoomLevel ?? 0)

    return resolvedConfiguration
  } catch (error) {
    throw new Error(
      `Preload: unable to fetch raykit-window-config: ${error}`,
    )
  }
})()

// #endregion

// #region Resolve Shell Environment

const resolveShellEnv: Promise<typeof process.env> = (async () => {
  // Resolve userEnv from configuration and shellEnv from the main side
  const [userEnv, shellEnv] = await Promise.all([
    (async () => (await resolveConfiguration).userEnv)(),
    ipcRenderer.invoke('raykit:fetchShellEnv'),
  ])

  return { ...process.env, ...shellEnv, ...userEnv }
})()

// #endregion

// #region Globals Definition

const globals = {
  /**
   * IPC Renderer for communication with main process.
   */
  ipcRenderer: {
    send(channel: string, ...args: unknown[]): void {
      if (validateIPC(channel)) {
        ipcRenderer.send(channel, ...args)
      }
    },

    invoke(channel: string, ...args: unknown[]): Promise<unknown> {
      validateIPC(channel)
      return ipcRenderer.invoke(channel, ...args)
    },

    on(
      channel: string,
      listener: (event: { sender: typeof ipcRenderer }, ...args: unknown[]) => void,
    ) {
      validateIPC(channel)
      ipcRenderer.on(channel, listener)
      return this
    },

    once(
      channel: string,
      listener: (event: { sender: typeof ipcRenderer }, ...args: unknown[]) => void,
    ) {
      validateIPC(channel)
      ipcRenderer.once(channel, listener)
      return this
    },

    removeListener(
      channel: string,
      listener: (event: { sender: typeof ipcRenderer }, ...args: unknown[]) => void,
    ) {
      validateIPC(channel)
      ipcRenderer.removeListener(channel, listener)
      return this
    },
  },

  /**
   * IPC Message Port for acquiring MessagePorts from main process.
   */
  ipcMessagePort: {
    acquire(responseChannel: string, nonce: string): void {
      if (validateIPC(responseChannel)) {
        const responseListener = (
          e: { ports: MessagePort[] },
          responseNonce: string,
        ) => {
          if (nonce === responseNonce) {
            ipcRenderer.off(responseChannel, responseListener)
            window.postMessage(nonce, '*', e.ports)
          }
        }
        ipcRenderer.on(responseChannel, responseListener)
      }
    },
  },

  /**
   * Web Frame for controlling web content.
   */
  webFrame: {
    setZoomLevel(level: number): void {
      if (typeof level === 'number') {
        webFrame.setZoomLevel(level)
      }
    },
  },

  /**
   * Web Utils for file operations.
   */
  webUtils: {
    getPathForFile(file: File): string {
      return webUtils.getPathForFile(file)
    },
  },

  /**
   * Process information (restricted).
   */
  process: {
    get platform(): string {
      return process.platform
    },
    get arch(): string {
      return process.arch
    },
    get env() {
      return { ...process.env }
    },
    get versions() {
      return process.versions
    },
    get type(): string {
      return 'renderer'
    },
    get execPath(): string {
      return process.execPath
    },

    cwd(): string {
      return (
        process.env.RAYKIT_CWD
        || process.execPath.substring(
          0,
          process.execPath.lastIndexOf(
            process.platform === 'win32' ? '\\' : '/',
          ),
        )
      )
    },

    shellEnv(): Promise<typeof process.env> {
      return resolveShellEnv
    },

    getProcessMemoryInfo(): Promise<import('../common/electron-types.js').ProcessMemoryInfo> {
      return (process as NodeJS.Process & { getProcessMemoryInfo: () => Promise<import('../common/electron-types.js').ProcessMemoryInfo> }).getProcessMemoryInfo()
    },

    on(type: string, callback: (...args: unknown[]) => void): void {
      process.on(type, callback)
    },
  },

  /**
   * Context for configuration access.
   */
  context: {
    configuration(): ISandboxConfiguration | undefined {
      return configuration
    },

    async resolveConfiguration(): Promise<ISandboxConfiguration> {
      return resolveConfiguration
    },
  },
}

// #endregion

// #region Expose Globals

try {
  // Use contextBridge APIs to expose globals to renderer
  contextBridge.exposeInMainWorld('raykit', globals)
} catch (error) {
  console.error('[raykit-sandbox] Failed to expose globals:', error)
}

// #endregion
