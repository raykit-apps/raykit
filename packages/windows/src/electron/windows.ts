import type { IExtensionWindow, IHubWindow } from '@raykit/window/electron'
import { createDecorator } from '@raykit/instantiation'

export const IWindowsMainService = createDecorator<IWindowsMainService>('windowsMainService')

export interface IWindowsMainService {
  readonly _serviceBrand: undefined

  openHub(): Promise<IHubWindow>

  open(): Promise<IExtensionWindow>
  // openExtensionPanel(): void

  // getFocusedWindow(): void

  // getExtensionPanel(): void
  // getWindows(): void

  // getWindowById(): void
}
