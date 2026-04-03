import type {
  BrowserWindowConstructorOptions,
  TitleBarOverlay,
  WebPreferences,
} from 'electron'
import type { WindowConfiguration, WindowContext } from '../common'
import type { DisplayLike } from './window-state'
import {
  MainWindowConfigurationId,
  WindowMinimumSize,
} from '../common'
import { validateWindowBounds } from './window-state'

export interface BrowserWindowRuntimeOptions {
  additionalArguments?: string[]
  preload?: string
}

export function normalizeWindowConfiguration(configuration: WindowConfiguration): WindowConfiguration {
  const normalized: WindowConfiguration = {
    center: true,
    minHeight: WindowMinimumSize.height,
    minWidth: WindowMinimumSize.width,
    role: configuration.role ?? inferWindowRole(configuration.id),
    show: true,
    singleton: true,
    ...configuration,
  }

  if (normalized.hideTitleBar) {
    normalized.titleBarStyle ??= 'hidden'

    if (normalized.showWindowControls) {
      normalized.frame ??= true
      normalized.titleBarOverlay ??= true
    } else {
      normalized.frame ??= false
    }
  }

  return normalized
}

export function mergeWindowConfiguration(
  base: WindowConfiguration,
  override?: Partial<WindowConfiguration>,
): WindowConfiguration {
  return normalizeWindowConfiguration({
    ...base,
    ...override,
    id: override?.id ?? base.id,
    role: override?.role ?? base.role,
  })
}

export function inferWindowRole(id: string): WindowContext['role'] {
  return id === MainWindowConfigurationId ? 'main' : 'view'
}

export function getWindowReuseKey(
  configuration: WindowConfiguration,
  context: WindowContext,
  forceReuseWindow = false,
): string | undefined {
  if (configuration.singleton === false && !forceReuseWindow) {
    return undefined
  }

  if (context.role === 'view' && context.viewId) {
    return `${context.configurationId}:${context.viewId}`
  }

  return context.configurationId
}

export function toBrowserWindowOptions(
  configuration: WindowConfiguration,
  runtime: BrowserWindowRuntimeOptions = {},
  displays: readonly DisplayLike[] = [],
): BrowserWindowConstructorOptions {
  const normalized = normalizeWindowConfiguration(configuration)
  const validatedBounds = validateWindowBounds(normalized, displays)

  const webPreferences: WebPreferences = {
    additionalArguments: runtime.additionalArguments,
    contextIsolation: true,
    nodeIntegration: false,
    preload: runtime.preload,
  }

  const options: BrowserWindowConstructorOptions = {
    alwaysOnTop: normalized.alwaysOnTop,
    backgroundColor: normalized.backgroundColor,
    closable: normalized.closable,
    focusable: normalized.focusable,
    frame: normalized.frame,
    fullscreen: normalized.fullscreen,
    fullscreenable: normalized.fullscreenable,
    height: validatedBounds?.height ?? normalized.height,
    maximizable: normalized.maximizable,
    minimizable: normalized.minimizable,
    minHeight: normalized.minHeight,
    minWidth: normalized.minWidth,
    movable: normalized.movable,
    resizable: normalized.resizable,
    roundedCorners: normalized.roundedCorners,
    show: normalized.show,
    skipTaskbar: normalized.skipTaskbar,
    title: normalized.title,
    titleBarOverlay: normalized.titleBarOverlay as TitleBarOverlay | boolean | undefined,
    titleBarStyle: normalized.titleBarStyle,
    trafficLightPosition: normalized.trafficLightPosition,
    transparent: normalized.transparent,
    type: normalized.type,
    useContentSize: normalized.useContentSize,
    webPreferences,
    width: validatedBounds?.width ?? normalized.width,
  }

  if (validatedBounds) {
    options.x = validatedBounds.x
    options.y = validatedBounds.y
  } else if (normalized.center !== false && normalized.x === undefined && normalized.y === undefined) {
    options.center = true
  } else {
    options.x = normalized.x
    options.y = normalized.y
  }

  return options
}
