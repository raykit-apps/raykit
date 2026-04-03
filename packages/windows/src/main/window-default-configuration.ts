import type { WindowConfiguration, WindowConfigurationContribution, WindowConfigurationRegistry } from '../common'
import { app } from 'electron'
import { injectable } from 'inversify'
import {
  MainWindowConfigurationId,
  ViewWindowConfigurationId,
  WindowMinimumSize,
} from '../common'

export function createDefaultMainWindowConfiguration(title = app.getName() || 'Raykit'): WindowConfiguration {
  return {
    id: MainWindowConfigurationId,
    role: 'main',
    title,
    width: 1200,
    height: 800,
    minWidth: WindowMinimumSize.width,
    minHeight: WindowMinimumSize.height,
    show: true,
    singleton: true,
  }
}

export function createDefaultStandaloneViewWindowConfiguration(title = app.getName() || 'Raykit'): WindowConfiguration {
  return {
    id: ViewWindowConfigurationId,
    role: 'view',
    title,
    width: 960,
    height: 720,
    minWidth: WindowMinimumSize.width,
    minHeight: WindowMinimumSize.height,
    show: true,
    singleton: true,
    hideTitleBar: true,
    showWindowControls: true,
  }
}

@injectable()
export class DefaultWindowConfigurationContribution implements WindowConfigurationContribution {
  registerWindowConfigurations(registry: WindowConfigurationRegistry): void {
    registry.registerWindowConfiguration(createDefaultMainWindowConfiguration())
    registry.registerWindowConfiguration(createDefaultStandaloneViewWindowConfiguration())
  }
}
