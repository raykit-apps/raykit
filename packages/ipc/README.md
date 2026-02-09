# @raykit/ipc

基于 Electron 的进程间通信（IPC）模块，参考 VSCode 的 IPC 架构设计，结合 inversify 依赖注入容器，提供类型安全、高可靠的跨进程通信能力。

## 特性

- **类型安全**：完整的 TypeScript 类型支持
- **inversify 集成**：通过 `ChannelContribution` 贡献点机制注册 IPC Channel
- **自动代理**：支持 VSCode 风格的 `ProxyChannel` 自动代理，无需手动包装方法
- **生命周期管理**：IPC 模块通过 `MainApplicationContribution` 自动管理 IPC Server 生命周期
- **VSCode 风格**：采用 VSCode 的 IPC 架构设计

## 安装

```bash
pnpm add @raykit/ipc
```

## 架构设计

### 核心架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Main Process                                     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │ IPC Module (@raykit/ipc)                                    │     │
│  │                                                             │     │
│  │  1. IPCMainContribution                                     │     │
│  │     - Implements MainApplicationContribution                │     │
│  │     - Injects IPCServer (via DI)                            │     │
│  │     - Collects ChannelContribution via ContributionProvider │     │
│  │                                                             │     │
│  │  2. IPCServer                                               │     │
│  │     - Maintains channel map                                 │     │
│  │     - Handles IPC protocol                                  │     │
│  │     - Provides registerChannel() method                     │     │
│  │                                                             │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                              ▲                                       │
│                              │ ChannelContribution (Interface)       │
│  ┌───────────────────────────┴───────────────────────────────┐       │
│  │ Other Modules (e.g., @raykit/filesystem)                  │       │
│  │                                                           │       │
│  │  ┌──────────────────────────────────────────────────────┐ │       │
│  │  │ FileSystemChannelContribution                        │ │       │
│  │  │ (Implements ChannelContribution)                     │ │       │
│  │  │                                                      │ │       │
│  │  │ registerChannels(server: IIPCServer): void {         │ │       │
│  │  │   const service = this.fileSystemService             │ │       │
│  │  │   const channel = ProxyChannel.fromService(service)  │ │       │
│  │  │   server.registerChannel('fileSystem', channel)      │ │       │
│  │  │ }                                                    │ │       │
│  │  └──────────────────────────────────────────────────────┘ │       │
│  │                                                           │       │
│  └───────────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Electron IPC (ipcMain/ipcRenderer)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Renderer Process                                │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ IPC Client Usage (@raykit/ipc)                                 │ │
│  │                                                                │ │
│  │  1. Create IPCClient                                           │ │
│  │     const client = new IPCClient()                             │ │
│  │                                                                │ │
│  │  2. Get channel proxy                                          │ │
│  │     const channel = client.getChannel('fileSystem')            │ │
│  │                                                                │ │
│  │  3. Use via ProxyChannel.toService() (Recommended)             │ │
│  │     const fileSystem = ProxyChannel.toService<IFileSystem>(channel)│ │
│  │     const content = await fileSystem.readFile('/path/to/file') │ │
│  │                                                                │ │
│  │  4. Or call directly (Low-level)                               │ │
│  │     const content = await channel.call<string>('readFile', '/path')│ │
│  │                                                                │ │
│  │  5. Listen to events                                           │ │
│  │     fileSystem.onFileChanged((change) => {                     │ │
│  │       console.log('File changed:', change)                     │ │
│  │     })                                                         │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Other Modules (e.g., FileSystem Module)                        │ │
│  │                                                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ FileSystemServiceProxy                                  │   │ │
│  │  │ (Uses IPC Client to call main process)                  │   │ │
│  │  │                                                         │   │ │
│  │  │ @injectable()                                           │   │ │
│  │  │ class FileSystemServiceProxy implements IFileSystem {   │   │ │
│  │  │   private readonly service: IFileSystem                 │   │ │
│  │  │                                                         │   │ │
│  │  │   constructor() {                                       │   │ │
│  │  │     const client = new IPCClient()                      │   │ │
│  │  │     const channel = client.getChannel('fileSystem')     │   │ │
│  │  │     this.service = ProxyChannel.toService<IFileSystem>(channel)│ │
│  │  │   }                                                      │   │ │
│  │  │                                                          │   │ │
│  │  │   readFile(path: string) {                               │   │ │
│  │  │     return this.service.readFile(path)                   │   │ │
│  │  │   }                                                      │   │ │
│  │  │                                                          │   │ │
│  │  │   get onFileChanged() {                                  │   │ │
│  │  │     return this.service.onFileChanged                    │   │ │
│  │  │   }                                                      │   │ │
│  │  │ }                                                        │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 核心概念

