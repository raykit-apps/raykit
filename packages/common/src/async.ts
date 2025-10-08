// #region -- run on idle tricks ------------

import type { IDisposable } from './lifecycle'

export interface IdleDeadline {
  readonly didTimeout: boolean
  timeRemaining(): number
}

type IdleApi = Pick<typeof globalThis, 'requestIdleCallback' | 'cancelIdleCallback'>

export let runWhenGlobalIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable

export let _runWhenIdle: (targetWindow: IdleApi, callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable

(function () {
  const safeGlobal: any = globalThis
  if (typeof safeGlobal.requestIdleCallback !== 'function' || typeof safeGlobal.cancelIdleCallback !== 'function') {
    _runWhenIdle = (_targetWindow, runner, _timeout?) => {
      let disposed = false
      setTimeout(() => {
        if (disposed) {
          return
        }
        const end = Date.now() + 15
        const deadline: IdleDeadline = {
          didTimeout: true,
          timeRemaining() {
            return Math.max(0, end - Date.now())
          },
        }
        runner(Object.freeze(deadline))
      })
      return {
        dispose() {
          if (disposed) {
            return
          }
          disposed = true
        },
      }
    }
  } else {
    _runWhenIdle = (targetWindow: typeof safeGlobal, runner, timeout?) => {
      const handle: number = targetWindow.requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined)
      let disposed = false
      return {
        dispose() {
          if (disposed) {
            return
          }
          disposed = true
          targetWindow.cancelIdleCallback(handle)
        },
      }
    }
  }
  runWhenGlobalIdle = (runner, timeout) => _runWhenIdle(globalThis, runner, timeout)
})()

export abstract class AbstractIdleValue<T> {
  private readonly _executor: () => void
  private readonly _handle: IDisposable

  private _didRun: boolean = false
  private _value?: T
  private _error: unknown

  constructor(targetWindow: IdleApi, executor: () => T) {
    this._executor = () => {
      try {
        this._value = executor()
      } catch (err) {
        this._error = err
      } finally {
        this._didRun = true
      }
    }
    this._handle = _runWhenIdle(targetWindow, () => this._executor())
  }

  dispose(): void {
    this._handle.dispose()
  }

  get value(): T {
    if (!this._didRun) {
      this._handle.dispose()
      this._executor()
    }
    if (this._error) {
      throw this._error
    }
    return this._value!
  }

  get isInitialized(): boolean {
    return this._didRun
  }
}

export class GlobalIdleValue<T> extends AbstractIdleValue<T> {
  constructor(executor: () => T) {
    super(globalThis, executor)
  }
}

// #endregion
