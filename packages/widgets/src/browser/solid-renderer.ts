import type { JSX } from 'solid-js'
import { Disposable, toDisposable } from '@raykit/base'
import { inject, injectable, optional } from 'inversify'
import { render } from 'solid-js/web'

export type RendererHost = HTMLElement
export const RendererHost = Symbol('RendererHost')

@injectable()
export class SolidRenderer extends Disposable {
  protected toDispose?: () => void
  readonly host: HTMLElement

  constructor(
    @inject(RendererHost) @optional() host?: RendererHost,
  ) {
    super()
    this.host = host || document.createElement('div')
    this._register(toDisposable(() => this.toDispose?.()))
  }

  render(): void {
    if (this._store.isDisposed) {
      return
    }
    this.toDispose = render(() => this.doRender(), this.host)
  }

  protected doRender(): JSX.Element {
    return undefined
  }
}