1. **ChannelContribution**: 供其他模块实现的接口，包含 `registerChannels(server)` 方法
2. **IPCServer**: 通过 DI 注入，提供 `registerChannel(name, channel)` 方法
3. **IPCMainContribution**: 实现 `MainApplicationContribution`，在 `onStart` 中收集 `ChannelContribution` 并调用 `registerChannels`
4. **ProxyChannel**: VSCode 风格的自动代理机制
   - `fromService(service)`: 从 Service 自动生成 IServerChannel
   - `toService<T>(channel)`: 从 Channel 自动生成 Service 代理

## 使用指南

### 1. 定义 Service 接口 (Common)

```typescript
// packages/my-module/src/common/myService.ts
export const MyService = Symbol('MyService')

export interface IMyService {
  getData: () => Promise<string>
  setData: (value: string) => Promise<void>
  onDataChanged: Event<string>
}
```

### 2. 实现 Service (Main)

```typescript
// packages/my-module/src/main/myServiceImpl.ts
import { injectable } from 'inversify'
import { IMyService } from '../common/myService'

@injectable()
export class MyServiceImpl implements IMyService {
  private data = ''
  private onDataChangedEmitter = new Emitter<string>()

  readonly onDataChanged = this.onDataChangedEmitter.event

  async getData(): Promise<string> {
    return this.data
  }

  async setData(value: string): Promise<void> {
    this.data = value
    this.onDataChangedEmitter.fire(value)
  }
}
```

### 3. 实现 ChannelContribution (Main)

```typescript
import { ChannelContribution, IIPCServer } from '@raykit/ipc'
import { ProxyChannel } from '@raykit/ipc/common'
// packages/my-module/src/main/myChannelContribution.ts
import { inject, injectable } from 'inversify'
import { IMyService, MyService } from '../common/myService'

@injectable()
export class MyChannelContribution implements ChannelContribution {
  @inject(MyService)
  private readonly myService: IMyService

  registerChannels(server: IIPCServer): void {
    // 使用 ProxyChannel.fromService 自动包装 service 方法
    const channel = ProxyChannel.fromService(this.myService)
    server.registerChannel('myChannel', channel)
  }
}
```

### 4. 注册模块 (Main)

```typescript
import { bindContributionProvider } from '@raykit/base'
import { ChannelContribution } from '@raykit/ipc'
// packages/my-module/src/main/myModule.ts
import { ContainerModule } from 'inversify'
import { IMyService, MyService } from '../common/myService'
import { MyChannelContribution } from './myChannelContribution'
import { MyServiceImpl } from './myServiceImpl'

export const myMainModule = new ContainerModule((bind) => {
  // 绑定 service 实现
  bind<IMyService>(MyService).to(MyServiceImpl).inSingletonScope()

  // 绑定 channel contribution
  bind(MyChannelContribution).toSelf().inSingletonScope()
  bind(ChannelContribution).toService(MyChannelContribution)

  // 或者使用 contribution provider 支持多个 contributions
  bindContributionProvider(bind, ChannelContribution)
})
```

### 5. 在渲染进程中使用

