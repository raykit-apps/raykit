import type { Event as EventType, IDisposable } from '@raykit/base'
import { CancellationToken, Deferred, Disposable, dispose, Emitter, Event, toDisposable } from '@raykit/base'

export const IpcChannels = {
  acquirePort: 'raykit:ipc:acquire-port',
  acquirePortResult: 'raykit:ipc:acquire-port:result',
} as const

export interface IpcConnectionContext {
  readonly windowId: number
  readonly configurationId?: string
  readonly role?: string
}

export interface IChannel {
  call: <T>(command: string, arg?: any, cancellationToken?: CancellationToken) => Promise<T>
  listen: <T>(event: string, arg?: any) => EventType<T>
}

export interface IServerChannel<TContext = IpcConnectionContext> {
  call: <T>(ctx: TContext, command: string, arg?: any, cancellationToken?: CancellationToken) => Promise<T>
  listen: <T>(ctx: TContext, event: string, arg?: any) => EventType<T>
}

export interface IChannelServer<TContext = IpcConnectionContext> {
  registerChannel: (channelName: string, channel: IServerChannel<TContext>) => void
}

export interface IChannelClient {
  getChannel: <T extends IChannel>(channelName: string) => T
}

export interface IProtocolPort<TMessage = unknown> {
  postMessage: (message: TMessage) => void
  start: () => void
  close: () => void
  addMessageListener: (listener: (message: TMessage) => void) => IDisposable
}

export interface IMessagePassingProtocol<TMessage = unknown> {
  send: (message: TMessage) => void
  readonly onMessage: EventType<TMessage>
}

export class MessagePortProtocol<TMessage = unknown> extends Disposable implements IMessagePassingProtocol<TMessage> {
  protected readonly onMessageEmitter = this._register(new Emitter<TMessage>())
  readonly onMessage: EventType<TMessage> = this.onMessageEmitter.event

  constructor(
    protected readonly port: IProtocolPort<TMessage>,
  ) {
    super()

    this._register(this.port.addMessageListener((message) => {
      this.onMessageEmitter.fire(message)
    }))

    this.port.start()
  }

  send(message: TMessage): void {
    this.port.postMessage(message)
  }

  override dispose(): void {
    this.port.close()
    super.dispose()
  }
}

const enum MessageType {
  ConnectionInitialize = 'connection:initialize',
  ChannelInitialize = 'channel:initialize',
  PromiseRequest = 'promise:request',
  PromiseCancel = 'promise:cancel',
  EventListen = 'event:listen',
  EventDispose = 'event:dispose',
  PromiseSuccess = 'promise:success',
  PromiseError = 'promise:error',
  EventFire = 'event:fire',
}

interface IConnectionInitializeMessage<TContext> {
  readonly type: MessageType.ConnectionInitialize
  readonly context: TContext
}

interface IChannelInitializeMessage {
  readonly type: MessageType.ChannelInitialize
}

interface IPromiseRequestMessage {
  readonly type: MessageType.PromiseRequest
  readonly id: number
  readonly channelName: string
  readonly command: string
  readonly arg: unknown
}

interface IPromiseCancelMessage {
  readonly type: MessageType.PromiseCancel
  readonly id: number
}

interface IEventListenMessage {
  readonly type: MessageType.EventListen
  readonly id: number
  readonly channelName: string
  readonly event: string
  readonly arg: unknown
}

interface IEventDisposeMessage {
  readonly type: MessageType.EventDispose
  readonly id: number
}

interface IPromiseSuccessMessage {
  readonly type: MessageType.PromiseSuccess
  readonly id: number
  readonly data: unknown
}

interface IPromiseErrorMessage {
  readonly type: MessageType.PromiseError
  readonly id: number
  readonly error: ISerializedError | unknown
}

interface IEventFireMessage {
  readonly type: MessageType.EventFire
  readonly id: number
  readonly data: unknown
}

