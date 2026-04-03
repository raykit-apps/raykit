import type { Event, IDisposable, MaybePromise } from '@raykit/base'
import { ContributionProvider, Disposable, Emitter, toDisposable } from '@raykit/base'
import { inject, injectable, named } from 'inversify'

/**
 * The minimum window size used when callers do not provide one.
 */
export const WindowMinimumSize = {
  width: 750,
  height: 475,
}

/**
 * The built-in window configuration id used for the main application window.
 */
export const MainWindowConfigurationId = 'main'

/**
 * The built-in window configuration id used for standalone view windows.
 */
export const ViewWindowConfigurationId = 'view'

/**
 * IPC channels used by renderer and main-side window services.
 */
export const WindowChannels = {
  fetchShellEnv: 'raykit:fetchShellEnv',
  open: 'raykit:window:open',
  openMain: 'raykit:window:open-main',
  openStandaloneView: 'raykit:window:open-standalone-view',
  resolveConfiguration: 'raykit:window-config',
} as const

/**
 * High-level role of a window instance.
 */
export type WindowRole = 'main' | 'view'

/**
 * Electron title bar styles supported by the window service.
 */
export type WindowTitleBarStyle = 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover'

/**
 * Electron window types supported by the window service.
 */
export type WindowType = 'normal' | 'desktop' | 'textured' | 'panel' | 'toolbar' | 'splash' | 'notification' | string

/**
 * Simple two-dimensional point.
 */
export interface IPoint {
  /** Horizontal position in screen coordinates. */
  x: number
  /** Vertical position in screen coordinates. */
  y: number
}

/**
 * Window bounds in screen coordinates.
 */
export interface IFrame {
  /** Horizontal position in screen coordinates. */
  x: number
  /** Vertical position in screen coordinates. */
  y: number
  /** Window width. */
  width: number
  /** Window height. */
  height: number
}

/**
 * Native title bar overlay colors and sizing.
 */
export interface WindowTitleBarOverlay {
  /** Background color of the overlay area. */
  color?: string
  /** Foreground color of native window control symbols. */
  symbolColor?: string
  /** Overlay height in pixels. */
  height?: number
}

/**
 * Declarative window configuration contributed by packages.
 */
export interface WindowConfiguration {
  /** Unique window configuration id. */
  id: string

  /** Semantic role of the created window. */
  role?: WindowRole

  /**
   * Base window title.
   * Standalone view windows will bind the final title to the contributed view label.
   */
  title?: string

  /** Initial horizontal position. */
  x?: number

  /** Initial vertical position. */
  y?: number

  /** Initial window width. */
  width?: number

  /** Initial window height. */
  height?: number

  /** Center the window when explicit `x` and `y` are not provided. */
  center?: boolean

  /** Minimum allowed width. */
  minWidth?: number

  /** Minimum allowed height. */
  minHeight?: number

  /** Whether the window should be visible immediately after creation. */
  show?: boolean

  /** Whether the window should start in fullscreen mode. */
  fullscreen?: boolean

  /** Whether the window should start maximized. */
  maximized?: boolean

  /** Whether the window should stay out of the taskbar or dock window list. */
  skipTaskbar?: boolean

  /** Whether the native frame is shown. */
  frame?: boolean

  /** Whether the native title bar should be hidden. */
  hideTitleBar?: boolean

  /** Whether native window controls should remain visible when the title bar is hidden. */
  showWindowControls?: boolean

  /** Explicit native title bar style override. */
  titleBarStyle?: WindowTitleBarStyle

  /** Native title bar overlay configuration. */
  titleBarOverlay?: boolean | WindowTitleBarOverlay

  /** Custom macOS traffic light position. */
  trafficLightPosition?: IPoint

  /** Native window type passed to Electron. */
  type?: WindowType

  /** Whether this configuration should reuse an existing window by default. */
  singleton?: boolean

  /** Whether frameless windows should keep rounded corners when supported. */
  roundedCorners?: boolean

  /** Whether the window background should be transparent. */
  transparent?: boolean

  /** Native background color. */
  backgroundColor?: string

  /** Whether width and height describe the content area instead of the outer frame. */
  useContentSize?: boolean

  /** Whether the window can be resized. */
  resizable?: boolean

  /** Whether the window can be moved. */
  movable?: boolean

  /** Whether the window can be minimized. */
  minimizable?: boolean

  /** Whether the window can be maximized. */
  maximizable?: boolean

  /** Whether the window can be closed. */
  closable?: boolean

  /** Whether the window can enter fullscreen mode. */
  fullscreenable?: boolean

  /** Whether the window can receive focus. */
  focusable?: boolean

  /** Whether the window should stay above normal windows. */
  alwaysOnTop?: boolean
}

/**
 * Runtime identity injected into each renderer window.
 */
export interface WindowContext {
  /** Configuration id used to create the current window. */
  configurationId: string