```typescript
import { IPCClient, ProxyChannel } from '@raykit/ipc'
// packages/my-module/src/renderer/myServiceProxy.ts
import { injectable } from 'inversify'
import { IMyService } from '../common/myService'

@injectable()
export class MyServiceProxy implements IMyService {
  private service: IMyService

  constructor() {
    // 创建 IPC 客户端
    const client = new IPCClient()

    // 获取 channel
    const channel = client.getChannel('myChannel')

    // 使用 ProxyChannel.toService 创建 service 代理
    this.service = ProxyChannel.toService<IMyService>(channel)
  }

  async getData(): Promise<string> {
    return this.service.getData()
  }

  async setData(value: string): Promise<void> {
    return this.service.setData(value)
  }

  get onDataChanged(): Event<string> {
    return this.service.onDataChanged
  }
}
```

### 6. 注册渲染进程模块

```typescript
// packages/my-module/src/renderer/myRendererModule.ts
import { ContainerModule } from 'inversify'
import { IMyService, MyService } from '../common/myService'
import { MyServiceProxy } from './myServiceProxy'

export const myRendererModule = new ContainerModule((bind) => {
  // 绑定 service proxy 到 renderer
  bind<IMyService>(MyService).to(MyServiceProxy).inSingletonScope()
})
```

## 核心概念

### 1. Channel 和 ProxyChannel

`ProxyChannel` 是 VSCode 风格的自动代理机制，它允许你：

**服务端** - 从 Service 自动生成 IServerChannel：

```typescript
const service = new MyService()
const channel = ProxyChannel.fromService(service)
server.registerChannel('myChannel', channel)
```

**客户端** - 从 Channel 自动生成 Service 代理：

```typescript
const channel = client.getChannel('myChannel')
const service = ProxyChannel.toService<IMyService>(channel)
await service.myMethod() // 自动代理为 channel.call('myMethod')
```

### 2. 数据流

```
Renderer: service.myMethod(arg)
↓ (ProxyChannel.toService 拦截)
channel.call('myMethod', arg)
↓ (ChannelClient 序列化)
IPC Protocol Message → Electron IPC
↓ (Main Process)
ChannelServer 反序列化
channel.call(ctx, 'myMethod', arg)
↓ (ProxyChannel.fromService 生成的 ServerChannel)
service.myMethod(arg)
↓ (Return)
(反向流程返回结果)
```

### 3. 生命周期管理

```
MainApplication.start()
  └── IPCMainContribution.onStart()
      ├── 1. Inject IPCServer (via DI)
      ├── 2. Get ContributionProvider<ChannelContribution>
      └── 3. For each contribution:
            contribution.registerChannels(server)
               └── server.registerChannel(name, channel)
```

## API 参考

### 核心类型

```typescript
// Channel 贡献点接口
interface ChannelContribution {
  registerChannels: (server: IIPCServer) => void
}

// IPC Server 接口
interface IIPCServer {
  registerChannel: (channelName: string, channel: IServerChannel) => void
}

// Server Channel 接口
interface IServerChannel<TContext = string> {
  call: <T>(ctx: TContext, command: string, arg?: any) => Promise<T>
  listen: <T>(ctx: TContext, event: string, arg?: any) => Event<T>
}

// Client Channel 接口
interface IChannel {
  call: <T>(command: string, arg?: any) => Promise<T>
  listen: <T>(event: string, arg?: any) => Event<T>
}

// IPC Main Contribution
class IPCMainContribution implements MainApplicationContribution {
  constructor(
    server: IIPCServer,
    contributions: ContributionProvider<ChannelContribution>
  )

  async onStart(app: MainApplication): Promise<void>
}

// ProxyChannel
namespace ProxyChannel {
  // 从 Service 生成 IServerChannel
  function fromService<T>(service: T, options?: IProxyOptions): IServerChannel

  // 从 Channel 生成 Service 代理
  function toService<T>(channel: IChannel, options?: ICreateProxyServiceOptions): T
}
```

## 许可证

MIT
