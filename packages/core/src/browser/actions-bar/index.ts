import type { ContainerModuleLoadOptions } from 'inversify'
import { ActionsBar } from './actions-bar'
import { IActionsBar } from './types'

export * from './actions-bar'
export * from './types'

export function bindStatusBar(options: ContainerModuleLoadOptions) {
  options.bind(ActionsBar).toSelf().inSingletonScope()
  options.bind(IActionsBar).to(ActionsBar).inSingletonScope()
}
