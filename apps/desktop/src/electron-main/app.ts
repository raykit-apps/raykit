import { Disposable } from '@raykit/common'

export class RaykitApplication extends Disposable {
  constructor() {
    super()
  }

  async startup(): Promise<void> {}
}
