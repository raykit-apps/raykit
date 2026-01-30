import { Event } from './event'
import { isBoolean, isObject } from './types'

export interface CancellationToken {
  readonly isCancellationRequested: boolean
  readonly onCancellationRequested: Event<void>
}

const shortcutEvent: Event<void> = Object.freeze(Object.assign((callback: any, context?: any): any => {
  const handle = setTimeout(callback.bind(context), 0)
  return { dispose: () => clearTimeout(handle) }
}, {
  get maxListeners(): number { return 0 },
  set maxListeners(_maxListeners: number) { },
}))

export namespace CancellationToken {

  export const None: CancellationToken = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event.None,
  })

  export const Cancelled: CancellationToken = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent,
  })

  export function is(value: unknown): value is CancellationToken {
    return isObject<CancellationToken>(value) && (value === CancellationToken.None
      || value === CancellationToken.Cancelled
      || (isBoolean(value.isCancellationRequested) && !!value.onCancellationRequested))
  }
}
