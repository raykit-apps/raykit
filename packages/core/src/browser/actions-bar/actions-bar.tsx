import type { JSX } from 'solid-js/jsx-runtime'
import type { IActionsBar } from './types'
import { SolidWidget } from '@raykit/widgets'
import { injectable } from 'inversify'

@injectable()
export class ActionsBar extends SolidWidget implements IActionsBar {
  constructor() {
    super()
    this.id = 'raykit-action-bar'
  }

  async setBackgroundColor() {

  }

  protected render(): JSX.Element {
    return <div>文字</div>
  }
}
