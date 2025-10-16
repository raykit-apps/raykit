import type { Event, IDisposable } from '@raykit/common'

export enum LogLevel {
  Off,
  Trace,
  Debug,
  Info,
  Warning,
  Error,
}

export const DEFAULT_LOG_LEVEL: LogLevel = LogLevel.Info

export interface ILogger extends IDisposable {
  onDidChangeLogLevel: Event<LogLevel>
  getLevel(): LogLevel
  setLevel(level: LogLevel): void

  trace(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string | Error, ...args: any[]): void

  /**
   * An operation to flush the contents. Can be synchronous.
   */
  flush(): void
}
