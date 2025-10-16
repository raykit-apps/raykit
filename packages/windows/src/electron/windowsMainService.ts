import type { IExtensionWindow, IHubWindow } from '@raykit/window/electron'
import type { IWindowsMainService } from './windows'
import { Disposable } from '@raykit/common'
import { IInstantiationService } from '@raykit/instantiation'

export class WindowsMainService extends Disposable implements IWindowsMainService {
  readonly _serviceBrand: undefined

  private readonly windows = new Map<number, IExtensionWindow>()
  private readonly hubWindow: IHubWindow | null = null

  constructor(@IInstantiationService private readonly instantiationService: IInstantiationService) {
    super()
  }

  async open(): Promise<IExtensionWindow> {
    this.instantiationService.createInstance()
  }

  async openHub(): Promise<IHubWindow> {

  }
}
