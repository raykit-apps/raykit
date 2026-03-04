import type { JSX } from 'solid-js'
import type { Message } from './widget'
import { injectable } from 'inversify'
import { render } from 'solid-js/web'
import { BaseWidget } from './widget'

@injectable()
export abstract class SolidWidget extends BaseWidget {
  constructor() {
    super()
  }

  protected override onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg)
    if (!this.isDisposed) {
      render(() => this.render(), this.node)
    }
  }

  protected abstract render(): JSX.Element
}