export type IProtocolMessage<TContext = IpcConnectionContext>
  = | IConnectionInitializeMessage<TContext>
    | IChannelInitializeMessage
    | IPromiseRequestMessage
    | IPromiseCancelMessage
    | IEventListenMessage
    | IEventDisposeMessage
    | IPromiseSuccessMessage
    | IPromiseErrorMessage
    | IEventFireMessage

interface ISerializedError {
  readonly name: string
  readonly message: string
  readonly stack?: string
}

class CancellationError extends Error {
  constructor(message = 'Canceled') {
    super(message)
    this.name = 'CancellationError'
  }
}

class CancellationTokenSource implements IDisposable {
  protected readonly onCancellationRequestedEmitter = new Emitter<void>()
  protected cancelled = false
  readonly token: CancellationToken = {
    isCancellationRequested: false,
    onCancellationRequested: this.onCancellationRequestedEmitter.event,
  }

  constructor() {}

  cancel(): void {
    if (this.cancelled) {
      return
    }

    this.cancelled = true
    ;(this.token as { isCancellationRequested: boolean }).isCancellationRequested = true
    this.onCancellationRequestedEmitter.fire()
  }

  dispose(): void {
    this.cancel()
    this.onCancellationRequestedEmitter.dispose()
  }
}

interface PendingRequest {
  readonly request: IPromiseRequestMessage | IEventListenMessage
  readonly timeoutHandle: ReturnType<typeof setTimeout>
}

interface IResponseHandler {
  (message: IPromiseSuccessMessage | IPromiseErrorMessage | IEventFireMessage): void
}

function isUpperAsciiLetter(charCode: number | undefined): boolean {
  return typeof charCode === 'number' && charCode >= 65 && charCode <= 90
}

function serializeError(error: unknown): ISerializedError | unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return error
}

function deserializeError(error: ISerializedError | unknown): unknown {
  if (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof error.message === 'string'
  ) {
    const deserialized = new Error(error.message)

    if ('name' in error && typeof error.name === 'string') {
      deserialized.name = error.name
    }
    if ('stack' in error && typeof error.stack === 'string') {
      deserialized.stack = error.stack
    }

    return deserialized
  }

  return error
}

function asPromise<T>(value: T | Promise<T>): Promise<T> {
  return Promise.resolve(value)
}

export class ChannelServer<TContext = IpcConnectionContext> implements IChannelServer<TContext>, IDisposable {
  protected readonly channels = new Map<string, IServerChannel<TContext>>()
  protected readonly activeRequests = new Map<number, IDisposable>()
  protected readonly pendingRequests = new Map<string, PendingRequest[]>()
  protected readonly protocolListener: IDisposable

  constructor(
    protected readonly protocol: IMessagePassingProtocol<IProtocolMessage<TContext>>,
    protected readonly ctx: TContext,
    protected readonly timeoutDelay = 1000,
  ) {
    this.protocolListener = this.protocol.onMessage((message) => {
      this.onMessage(message)
    })

    this.protocol.send({ type: MessageType.ChannelInitialize })
  }

  registerChannel(channelName: string, channel: IServerChannel<TContext>): void {
    this.channels.set(channelName, channel)
    this.flushPendingRequests(channelName)
  }

  protected onMessage(message: IProtocolMessage<TContext>): void {
    if (message.type === MessageType.PromiseRequest) {
      this.onPromiseRequest(message)
      return
    }

    if (message.type === MessageType.EventListen) {
      this.onEventListen(message)
      return
    }

    if (message.type === MessageType.PromiseCancel || message.type === MessageType.EventDispose) {
      this.disposeActiveRequest(message.id)
    }
  }

