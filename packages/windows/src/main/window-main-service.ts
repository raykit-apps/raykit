import type { IOpenOptions, IWindowMainService } from './window'
import { inject, injectable } from 'inversify'
import { WindowFactory } from './window'

@injectable()
export class WindowMainService implements IWindowMainService {
  constructor(
    @inject(WindowFactory)
    protected readonly windowFactory: WindowFactory,
  ) {}

  async open(_options: IOpenOptions) {
    const win = await this.doOpen()
    return [win]
  }

  private async doOpen() {
    return this.windowFactory()
  }
}
