import type {
  IOpenMainWindow,
  IOpenStandaloneViewWindow,
  IOpenWindowRequest,
  WindowContext,
  WindowRendererConfigurationPayload,
} from '../common'
import { injectable } from 'inversify'
import { WindowChannels } from '../common'

interface RaykitWindowGlobals {
  ipcRenderer?: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
  context?: {
    configuration: () => (WindowRendererConfigurationPayload & Record<string, unknown>) | undefined
    resolveConfiguration: () => Promise<(WindowRendererConfigurationPayload & Record<string, unknown>) | undefined>
  }
}

@injectable()
export class WindowBrowserService {
  protected contextPromise?: Promise<WindowContext | undefined>

  async open(options: IOpenWindowRequest = {}): Promise<number | undefined> {
    return this.invoke<number>(WindowChannels.open, options)
  }

  async openMainWindow(options: IOpenMainWindow = {}): Promise<number | undefined> {
    return this.invoke<number>(WindowChannels.openMain, options)
  }

  async openStandaloneView(options: IOpenStandaloneViewWindow): Promise<number | undefined> {
    return this.invoke<number>(WindowChannels.openStandaloneView, options)
  }

  async getCurrentWindowContext(): Promise<WindowContext | undefined> {
    if (!this.contextPromise) {
      this.contextPromise = this.doResolveCurrentWindowContext()
    }

    return this.contextPromise
  }

  async isStandaloneViewWindow(): Promise<boolean> {
    return (await this.getCurrentWindowContext())?.role === 'view'
  }

  protected async doResolveCurrentWindowContext(): Promise<WindowContext | undefined> {
    const globals = this.getRaykitGlobals()
    if (!globals?.context) {
      return undefined
    }

    const currentConfiguration = globals.context.configuration()
    if (currentConfiguration?.window) {
      return currentConfiguration.window
    }

    const resolvedConfiguration = await globals.context.resolveConfiguration()
    return resolvedConfiguration?.window
  }

  protected async invoke<T>(channel: string, payload?: unknown): Promise<T | undefined> {
    const globals = this.getRaykitGlobals()
    if (!globals?.ipcRenderer?.invoke) {
      throw new Error('Window browser service requires a preload bridge with window.raykit.ipcRenderer.invoke().')
    }

    return globals.ipcRenderer.invoke(channel, payload ?? {}) as Promise<T>
  }

  protected getRaykitGlobals(): RaykitWindowGlobals | undefined {
    return (globalThis as typeof globalThis & { raykit?: RaykitWindowGlobals }).raykit
  }
}