  protected onPromiseRequest(request: IPromiseRequestMessage): void {
    const channel = this.channels.get(request.channelName)
    if (!channel) {
      this.collectPendingRequest(request)
      return
    }

    const cancellationTokenSource = new CancellationTokenSource()

    this.activeRequests.set(request.id, toDisposable(() => {
      cancellationTokenSource.cancel()
    }))

    asPromise(channel.call(this.ctx, request.command, request.arg, cancellationTokenSource.token))
      .then((result) => {
        this.protocol.send({
          type: MessageType.PromiseSuccess,
          id: request.id,
          data: result,
        })
      })
      .catch((error) => {
        this.protocol.send({
          type: MessageType.PromiseError,
          id: request.id,
          error: serializeError(error),
        })
      })
      .finally(() => {
        this.disposeActiveRequest(request.id)
      })
  }

  protected onEventListen(request: IEventListenMessage): void {
    const channel = this.channels.get(request.channelName)
    if (!channel) {
      this.collectPendingRequest(request)
      return
    }

    const event = channel.listen(this.ctx, request.event, request.arg)
    this.activeRequests.set(request.id, event((data) => {
      this.protocol.send({
        type: MessageType.EventFire,
        id: request.id,
        data,
      })
    }))
  }

  protected collectPendingRequest(request: IPromiseRequestMessage | IEventListenMessage): void {
    const pendingRequests = this.pendingRequests.get(request.channelName) ?? []
    const timeoutHandle = setTimeout(() => {
      if (request.type === MessageType.PromiseRequest) {
        this.protocol.send({
          type: MessageType.PromiseError,
          id: request.id,
          error: serializeError(new Error(`Unknown IPC channel '${request.channelName}'.`)),
        })
      }
    }, this.timeoutDelay)

    pendingRequests.push({ request, timeoutHandle })
    this.pendingRequests.set(request.channelName, pendingRequests)
  }

  protected flushPendingRequests(channelName: string): void {
    const pendingRequests = this.pendingRequests.get(channelName)
    if (!pendingRequests) {
      return
    }

    for (const pendingRequest of pendingRequests) {
      clearTimeout(pendingRequest.timeoutHandle)

      if (pendingRequest.request.type === MessageType.PromiseRequest) {
        this.onPromiseRequest(pendingRequest.request)
      } else {
        this.onEventListen(pendingRequest.request)
      }
    }

    this.pendingRequests.delete(channelName)
  }

  protected disposeActiveRequest(id: number): void {
    const request = this.activeRequests.get(id)
    if (!request) {
      return
    }

    request.dispose()
    this.activeRequests.delete(id)
  }

  dispose(): void {
    this.protocolListener.dispose()
    dispose(this.activeRequests.values())
    this.activeRequests.clear()

    for (const pendingRequests of this.pendingRequests.values()) {
      for (const pendingRequest of pendingRequests) {
        clearTimeout(pendingRequest.timeoutHandle)
      }
    }
    this.pendingRequests.clear()
  }
}

export class ChannelClient<TContext = IpcConnectionContext> implements IChannelClient, IDisposable {
  protected readonly handlers = new Map<number, IResponseHandler>()
  protected readonly protocolListener: IDisposable
  protected readonly onDidInitializeDeferred = new Deferred<void>()
  protected initialized = false
  protected disposed = false
  protected lastRequestId = 0

  constructor(
    protected readonly protocol: IMessagePassingProtocol<IProtocolMessage<TContext>>,
  ) {
    this.protocolListener = this.protocol.onMessage((message) => {
      this.onMessage(message)
    })
  }

  getChannel<T extends IChannel>(channelName: string): T {
    return {
      call: (command: string, arg?: any, cancellationToken?: CancellationToken) => {
        return this.requestPromise(channelName, command, arg, cancellationToken)
      },
      listen: (event: string, arg?: any) => {
        return this.requestEvent(channelName, event, arg)
      },
    } as T
  }

  protected onMessage(message: IProtocolMessage<TContext>): void {
    if (message.type === MessageType.ChannelInitialize) {
      this.initialized = true
      this.onDidInitializeDeferred.resolve?.()
      return
    }

    if (
      message.type === MessageType.PromiseSuccess
      || message.type === MessageType.PromiseError
      || message.type === MessageType.EventFire
    ) {
      this.handlers.get(message.id)?.(message)
    }
  }

