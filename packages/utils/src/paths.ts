import path from 'node:path'
import { app } from 'electron'
import { isDev, isLinux, isWindows } from './environment'

function once(fn: () => string) {
  let cached: string
  return () => {
    if (!cached) {
      cached = fn()
    }
    return cached
  }
}

export const getResourceDir = once(() => {
  return isDev()
    ? path.join(import.meta.dirname, '../../resources')
    : path.join(process.resourcesPath)
})

export const getHomeDir = once(() => {
  return app.getPath('home')
})

/**
 * Returns the **configuration** directory for the RayKit app, cached after the first call.
 *
 * | Platform | Resolved path (example)                              | Notes |
 * |----------|------------------------------------------------------|-------|
 * | Windows  | C:\Users\alice\AppData\Roaming\RayKit               | Returned by `app.getPath('userData')` |
 * | Linux    | /home/alice/.config/RayKit                          | Returned by `app.getPath('userData')` |
 * | macOS    | /Users/alice/.config/raykit                         | Constructed as `<home>/.config/raykit` |
 *
 * Example usage:
 * ```ts
 * const cfgDir = getConfigDir(); // -> "/home/alice/.config/raykit" on macOS
 * ```
 */
export const getConfigDir = once(() => {
  if (isWindows() || isLinux()) {
    return app.getPath('userData')
  } else {
    return path.join(getHomeDir(), '.config/raykit')
  }
})

/**
 * Returns the **data** directory for the RayKit app, cached after the first call.
 *
 * | Platform | Resolved path (example)                              | Notes |
 * |----------|------------------------------------------------------|-------|
 * | Windows  | C:\Users\alice\AppData\Local\Raykit                 | Constructed as `<home>/AppData/Local/Raykit` |
 * | Linux    | /home/alice/.local/share/raykit                     | Constructed as `<home>/.local/share/raykit` |
 * | macOS    | /Users/alice/Library/Application Support/RayKit     | Returned by `app.getPath('userData')` |
 *
 * Example usage:
 * ```ts
 * const dataDir = getDataDir(); // -> "C:\Users\Bob\AppData\Local\Raykit" on Windows
 * ```
 */
export const getDataDir = once(() => {
  if (isWindows()) {
    return path.join(getHomeDir(), 'AppData/Local/Raykit')
  } else if (isLinux()) {
    return path.join(path.join(getHomeDir(), '.local/share/raykit'))
  } else {
    return app.getPath('userData')
  }
})

export const getTempDir = once(() => {
  return path.join(app.getPath('temp'), 'Raykit')
})

export const getLogsDir = once(() => {
  return app.getPath('logs')
})

export const getLogFile = once(() => {
  return path.join(getLogsDir(), 'Raykit.log')
})

export const getExtensionsDir = once(() => {
  return path.join(getHomeDir(), '.raykit/extensions')
})
