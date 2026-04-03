import type { ApplicationMainContribution } from '@raykit/core'
import { ContributionProvider } from '@raykit/base'
import { inject, injectable, named } from 'inversify'
import { ConnectionHandler } from '../common'
import { IpcMainService } from './ipc-main-service'

@injectable()
export class IpcMainContribution implements ApplicationMainContribution {
  constructor(
    @inject(IpcMainService)
    protected readonly ipcMainService: IpcMainService,
    @inject(ContributionProvider) @named(ConnectionHandler)
    protected readonly connectionHandlers: ContributionProvider<ConnectionHandler>,
  ) {}

  onStart() {
    this.ipcMainService.start()

    for (const connectionHandler of this.connectionHandlers.getContributions()) {
      this.ipcMainService.registerConnectionHandler(connectionHandler)
    }
  }

  onStop(): void {
    this.ipcMainService.dispose()
  }
}
