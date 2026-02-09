/**
 * Electron types for sandbox module.
 * Copied and adapted from Electron 29.x types for use in sandbox context.
 */

/**
 * Input event modifiers.
 */
export type InputEventModifier
  = | 'shift'
    | 'control'
    | 'ctrl'
    | 'alt'
    | 'meta'
    | 'command'
    | 'cmd'
    | 'isKeypad'
    | 'isAutoRepeat'
    | 'leftButtonDown'
    | 'middleButtonDown'
    | 'rightButtonDown'
    | 'capsLock'
    | 'numLock'
    | 'left'
    | 'right'

/**
 * Base event interface.
 */
export interface Event {
  preventDefault: () => void
  readonly defaultPrevented: boolean
}

/**
 * IPC renderer event.
 */
export interface IpcRendererEvent extends Event {
  /**
   * The IpcRenderer instance that emitted the event originally
   */
  readonly sender: IpcRenderer
}

/**
 * IPC renderer interface.
 */
export interface IpcRenderer {
  /**
   * Resolves with the response from the main process.
   */
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>

  /**
   * Listens to channel, when a new message arrives listener would be called with listener(event, args...).
   */
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => this

  /**
   * Adds a one time listener function for the event.
   */
  once: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => this

  /**
   * Removes the specified listener from the listener array for the specified channel.
   */
  removeListener: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => this

  /**
   * Send an asynchronous message to the main process via channel, along with arguments.
   */
  send: (channel: string, ...args: unknown[]) => void
}

/**
 * Web frame interface.
 */
export interface WebFrame {
  /**
   * Changes the zoom level to the specified level.
   */
  setZoomLevel: (level: number) => void
}

/**
 * Process memory info.
 */
export interface ProcessMemoryInfo {
  /**
   * The amount of memory not shared by other processes.
   */
  readonly private: number

  /**
   * The amount of memory currently pinned to actual physical RAM in Kilobytes.
   * @platform linux,win32
   */
  readonly residentSet: number

  /**
   * The amount of memory shared between processes.
   */
  readonly shared: number
}

/**
 * Web utils interface.
 */
export interface WebUtils {
  /**
   * The file system path that this File object points to.
   */
  getPathForFile: (file: File) => string
}

/**
 * Auth info for login events.
 */
export interface AuthInfo {
  readonly isProxy: boolean
  readonly scheme: string
  readonly host: string
  readonly port: number
  readonly realm: string
}

/**
 * File filter for dialogs.
 */
export interface FileFilter {
  readonly extensions: string[]
  readonly name: string
}

/**
 * Open dialog return value.
 */
export interface OpenDialogReturnValue {
  readonly canceled: boolean
  readonly filePaths: string[]
  readonly bookmarks?: string[]
}

/**
 * Save dialog return value.
 */
export interface SaveDialogReturnValue {
  readonly canceled: boolean
  readonly filePath: string
  readonly bookmark?: string
}

/**
 * Message box return value.
 */
export interface MessageBoxReturnValue {
  readonly response: number
  readonly checkboxChecked: boolean
}
