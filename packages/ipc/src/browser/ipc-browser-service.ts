import type { ISandboxConfiguration } from '@raykit/sandbox/browser'
import type { IChannel, IChannelClient, IChannelServer, IpcConnectionContext, IProtocolMessage, IProtocolPort, IServerChannel, ProxyIdentifier } from '../common'
import { Disposable } from '@raykit/base'
import { context, ipcMessagePort, ipcRenderer } from '@raykit/sandbox/browser'
import { injectable } from 'inversify'
import {
  getChannelName,
  getDelayedChannel,
  IpcChannels,
  IPCClient,
  MessagePortProtocol,
  ProxyChannel,
} from '../common'

interface RendererWindowContext {
  readonly configurationId?: string
  readonly role?: string
}

interface RendererSandboxConfiguration extends ISandboxConfiguration {
  readonly window?: RendererWindowContext
}

function createNonce(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `raykit-ipc-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toProtocolPort(port: MessagePort): IProtocolPort<IProtocolMessage<IpcConnectionContext>> {
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
      const handleMessage = (event: MessageEvent<IProtocolMessage<IpcConnectionContext>>) => {
        listener(event.data)
      }

      port.addEventListener('message', handleMessage)
      return {
        dispose: () => {
          port.removeEventListener('message', handleMessage)
        },
      }
    },
  }
}

export async function acquirePort(
  requestChannel = IpcChannels.acquirePort,
  responseChannel = IpcChannels.acquirePortResult,
  nonce = createNonce(),
): Promise<MessagePort> {
  if (!ipcRenderer?.send) {
    throw new Error('IPC browser service requires @raykit/sandbox preload with ipcRenderer.send().')
  }
  if (!ipcMessagePort?.acquire) {
    throw new Error('IPC browser service requires @raykit/sandbox preload with ipcMessagePort.acquire().')
  }

  ipcMessagePort.acquire(responseChannel, nonce)

  const portPromise = new Promise<MessagePort>((resolve, reject) => {
    let timeoutHandle: ReturnType<typeof setTimeout>

    function handleWindowMessage(event: MessageEvent<unknown>) {
      if (event.source !== window || event.data !== nonce || event.ports.length === 0) {
        return
      }

      clearTimeout(timeoutHandle)
      window.removeEventListener('message', handleWindowMessage)
      resolve(event.ports[0])
    }

    timeoutHandle = setTimeout(() => {
      window.removeEventListener('message', handleWindowMessage)
      reject(new Error(`Timed out while acquiring IPC message port for nonce '${nonce}'.`))
    }, 10000)

    window.addEventListener('message', handleWindowMessage)
  })

  ipcRenderer.send(requestChannel, nonce)

  return portPromise
}

@injectable()
export class IpcChannelService extends Disposable implements IChannelClient, IChannelServer<IpcConnectionContext> {
  protected clientPromise?: Promise<IPCClient<IpcConnectionContext>>

  getChannel<T extends IChannel>(channelName: string): T {
    return getDelayedChannel(this.whenReady().then(client => client.getChannel<T>(channelName)))
  }

  getProxy<T extends object>(channelName: string | ProxyIdentifier<T>): T {
    return ProxyChannel.toService<T>(this.getChannel(getChannelName(channelName)))
  }

  registerChannel(channelName: string, channel: IServerChannel<IpcConnectionContext>): void {
    void this.whenReady().then((client) => {
      client.registerChannel(channelName, channel)
    })
  }

  registerProxy<T extends object>(channelName: string | ProxyIdentifier<T>, service: T): void {
    this.registerChannel(getChannelName(channelName), ProxyChannel.fromService(service))
  }

  protected whenReady(): Promise<IPCClient<IpcConnectionContext>> {
    if (!this.clientPromise) {
      this.clientPromise = this.createClient()
    }

    return this.clientPromise
  }

  protected async createClient(): Promise<IPCClient<IpcConnectionContext>> {
    const [port, connectionContext] = await Promise.all([
      acquirePort(),
      this.resolveConnectionContext(),
    ])

    const client = new IPCClient(
      new MessagePortProtocol<IProtocolMessage<IpcConnectionContext>>(toProtocolPort(port)),
      connectionContext,
    )
    this._register(client)
    return client
  }

  protected async resolveConnectionContext(): Promise<IpcConnectionContext> {
    const currentConfiguration = context.configuration() as RendererSandboxConfiguration | undefined
    const resolvedConfiguration = currentConfiguration
      ?? (await context.resolveConfiguration() as RendererSandboxConfiguration)

    return {
      windowId: resolvedConfiguration.windowId ?? -1,
      configurationId: resolvedConfiguration.window?.configurationId,
      role: resolvedConfiguration.window?.role,
    }
  }
}
