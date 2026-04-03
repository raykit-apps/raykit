import { bindContributionProvider } from '@raykit/base'
import { ContainerModule } from 'inversify'
import { WindowConfigurationContribution, WindowConfigurationRegistry } from '../common'
import { IAppWindow, IWindowMainService, WindowFactory } from './window'
import { DefaultWindowConfigurationContribution } from './window-default-configuration'
import { AppWindow } from './window-impl'
import { WindowMainService } from './window-main-service'

export const windowMainModule = new ContainerModule((options) => {
  options.bind(WindowConfigurationRegistry).toSelf().inSingletonScope()
  bindContributionProvider(options, WindowConfigurationContribution)

  options.bind(DefaultWindowConfigurationContribution).toSelf().inSingletonScope()
  options.bind(WindowConfigurationContribution).toService(DefaultWindowConfigurationContribution)

  options.bind(WindowMainService).toSelf().inSingletonScope()
  options.bind(IWindowMainService).toService(WindowMainService)

  options.bind(IAppWindow).to(AppWindow)
  options.bind<WindowFactory>(WindowFactory).toFactory(context => async (windowOptions) => {
    const win = context.get<IAppWindow>(IAppWindow)
    await win.init(windowOptions)
    return win
  })
})
