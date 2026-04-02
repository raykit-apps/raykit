import { bindContributionProvider } from '@raykit/base'
import { ApplicationMainContribution } from '@raykit/core/main'
import { ContainerModule } from 'inversify'
import { TrayContribution, TrayMenuRegistry, TrayMenuService } from '../common'
import { DefaultTrayContribution } from './tray-default-contribution'
import { TrayMainContribution } from './tray-main-contribution'

export const trayMainModule = new ContainerModule((options) => {
  options.bind(TrayMenuRegistry).toSelf().inSingletonScope()
  options.bind(TrayMenuService).toService(TrayMenuRegistry)
  options.bind(DefaultTrayContribution).toSelf().inSingletonScope()
  options.bind(TrayContribution).toService(DefaultTrayContribution)
  options.bind(ApplicationMainContribution).to(TrayMainContribution).inSingletonScope()

  bindContributionProvider(options, TrayContribution)
})