  protected whenInitialized(): Promise<void> {
    return this.initialized ? Promise.resolve() : this.onDidInitializeDeferred.promise
  }

  protected requestPromise<T>(
    channelName: string,
    command: string,
    arg?: unknown,
    cancellationToken: CancellationToken = CancellationToken.None,
  ): Promise<T> {
    const id = this.lastRequestId++

    if (this.disposed || cancellationToken.isCancellationRequested) {
      return Promise.reject(new CancellationError())
    }

    return new Promise<T>((resolve, reject) => {
      const cancellationDisposable = cancellationToken.onCancellationRequested(() => {
        this.handlers.delete(id)
        this.protocol.send({
          type: MessageType.PromiseCancel,
          id,
        })
        reject(new CancellationError())
      })

      this.handlers.set(id, (message) => {
        cancellationDisposable.dispose()
        this.handlers.delete(id)

        if (message.type === MessageType.PromiseSuccess) {
          resolve(message.data as T)
          return
        }
        if (message.type === MessageType.PromiseError) {
          reject(deserializeError(message.error))
        }
      })

      this.whenInitialized()
        .then(() => {
          if (cancellationToken.isCancellationRequested) {
            return
          }

          this.protocol.send({
            type: MessageType.PromiseRequest,
            id,
            channelName,
            command,
            arg,
          })
        })
        .catch((error) => {
          cancellationDisposable.dispose()
          this.handlers.delete(id)
          reject(error)
        })
    })
  }

  protected requestEvent<T>(channelName: string, eventName: string, arg?: unknown): EventType<T> {
    const id = this.lastRequestId++
    let active = false
    let subscribed = false

    const emitter = new Emitter<T>({
      onFirstListenerAdd: () => {
        active = true
        this.handlers.set(id, (message) => {
          if (message.type === MessageType.EventFire) {
            emitter.fire(message.data as T)
          }
        })

        this.whenInitialized()
          .then(() => {
            if (!active || this.disposed) {
              return
            }

            subscribed = true
            this.protocol.send({
              type: MessageType.EventListen,
              id,
              channelName,
              event: eventName,
              arg,
            })
          })
          .catch((error) => {
            this.handlers.delete(id)
            console.error(`Failed to subscribe to IPC event '${channelName}.${eventName}'.`, error)
          })
      },
      onLastListenerRemove: () => {
        active = false
        this.handlers.delete(id)

        if (subscribed) {
          this.protocol.send({
            type: MessageType.EventDispose,
            id,
          })
          subscribed = false
        }
      },
    })

    return emitter.event
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.protocolListener.dispose()
    this.handlers.clear()
  }
}

export interface ClientConnectionEvent<TContext = IpcConnectionContext> {
  readonly protocol: IMessagePassingProtocol<IProtocolMessage<TContext>>
  readonly onDidClientDisconnect: EventType<void>
}

export interface IpcConnection<TContext = IpcConnectionContext> {
  readonly ctx: TContext
  readonly channelClient: ChannelClient<TContext>
  readonly channelServer: ChannelServer<TContext>
}

export class IPCServer<TContext = IpcConnectionContext> extends Disposable implements IChannelServer<TContext> {
  protected readonly channels = new Map<string, IServerChannel<TContext>>()
  protected readonly connectionSet = new Set<IpcConnection<TContext>>()
  protected readonly onDidAddConnectionEmitter = this._register(new Emitter<IpcConnection<TContext>>())
  protected readonly onDidRemoveConnectionEmitter = this._register(new Emitter<IpcConnection<TContext>>())

  readonly onDidAddConnection: EventType<IpcConnection<TContext>> = this.onDidAddConnectionEmitter.event
  readonly onDidRemoveConnection: EventType<IpcConnection<TContext>> = this.onDidRemoveConnectionEmitter.event

