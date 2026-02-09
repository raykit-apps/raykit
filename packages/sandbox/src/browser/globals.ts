/**
 * Globals for sandbox module.
 * Provides type definitions for window.raykit and exports for renderer use.
 * Based on VSCode's sandbox globals pattern.
 */

import type {
  IpcRenderer,
  ProcessMemoryInfo,
  WebFrame,
  WebUtils,
} from '../common/electron-types.js'
import type { IProcessEnvironment, ISandboxConfiguration } from '../common/sandbox-types.js'

/**
 * IPC Message Port interface for acquiring MessagePorts from main process.
 */
export interface IpcMessagePort {
  /**
   * Acquire a MessagePort from the main process.
   */
  acquire: (responseChannel: string, nonce: string) => void
}

/**
 * Sandbox Node Process interface - restricted process API for renderer.
 */
export interface ISandboxNodeProcess {
  /**
   * The operating system platform.
   */
  readonly platform: string

  /**
   * The CPU architecture.
   */
  readonly arch: string

  /**
   * The process type - always 'renderer' in sandbox.
   */
  readonly type: string

  /**
   * Node.js and Electron versions.
   */
  readonly versions: { [key: string]: string | undefined }

  /**
   * Environment variables (copy).
   */
  readonly env: IProcessEnvironment

  /**
   * Path to the executable.
   */
  readonly execPath: string

  /**
   * Get current working directory.
   */
  cwd: () => string

  /**
   * Get shell environment variables.
   */
  shellEnv: () => Promise<IProcessEnvironment>

  /**
   * Get process memory information.
   */
  getProcessMemoryInfo: () => Promise<ProcessMemoryInfo>

  /**
   * Listen to process events.
   */
  on: (type: string, callback: (...args: unknown[]) => void) => void
}

/**
 * Sandbox Context interface for accessing configuration.
 */
export interface ISandboxContext {
  /**
   * Get current configuration (may be undefined if not yet resolved).
   */
  configuration: () => ISandboxConfiguration | undefined

  /**
   * Resolve configuration from main process.
   */
  resolveConfiguration: () => Promise<ISandboxConfiguration>
}

/**
 * A set of globals that are available in all windows that either
 * depend on `preload.js` or `preload-aux.js`.
 * Based on VSCode's ISandboxGlobals pattern.
 */
export interface ISandboxGlobals {
  readonly ipcRenderer: Pick<IpcRenderer, 'send' | 'invoke'>
  readonly webFrame: WebFrame
}

// Get the raykit global object from window
const raykitGlobal = (globalThis as any).raykit

// Export individual globals for direct import
export const ipcRenderer: IpcRenderer = raykitGlobal.ipcRenderer
export const ipcMessagePort: IpcMessagePort = raykitGlobal.ipcMessagePort
export const webFrame: WebFrame = raykitGlobal.webFrame
export const process: ISandboxNodeProcess = raykitGlobal.process
export const context: ISandboxContext = raykitGlobal.context
export const webUtils: WebUtils = raykitGlobal.webUtils

// Re-export common types for convenience
export type {
  IpcRenderer,
  IpcRendererEvent,
  IProcessEnvironment,
  ISandboxConfiguration,
  WebFrame,
  WebUtils,
} from '../common/index'
