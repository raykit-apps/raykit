/**
 * Globals for sandbox module.
 * Provides type definitions for window.raykit and exports for renderer use.
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
 * Raykit global API interface - exposed via contextBridge.
 */
export interface IRaykitGlobal {
  /**
   * IPC Renderer for communication with main process.
   */
  readonly ipcRenderer: IpcRenderer

  /**
   * IPC Message Port for acquiring MessagePorts.
   */
  readonly ipcMessagePort: IpcMessagePort

  /**
   * Web Frame for controlling web content.
   */
  readonly webFrame: WebFrame

  /**
   * Web Utils for file operations.
   */
  readonly webUtils: WebUtils

  /**
   * Process information (restricted).
   */
  readonly process: ISandboxNodeProcess

  /**
   * Context for configuration access.
   */
  readonly context: ISandboxContext
}

// Global augmentation for window.raykit
declare global {
  interface Window {
    /**
     * Raykit sandbox global API.
     */
    readonly raykit: IRaykitGlobal
  }
}

// Re-export common types for convenience
export type {
  IpcRenderer,
  IpcRendererEvent,
  IProcessEnvironment,
  ISandboxConfiguration,
  WebFrame,
  WebUtils,
} from '../common/index.js'
