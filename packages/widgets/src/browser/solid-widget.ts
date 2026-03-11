import type { JSX } from 'solid-js'
import type { Message } from './widget'
import { toDisposable } from '@raykit/base'
import { injectable } from 'inversify'
import { render } from 'solid-js/web'
import { BaseWidget } from './widget'

@injectable()
export abstract class SolidWidget extends BaseWidget {
  protected toDispose?: () => void

  constructor() {
    super()
    this._register(toDisposable(() => this.toDispose?.()))
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg)
    if (!this.toDispose) {
      this.toDispose = render(() => this.render(), this.node)
    }
  }

  protected abstract render(): JSX.Element
}
