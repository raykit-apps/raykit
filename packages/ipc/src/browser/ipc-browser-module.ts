import { ContainerModule } from 'inversify'
import { IpcChannelService } from './ipc-browser-service'

export const ipcBrowserModule = new ContainerModule((options) => {
  options.bind(IpcChannelService).toSelf().inSingletonScope()
})
