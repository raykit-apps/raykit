// import { injectable } from 'inversify'

export const ILogger = Symbol('ILogger')

export enum LogLevel {
  Off,
  Trace,
  Debug,
  Info,
  Warning,
  Error,
}

export interface ILogger {
  getLevel: () => LogLevel
  setLevel: (level: LogLevel) => void

  trace: (message: string, ...params: unknown[]) => void
  debug: (message: string, ...params: unknown[]) => void
  info: (message: string, ...params: unknown[]) => void
  warn: (message: string, ...params: unknown[]) => void
  error: (message: string | Error, ...params: unknown[]) => void
}

// @injectable()
// export class Logger implements ILogger {

// }