  /** High-level role of the current window. */
  role: WindowRole

  /** Contributed view id when the window hosts a standalone view. */
  viewId?: string

  /** Contributed view label when the window hosts a standalone view. */
  viewLabel?: string
}

/**
 * Generic window open flags shared by all open requests.
 */
export interface IOpenWindowOptions {
  /** Force reusing an existing compatible window when possible. */
  forceReuseWindow?: boolean

  /** Force creating a new window instance. */
  forceNewWindow?: boolean

  /** Prefer creating a new window when reuse is optional. */
  preferNewWindow?: boolean
}

/**
 * Request used to open a contributed window configuration.
 */
export interface IOpenWindowRequest extends IOpenWindowOptions {
  /** Contributed configuration id to open. */
  configId?: string

  /** Per-open configuration override. */
  window?: Partial<WindowConfiguration>
}

/**
 * Request used to open or reveal the main window.
 */
export interface IOpenMainWindow extends IOpenWindowOptions {
  /** Per-open configuration override for the main window. */
  window?: Partial<WindowConfiguration>
}

/**
 * Request used to open a contributed view as a standalone window.
 */
export interface IOpenStandaloneViewWindow extends IOpenWindowOptions {
  /** Contributed widget id of the standalone view. */
  viewId: string

  /** Human-readable view label contributed by the view command. */
  viewLabel?: string

  /** Window configuration id to use for the standalone view. */
  configId?: string

  /** Per-open configuration override for the standalone view window. */
  window?: Partial<WindowConfiguration>
}

/**
 * Standalone window settings declared by a view contribution.
 */
export interface StandaloneViewWindowOptions {
  /** Whether the current view can be opened as a standalone window. */
  enabled?: boolean

  /** Window configuration id used when opening the view in its own window. */
  configId?: string

  /** Per-view window configuration override. */
  window?: Partial<WindowConfiguration>
}

/**
 * Payload injected into the renderer through preload.
 */
export interface WindowRendererConfigurationPayload {
  /** Runtime identity of the current window. */
  window: WindowContext
}

/**
 * Symbol used to contribute window configurations into the registry.
 */
export const WindowConfigurationContribution = Symbol('WindowConfigurationContribution')

/**
 * Contribution interface for registering window configurations.
 */
export interface WindowConfigurationContribution {
  /** Register all configurations owned by the contribution. */
  registerWindowConfigurations: (registry: WindowConfigurationRegistry) => MaybePromise<void>
}

/**
 * Registry that collects all contributed window configurations.
 */
@injectable()
export class WindowConfigurationRegistry {
  protected readonly configurations = new Map<string, WindowConfiguration>()
  protected readonly unregisterConfigurations = new Map<string, IDisposable>()
  protected started = false

  protected readonly onDidChangeConfigurationsEmitter = new Emitter<void>()

  /** Fired whenever the set of registered window configurations changes. */
  readonly onDidChangeConfigurations: Event<void> = this.onDidChangeConfigurationsEmitter.event

  constructor(
    @inject(ContributionProvider)
    @named(WindowConfigurationContribution)
    protected readonly contributionProvider: ContributionProvider<WindowConfigurationContribution>,
  ) {}

  /** Start all window configuration contributions once. */
  async onStart(): Promise<void> {
    if (this.started) {
      return
    }
    this.started = true

    for (const contribution of this.contributionProvider.getContributions()) {
      await contribution.registerWindowConfigurations(this)
    }
  }

  /** Register or replace a window configuration by id. */
  registerWindowConfiguration(configuration: WindowConfiguration): IDisposable {
    const existing = this.unregisterConfigurations.get(configuration.id)
    if (existing) {
      console.warn(`Window configuration '${configuration.id}' is already registered. Replacing the existing configuration.`)
      existing.dispose()
    }

    this.configurations.set(configuration.id, { ...configuration })

    const toDispose = toDisposable(() => {
      this.configurations.delete(configuration.id)
      this.unregisterConfigurations.delete(configuration.id)
      this.onDidChangeConfigurationsEmitter.fire()
    })

    this.unregisterConfigurations.set(configuration.id, toDispose)
    this.onDidChangeConfigurationsEmitter.fire()
    return toDispose
  }

  /** Read a single contributed window configuration by id. */
  getWindowConfiguration(id: string): WindowConfiguration | undefined {
    const configuration = this.configurations.get(id)
    if (!configuration) {
      return undefined
    }
    return { ...configuration }
  }

  /** Read all contributed window configurations. */
  getWindowConfigurations(): readonly WindowConfiguration[] {
    return Array.from(this.configurations.values(), configuration => ({ ...configuration }))
  }
}

/**
 * No-op contribution that can be extended by consumers when needed.
 */
export class NoopWindowConfigurationContribution extends Disposable implements WindowConfigurationContribution {
  registerWindowConfigurations(): void {
    // NOOP
  }
}
