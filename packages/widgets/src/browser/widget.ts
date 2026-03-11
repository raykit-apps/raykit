import type { IDisposable } from '@raykit/base'
import { Widget } from '@lumino/widgets'
import { DisposableStore } from '@raykit/base'
import { decorate, injectable, unmanaged } from 'inversify'

decorate(injectable(), Widget)

export * from '@lumino/messaging'
export * from '@lumino/widgets'

@injectable()
export class BaseWidget extends Widget {
  protected readonly _store = new DisposableStore()

  constructor(@unmanaged() options?: Widget.IOptions) {
    super(options)
  }

  protected _register<T extends IDisposable>(o: T): T {
    if ((o as unknown as BaseWidget) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(o)
  }

  override dispose(): void {
    if (this.isDisposed) {
      return
    }
    super.dispose()
    this._store.dispose()
  }
}
