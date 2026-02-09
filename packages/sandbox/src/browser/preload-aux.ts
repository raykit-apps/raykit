/**
 * Auxiliary preload script for raykit sandbox.
 * Provides minimal Electron API exposure for auxiliary windows.
 */

import { contextBridge, ipcRenderer, webFrame } from 'electron'

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

// #endregion

// #region Globals Definition

const globals = {
  /**
   * IPC Renderer for communication with main process.
   * Minimal version: only send and invoke (no on/once/removeListener).
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
}

// #endregion

// #region Expose Globals

try {
  // Use contextBridge APIs to expose globals to renderer
  contextBridge.exposeInMainWorld('raykit', globals)
} catch (error) {
  console.error('[raykit-sandbox] Failed to expose aux globals:', error)
}

// #endregion