  constructor(
    onDidClientConnect: EventType<ClientConnectionEvent<TContext>>,
    protected readonly timeoutDelay = 1000,
  ) {
    super()

    this._register(onDidClientConnect((event) => {
      const connectionHandshakeDisposable = Event.once(event.protocol.onMessage)((message) => {
        if (message.type !== MessageType.ConnectionInitialize) {
          console.error('IPC connection failed because the first message was not a connection initializer.')
          return
        }

        const channelServer = new ChannelServer(event.protocol, message.context, this.timeoutDelay)
        const channelClient = new ChannelClient<TContext>(event.protocol)
        const connection: IpcConnection<TContext> = {
          ctx: message.context,
          channelClient,
          channelServer,
        }

        for (const [channelName, channel] of this.channels) {
          channelServer.registerChannel(channelName, channel)
        }

        this.connectionSet.add(connection)
        this.onDidAddConnectionEmitter.fire(connection)

        this._register(event.onDidClientDisconnect(() => {
          if (!this.connectionSet.has(connection)) {
            return
          }

          this.connectionSet.delete(connection)
          channelClient.dispose()
          channelServer.dispose()
          this.onDidRemoveConnectionEmitter.fire(connection)
        }))
      })

      this._register(connectionHandshakeDisposable)
    }))
  }

  get connections(): readonly IpcConnection<TContext>[] {
    return [...this.connectionSet]
  }

  registerChannel(channelName: string, channel: IServerChannel<TContext>): void {
    this.channels.set(channelName, channel)

    for (const connection of this.connectionSet) {
      connection.channelServer.registerChannel(channelName, channel)
    }
  }

  override dispose(): void {
    for (const connection of this.connectionSet) {
      connection.channelClient.dispose()
      connection.channelServer.dispose()
    }
    this.connectionSet.clear()

    super.dispose()
  }
}

export class IPCClient<TContext = IpcConnectionContext> implements IChannelClient, IChannelServer<TContext>, IDisposable {
  protected readonly channelClient: ChannelClient<TContext>
  protected readonly channelServer: ChannelServer<TContext>

  constructor(
    protected readonly protocol: IMessagePassingProtocol<IProtocolMessage<TContext>>,
    ctx: TContext,
  ) {
    this.protocol.send({
      type: MessageType.ConnectionInitialize,
      context: ctx,
    })

    this.channelClient = new ChannelClient<TContext>(protocol)
    this.channelServer = new ChannelServer(protocol, ctx)
  }

  getChannel<T extends IChannel>(channelName: string): T {
    return this.channelClient.getChannel(channelName)
  }

  registerChannel(channelName: string, channel: IServerChannel<TContext>): void {
    this.channelServer.registerChannel(channelName, channel)
  }

  dispose(): void {
    this.channelClient.dispose()
    this.channelServer.dispose()

    if ('dispose' in this.protocol && typeof (this.protocol as IDisposable).dispose === 'function') {
      ;(this.protocol as IDisposable).dispose()
    }
  }
}

export function getDelayedChannel<T extends IChannel>(channelPromise: Promise<T>): T {
  return {
    call: (command: string, arg?: any, cancellationToken?: CancellationToken) => {
      return channelPromise.then(channel => channel.call(command, arg, cancellationToken))
    },
    listen: (event: string, arg?: any) => {
      return (listener, thisArgs, disposables) => {
        let currentDisposable: IDisposable | undefined

        void channelPromise.then((channel) => {
          currentDisposable = channel.listen<any>(event, arg)(listener as (e: any) => any, thisArgs, disposables)
        }).catch((error) => {
          console.error(`Failed to resolve delayed IPC event '${event}'.`, error)
        })

        return {
          dispose: () => {
            currentDisposable?.dispose()
          },
        }
      }
    },
  } as T
}

