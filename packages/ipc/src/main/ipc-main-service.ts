import type { IpcMainEvent, MessagePortMain } from 'electron'
import type { ClientConnectionEvent, ConnectionHandler, IpcConnection, IpcConnectionContext, IProtocolMessage, IProtocolPort } from '../common'
import { Disposable, Emitter, toDisposable } from '@raykit/base'
import { ipcMain, MessageChannelMain } from 'electron'
import { injectable } from 'inversify'
import { IpcChannels, IPCServer, MessagePortProtocol } from '../common'

function toProtocolPort(port: MessagePortMain): IProtocolPort<IProtocolMessage<IpcConnectionContext>> {
  return {
    postMessage: (message: IProtocolMessage<IpcConnectionContext>) => {
      port.postMessage(message)
    },
    start: () => {
      port.start()
    },
    close: () => {
      port.close()
    },
    addMessageListener: (listener: (message: IProtocolMessage<IpcConnectionContext>) => void) => {
      const handleMessage = (event: { data: IProtocolMessage<IpcConnectionContext> }) => {
        listener(event.data)
      }

      port.on('message', handleMessage)
      return {
        dispose: () => {
          port.removeListener('message', handleMessage)
        },
      }
    },
  }
}

@injectable()
export class IpcMainService extends Disposable {
  protected readonly connectionHandlers = new Map<string, ConnectionHandler<IpcConnectionContext>>()
  protected readonly onDidClientConnectEmitter = this._register(new Emitter<ClientConnectionEvent<IpcConnectionContext>>())
  protected readonly server = this._register(new IPCServer<IpcConnectionContext>(this.onDidClientConnectEmitter.event))
  protected started = false

  readonly onDidAddConnection = this.server.onDidAddConnection
  readonly onDidRemoveConnection = this.server.onDidRemoveConnection

  constructor() {
    super()

    this._register(this.server.onDidAddConnection((connection) => {
      this.registerHandlersForConnection(connection)
    }))
  }

  get connections(): readonly IpcConnection<IpcConnectionContext>[] {
    return this.server.connections
  }

  start(): void {
    if (this.started) {
      return
    }

    this.started = true
    ipcMain.on(IpcChannels.acquirePort, this.handleAcquirePort)

    this._register(toDisposable(() => {
      ipcMain.removeListener(IpcChannels.acquirePort, this.handleAcquirePort)
      this.started = false
    }))
  }

  registerConnectionHandler(handler: ConnectionHandler<IpcConnectionContext>): void {
    this.connectionHandlers.set(handler.channelName, handler)

    for (const connection of this.server.connections) {
      this.registerHandlerForConnection(handler, connection)
    }
  }

  protected registerHandlersForConnection(connection: IpcConnection<IpcConnectionContext>): void {
    for (const handler of this.connectionHandlers.values()) {
      this.registerHandlerForConnection(handler, connection)
    }
  }

  protected registerHandlerForConnection(
    handler: ConnectionHandler<IpcConnectionContext>,
    connection: IpcConnection<IpcConnectionContext>,
  ): void {
    try {
      connection.channelServer.registerChannel(
        handler.channelName,
        handler.onConnection(connection.channelClient, connection.ctx),
      )
    } catch (error) {
      console.error(`Failed to bind IPC connection handler '${handler.channelName}'.`, error)
    }
  }

  protected readonly handleAcquirePort = (event: IpcMainEvent, nonce: unknown): void => {
    if (typeof nonce !== 'string' || event.sender.isDestroyed()) {
      return
    }

    const { port1, port2 } = new MessageChannelMain()
    const onDidClientDisconnectEmitter = new Emitter<void>()

    const disposeConnection = () => {
      onDidClientDisconnectEmitter.fire()
      onDidClientDisconnectEmitter.dispose()
    }

    port1.once('close', disposeConnection)
    event.sender.once('destroyed', disposeConnection)

    event.sender.postMessage(IpcChannels.acquirePortResult, nonce, [port2])

    this.onDidClientConnectEmitter.fire({
      protocol: new MessagePortProtocol<IProtocolMessage<IpcConnectionContext>>(toProtocolPort(port1)),
      onDidClientDisconnect: onDidClientDisconnectEmitter.event,
    })
  }
}
