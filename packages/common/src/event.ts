import type { DisposableStore, IDisposable } from './lifecycle'
import { Disposable } from './lifecycle'

const _enableSnapshotPotentialLeakWarning = false

export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: any, disposable?: IDisposable[] | DisposableStore): IDisposable
}

export namespace Event {
  export const None: Event<any> = () => Disposable.None

  function _addLeakageTraceLogic(option: EmitterOptions) {
    if(_enableSnapshotPotentialLeakWarning) {
      const { onDidAddListener: origListenerDidAdd } = option
      const stack =
    }
  }

  export function once<T>(event: Event<T>): Event<T> {
    return (listener, thisArgs = null, disposable?) => {
      let didFire = false
      const result: IDisposable = event((e) => {
        if (didFire) {
          return
        } else if (result) {
          result.dispose()
        } else {
          didFire = true
        }

        return listener.call(thisArgs, e)
      }, null, disposable)

      if (didFire) {
        result.dispose()
      }

      return result
    }
  }
}

export interface EmitterOptions {
  onWillAddFirstListener?: Function
  onDidAddFirstListener?: Function
  onDidAddListener?: Function
  onDidRemoveLastListener?: Function
  onWillRemoveListener?: Function
  onListenerError?: (e: any) => void
  leakWarningThreshold?: number
  deliveryQueue?: EventDeliveryQueue
  _profName?: string
}

class Stacktrace {

  static create() {
    const err = new Error()
    return new Stacktrace(err.stack ?? '')
  }

  private constructor(readonly value: string) {}

  print() {
    console.warn(this.value.split('\n').slice(2).join('\n'))
  }
}

export interface EventDeliveryQueue {
  _isEventDeliveryQueue: true
}
