import type { DisposableStore, IDisposable } from './lifecycle'
import { Disposable } from './lifecycle'

export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: any, disposable?: IDisposable[] | DisposableStore): IDisposable
}

export namespace Event {
  export const None: Event<any> = () => Disposable.None
}
