import type {
  ClientConnectionEvent,
  IpcConnectionContext,
  IProtocolMessage,
  IProtocolPort,
} from '../src/common'
import { Emitter, Event } from '@raykit/base'
import { describe, expect, it } from 'vitest'
import {
  createProxyIdentifier,
  IPCClient,
  IPCServer,
  MessagePortProtocol,
  ProxyChannel,
  RpcConnectionHandler,
} from '../src/common'

class MemoryPort<TMessage> implements IProtocolPort<TMessage> {
  peer?: MemoryPort<TMessage>
  protected readonly listeners = new Set<(message: TMessage) => void>()
  protected closed = false

  postMessage(message: TMessage): void {
    if (this.closed || !this.peer) {
      return
    }

    queueMicrotask(() => {
      this.peer?.dispatch(structuredClone(message))
    })
  }

  start(): void {
    // NOOP
  }

  close(): void {
    this.closed = true
  }

  addMessageListener(listener: (message: TMessage) => void) {
    this.listeners.add(listener)
    return {
      dispose: () => {
        this.listeners.delete(listener)
      },
    }
  }

  protected dispatch(message: TMessage): void {
    if (this.closed) {
      return
    }

    for (const listener of this.listeners) {
      listener(message)
    }
  }
}

function createProtocolPair() {
  const serverPort = new MemoryPort<IProtocolMessage<IpcConnectionContext>>()
  const clientPort = new MemoryPort<IProtocolMessage<IpcConnectionContext>>()

  serverPort.peer = clientPort
  clientPort.peer = serverPort

  return {
    serverProtocol: new MessagePortProtocol<IProtocolMessage<IpcConnectionContext>>(serverPort),
    clientProtocol: new MessagePortProtocol<IProtocolMessage<IpcConnectionContext>>(clientPort),
  }
}

describe('@raykit/ipc', () => {
  it('bridges proxy calls through rpc connection handlers', async () => {
    const serviceId = createProxyIdentifier<{
      getWindowId: () => Promise<number>
      sum: (left: number, right: number) => Promise<number>
    }>('raykit:test-service')

    const connectEmitter = new Emitter<ClientConnectionEvent<IpcConnectionContext>>()
    const server = new IPCServer<IpcConnectionContext>(connectEmitter.event)
    const handler = new RpcConnectionHandler(serviceId, (_connection, ctx) => ({
      getWindowId: () => ctx.windowId,
      sum: (left: number, right: number) => left + right,
    }))

    server.onDidAddConnection((connection) => {
      connection.channelServer.registerChannel(
        handler.channelName,
        handler.onConnection(connection.channelClient, connection.ctx),
      )
    })

    const { serverProtocol, clientProtocol } = createProtocolPair()
    const disconnectEmitter = new Emitter<void>()

    connectEmitter.fire({
      protocol: serverProtocol,
      onDidClientDisconnect: disconnectEmitter.event,
    })

    const client = new IPCClient(clientProtocol, {
      windowId: 7,
      configurationId: 'main',
      role: 'main',
    })

    const service = ProxyChannel.toService<{
      getWindowId: () => Promise<number>
      sum: (left: number, right: number) => Promise<number>
    }>(client.getChannel(handler.channelName))

    expect(await service.sum(1, 2)).toBe(3)
    expect(await service.getWindowId()).toBe(7)

    disconnectEmitter.fire()
    client.dispose()
    server.dispose()
  })

  it('bridges service events over the channel protocol', async () => {
    const connectEmitter = new Emitter<ClientConnectionEvent<IpcConnectionContext>>()
    const server = new IPCServer<IpcConnectionContext>(connectEmitter.event)
    const serviceEmitter = new Emitter<string>()

    server.registerChannel('raykit:test-events', ProxyChannel.fromService({
      emit(value: string) {
        serviceEmitter.fire(value)
      },
      onDidChangeValue: serviceEmitter.event,
    }))

    const { serverProtocol, clientProtocol } = createProtocolPair()
    const disconnectEmitter = new Emitter<void>()

    connectEmitter.fire({
      protocol: serverProtocol,
      onDidClientDisconnect: disconnectEmitter.event,
    })

    const client = new IPCClient(clientProtocol, {
      windowId: 1,
      role: 'main',
    })

    const service = ProxyChannel.toService<{
      emit: (value: string) => Promise<void>
      readonly onDidChangeValue: ReturnType<typeof serviceEmitter.event>
    }>(client.getChannel('raykit:test-events'))

    const eventPromise = Event.toPromise(service.onDidChangeValue)
    await service.emit('updated')

    expect(await eventPromise).toBe('updated')

    disconnectEmitter.fire()
    client.dispose()
    server.dispose()
  })
})
