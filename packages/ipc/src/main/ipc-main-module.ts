import { bindContributionProvider } from '@raykit/base'
import { ApplicationMainContribution } from '@raykit/core'
import { ContainerModule } from 'inversify'
import { ConnectionHandler } from '../common'
import { IpcMainContribution } from './ipc-main-contribution'
import { IpcMainService } from './ipc-main-service'

export const ipcMainModule = new ContainerModule((options) => {
  bindContributionProvider(options, ConnectionHandler)
  options.bind(IpcMainService).toSelf().inSingletonScope()
  options.bind(ApplicationMainContribution).to(IpcMainContribution).inSingletonScope()
})
