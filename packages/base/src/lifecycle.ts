import { Iterable } from './iterator'

export interface IDisposable {
  dispose: () => void
}

export function isDisposable<E>(thing: E): thing is E & IDisposable {
  return typeof thing === 'object' && thing !== null && typeof (<IDisposable><any>thing).dispose === 'function' && (<IDisposable><any>thing).dispose.length === 0
}

export function dispose<T extends IDisposable>(disposable: T): T
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined
export function dispose<T extends IDisposable, A extends Iterable<T> = Iterable<T>>(disposables: A): A
export function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>
export function dispose<T extends IDisposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>
export function dispose<T extends IDisposable>(arg: T | Iterable<T> | undefined): any {
  if (Iterable.is(arg)) {
    const errors: any[] = []

    for (const d of arg) {
      if (d) {
        try {
          d.dispose()
        } catch (e) {
          errors.push(e)
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0]
    } else if (errors.length > 1) {
      throw new AggregateError(errors, 'Encountered errors while disposing of store')
    }

    return Array.isArray(arg) ? [] : arg
  } else if (arg) {
    arg.dispose()
    return arg
  }
}

class FunctionDisposable implements IDisposable {
  private _isDisposed: boolean
  private readonly _fn: () => void

  constructor(fn: () => void) {
    this._isDisposed = false
    this._fn = fn
  }

  dispose() {
    if (this._isDisposed) {
      return
    }
    if (!this._fn) {
      throw new Error(`Unbound disposable context: Need to use an arrow function to preserve the value of this`)
    }
    this._isDisposed = true
    this._fn()
  }
}

export function toDisposable(fn: () => void): IDisposable {
  return new FunctionDisposable(fn)
}

export type DisposableGroup = { push: (disposable: IDisposable) => void } | { add: (disposable: IDisposable) => void }

export namespace DisposableGroup {
  export function canPush(candidate?: DisposableGroup): candidate is { push: (disposable: IDisposable) => void } {
    return Boolean(candidate && (candidate as { push: () => void }).push)
  }

  export function canAdd(candidate?: DisposableGroup): candidate is { add: (disposable: IDisposable) => void } {
    return Boolean(candidate && (candidate as { add: () => void }).add)
  }
}

export class DisposableStore implements IDisposable {
  static DISABLE_DISPOSED_WARNING = false

  private readonly _toDispose = new Set<IDisposable>()
  private _isDisposed = false

  constructor() {}

  public dispose(): void {
    if (this._isDisposed) {
      return
    }

    this._isDisposed = true
    this.clear()
  }

  public get isDisposed(): boolean {
    return this._isDisposed
  }

  public clear(): void {
    if (this._toDispose.size === 0) {
      return
    }

    try {
      dispose(this._toDispose)
    } finally {
      this._toDispose.clear()
    }
  }

  public add<T extends IDisposable>(o: T): T {
    if (!o || o === Disposable.None) {
      return o
    }
    if ((o as unknown as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }

    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack)
      }
    } else {
      this._toDispose.add(o)
    }

    return o
  }

  public delete<T extends IDisposable>(o: T): void {
    if (!o) {
      return
    }
    if ((o as unknown as DisposableStore) === this) {
      throw new Error('Cannot dispose a disposable on itself!')
    }
    this._toDispose.delete(o)
    o.dispose()
  }

  public deleteAndLeak<T extends IDisposable>(o: T): void {
    if (!o) {
      return
    }
    this._toDispose.delete(o)
  }
}

export abstract class Disposable implements IDisposable {
  static readonly None = Object.freeze<IDisposable>({ dispose() { } })

  protected readonly _store = new DisposableStore()

  constructor() {
  }

  public dispose(): void {
    this._store.dispose()
  }

  protected _register<T extends IDisposable>(o: T): T {
    if ((o as unknown as Disposable) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(o)
  }
}

export class MutableDisposable<T extends IDisposable> implements IDisposable {
  private _value?: T
  private _isDisposed = false

  constructor() {
  }

  get value(): T | undefined {
    return this._isDisposed ? undefined : this._value
  }

  set value(value: T | undefined) {
    if (this._isDisposed || value === this._value) {
      return
    }

    this._value?.dispose()
    this._value = value
  }

  clear(): void {
    this.value = undefined
  }

  dispose(): void {
    this._isDisposed = true
    this._value?.dispose()
    this._value = undefined
  }

  clearAndLeak(): T | undefined {
    const oldValue = this._value
    this._value = undefined
    return oldValue
  }
}
