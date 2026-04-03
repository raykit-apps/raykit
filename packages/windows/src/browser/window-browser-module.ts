import { ContainerModule } from 'inversify'
import { WindowBrowserService } from './window-browser-service'

export const windowBrowserModule = new ContainerModule((options) => {
  options.bind(WindowBrowserService).toSelf().inSingletonScope()
})
