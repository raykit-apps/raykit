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
    return (
      <footer class="h-10 px-2 flex border-t border-accent justify-between items-center">
        <div>左边</div>
        <div>右边</div>
      </footer>
    )
  }
}
