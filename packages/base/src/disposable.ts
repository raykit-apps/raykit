import type { Event } from './event'
import { Emitter } from './event'
import { isFunction, isObject } from './types'

export interface Disposable {
  dispose: () => void
}

export namespace Disposable {
  export function is(arg: unknown): arg is Disposable {
    return isObject<Disposable>(arg) && isFunction(arg.dispose)
  }
  export function create(func: () => void): Disposable {
    return { dispose: func }
  }
  /** Always provides a reference to a new disposable. */
  export declare const NULL: Disposable
}

Object.defineProperty(Disposable, 'NULL', {
  configurable: false,
  enumerable: true,
  get(): Disposable {
    return { dispose: () => { } }
  },
})

export class DisposableCollection implements Disposable {
  protected readonly disposables: Disposable[] = []
  protected readonly onDisposeEmitter = new Emitter<void>()

  constructor(...toDispose: Disposable[]) {
    toDispose.forEach(d => this.push(d))
  }

  get onDispose(): Event<void> {
    return this.onDisposeEmitter.event
  }

  protected checkDisposed(): void {
    if (this.disposed && !this.disposingElements) {
      this.onDisposeEmitter.fire(undefined)
      this.onDisposeEmitter.dispose()
    }
  }

  get disposed(): boolean {
    return this.disposables.length === 0
  }

  private disposingElements = false
  dispose(): void {
    if (this.disposed || this.disposingElements) {
      return
    }
    this.disposingElements = true
    while (!this.disposed) {
      try {
        this.disposables.pop()!.dispose()
      } catch (e) {
        console.error(e)
      }
    }
    this.disposingElements = false
    this.checkDisposed()
  }

  push(disposable: Disposable): Disposable {
    const disposables = this.disposables
    disposables.push(disposable)
    const originalDispose = disposable.dispose.bind(disposable)
    const toRemove = Disposable.create(() => {
      const index = disposables.indexOf(disposable)
      if (index !== -1) {
        disposables.splice(index, 1)
      }
      this.checkDisposed()
    })
    disposable.dispose = () => {
      toRemove.dispose()
      disposable.dispose = originalDispose
      originalDispose()
    }
    return toRemove
  }

  pushAll(disposables: Disposable[]): Disposable[] {
    return disposables.map(disposable =>
      this.push(disposable),
    )
  }
}

export type DisposableGroup = { push: (disposable: Disposable) => void } | { add: (disposable: Disposable) => void }
export namespace DisposableGroup {
  export function canPush(candidate?: DisposableGroup): candidate is { push: (disposable: Disposable) => void } {
    return Boolean(candidate && (candidate as { push: () => void }).push)
  }
  export function canAdd(candidate?: DisposableGroup): candidate is { add: (disposable: Disposable) => void } {
    return Boolean(candidate && (candidate as { add: () => void }).add)
  }
}
