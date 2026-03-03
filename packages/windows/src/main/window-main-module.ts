import type { ResolutionContext } from 'inversify'
import { ContainerModule } from 'inversify'
import { IAppWindow, IWindowMainService, WindowFactory } from './window'
import { AppWindow } from './window-impl'
import { WindowMainService } from './window-main-service'

export const windowMainModule = new ContainerModule((options) => {
  options.bind(IWindowMainService).to(WindowMainService).inSingletonScope()

  options.bind(IAppWindow).to(AppWindow)
  options.bind<WindowFactory>(WindowFactory).toFactory((context: ResolutionContext) => async () => {
    const win = context.get<IAppWindow>(IAppWindow)
    await win.init()
    return win
  })
})
