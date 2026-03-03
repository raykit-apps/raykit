import type { IAppWindow, IOpenOptions, IWindowMainService } from './window'
import { inject, injectable } from 'inversify'
import { WindowFactory } from './window'

@injectable()
export class WindowMainService implements IWindowMainService {
  private readonly windows = new Map<number, IAppWindow>()

  constructor(
    @inject(WindowFactory)
    protected readonly windowFactory: WindowFactory,
  ) {}

  async open(_options: IOpenOptions): Promise<IAppWindow[]> {
    const win = await this.doOpen()
    return [win]
  }

  private async doOpen() {
    return this.windowFactory()
  }
}