export interface ProxyIdentifier<T extends object = object> {
  readonly channelName: string
  readonly __type?: T
}

export function createProxyIdentifier<T extends object = object>(channelName: string): ProxyIdentifier<T> {
  return Object.freeze({ channelName })
}

export function getChannelName(channelName: string | ProxyIdentifier<any>): string {
  return typeof channelName === 'string' ? channelName : channelName.channelName
}

function propertyIsEvent(name: string): boolean {
  return name.length > 2 && name[0] === 'o' && name[1] === 'n' && isUpperAsciiLetter(name.charCodeAt(2))
}

const dynamicEventPattern = /^onDynamic[A-Z]/

function propertyIsDynamicEvent(name: string): boolean {
  return dynamicEventPattern.test(name)
}

function isEvent(candidate: unknown): candidate is EventType<unknown> {
  return typeof candidate === 'function'
}

export const ConnectionHandler = Symbol('ConnectionHandler')

export interface ConnectionHandler<TContext = IpcConnectionContext> {
  readonly channelName: string
  onConnection: (connection: IChannelClient, context: TContext) => IServerChannel<TContext>
}

export namespace ProxyChannel {
  export interface ICreateServiceChannelOptions {
    readonly transformError?: (error: unknown) => unknown
  }

  export function fromService<TContext = IpcConnectionContext>(
    service: unknown,
    options?: ICreateServiceChannelOptions,
  ): IServerChannel<TContext> {
    const target = service as Record<string, unknown>

    return {
      listen: <T>(_ctx: TContext, eventName: string, arg?: unknown): EventType<T> => {
        const value = target[eventName]

        if (propertyIsDynamicEvent(eventName) && typeof value === 'function') {
          return value.call(target, arg) as EventType<T>
        }
        if (propertyIsEvent(eventName) && isEvent(value)) {
          return value as EventType<T>
        }

        throw new Error(`IPC event '${eventName}' was not found on the target service.`)
      },
      call: async (_ctx: TContext, command: string, arg?: unknown) => {
        const value = target[command]
        if (typeof value !== 'function') {
          throw new TypeError(`IPC method '${command}' was not found on the target service.`)
        }

        try {
          const args = Array.isArray(arg) ? arg : typeof arg === 'undefined' ? [] : [arg]
          return await value.apply(target, args)
        } catch (error) {
          throw options?.transformError ? options.transformError(error) : error
        }
      },
    }
  }

  export interface ICreateProxyServiceOptions {
    readonly properties?: ReadonlyMap<string, unknown>
  }

  export function toService<T extends object>(
    channel: IChannel,
    options?: ICreateProxyServiceOptions,
  ): T {
    return new Proxy({} as T, {
      get: (_target, propertyKey) => {
        if (typeof propertyKey !== 'string') {
          return undefined
        }
        if (propertyKey === 'then') {
          return undefined
        }
        if (options?.properties?.has(propertyKey)) {
          return options.properties.get(propertyKey)
        }
        if (propertyIsDynamicEvent(propertyKey)) {
          return (arg?: unknown) => channel.listen(propertyKey, arg)
        }
        if (propertyIsEvent(propertyKey)) {
          return channel.listen(propertyKey)
        }

        return (...args: unknown[]) => channel.call(propertyKey, args)
      },
    })
  }
}

export class RpcConnectionHandler<T extends object, TContext = IpcConnectionContext> implements ConnectionHandler<TContext> {
  readonly channelName: string

  constructor(
    channelName: string | ProxyIdentifier<T>,
    protected readonly targetFactory: (connection: IChannelClient, context: TContext) => T,
    protected readonly options?: ProxyChannel.ICreateServiceChannelOptions,
  ) {
    this.channelName = getChannelName(channelName)
  }

  onConnection(connection: IChannelClient, context: TContext): IServerChannel<TContext> {
    return ProxyChannel.fromService(this.targetFactory(connection, context), this.options)
  }
}
