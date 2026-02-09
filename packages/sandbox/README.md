# @raykit/sandbox

Raykit 的沙盒预加载模块，提供安全的 Electron API 暴露机制。

## 概述

`@raykit/sandbox` 提供基于 Electron `contextBridge` 的预加载脚本，在启用 `contextIsolation: true` 和 `sandbox: true` 的环境中安全地暴露必要的 Electron API 给渲染进程。

灵感来自 VSCode 的沙盒架构。

## 特性

- 🔒 **安全**：使用 `contextBridge`，强制 IPC 通道前缀验证
- 📦 **双版本**：完整版 `preload` 和轻量版 `preload-aux`
- 🔷 **TypeScript**：完整的类型定义支持
- 🎯 **易用**：通过 `package.json` exports 直接引用

## 安装

```bash
pnpm add @raykit/sandbox
```

## 使用方法

### 主进程配置

在创建 `BrowserWindow` 时使用预加载脚本：

```typescript
import { BrowserWindow } from 'electron'

const win = new BrowserWindow({
  webPreferences: {
    preload: '../preload/index.js',
    contextIsolation: true,
    sandbox: true,
  },
})
```

### 轻量版（辅助窗口）

对于只需要基本 IPC 的辅助窗口：

```typescript
import { BrowserWindow } from 'electron'

const auxWin = new BrowserWindow({
  webPreferences: {
    preload: '../preload-aux/index.js',
    contextIsolation: true,
    sandbox: true,
  },
})
```

### 渲染进程使用

在渲染进程中通过 `window.raykit` 访问 API：

```typescript
// 发送 IPC 消息
window.raykit.ipcRenderer.send('raykit:do-something', data)

// 调用主进程方法
const result = await window.raykit.ipcRenderer.invoke('raykit:get-data')

// 监听事件
window.raykit.ipcRenderer.on('raykit:event', (event, data) => {
  console.log('Received:', data)
})

// 获取进程信息
console.log(window.raykit.process.platform)
console.log(window.raykit.process.arch)

// 获取配置
const config = await window.raykit.context.resolveConfiguration()
```

## API 参考

### window.raykit

#### ipcRenderer

- `send(channel, ...args)`: 发送异步消息到主进程
- `invoke(channel, ...args)`: 调用主进程方法并等待返回
- `on(channel, listener)`: 监听来自主进程的消息
- `once(channel, listener)`: 监听一次
- `removeListener(channel, listener)`: 移除监听器

**注意**：`preload-aux` 版本仅提供 `send` 和 `invoke`。

#### ipcMessagePort

- `acquire(responseChannel, nonce)`: 从主进程获取 MessagePort

#### webFrame

- `setZoomLevel(level)`: 设置页面缩放级别

#### webUtils

- `getPathForFile(file)`: 获取 File 对象的文件系统路径

#### process

- `platform`: 操作系统平台
- `arch`: CPU 架构
- `env`: 环境变量（只读副本）
- `versions`: Node.js 和 Electron 版本
- `type`: 进程类型（'renderer'）
- `execPath`: 可执行文件路径
- `cwd()`: 获取当前工作目录
- `shellEnv()`: 获取 shell 环境变量
- `getProcessMemoryInfo()`: 获取进程内存信息
- `on(type, callback)`: 监听进程事件

#### context

- `configuration()`: 获取当前配置（可能为 undefined）
- `resolveConfiguration()`: 异步获取配置

## IPC 通道命名约定

所有 IPC 通道名**必须**以 `raykit:` 开头，否则会抛出错误。

```typescript
// ✅ 正确
window.raykit.ipcRenderer.send('raykit:my-action', data)

// ❌ 错误 - 会抛出异常
window.raykit.ipcRenderer.send('invalid-channel', data)
```

## 配置传递

主进程可以通过 IPC 向渲染进程传递配置：

```typescript
// 主进程
const win = new BrowserWindow({
  webPreferences: {
    preload: preloadPath,
    additionalArguments: [
      '--raykit-window-config=raykit:window-config', // 配置通道名
    ],
  },
})

// 处理配置请求
ipcMain.handle('raykit:window-config', () => {
  return {
    windowId: win.id,
    appRoot: __dirname,
    userEnv: process.env,
    product: { name: 'MyApp', version: '1.0.0' },
    zoomLevel: 0,
    nls: { messages: [], language: 'zh-CN' },
  }
})
```

```typescript
// 渲染进程
const config = await window.raykit.context.resolveConfiguration()
console.log(config.windowId)
console.log(config.appRoot)
```

## 从 Electron 直接访问迁移

如果你现有的代码直接使用 Electron API：

```typescript
// 之前 ❌
import { ipcRenderer } from 'electron'

ipcRenderer.send('some-channel', data)
```

迁移到：

```typescript
// 之后 ✅
window.raykit.ipcRenderer.send('raykit:some-channel', data)
```

## 故障排除

### 错误：`Unsupported event IPC channel 'xxx'`

确保所有 IPC 通道名以 `raykit:` 开头。

### 错误：`window.raykit is undefined`

1. 确认 `preload` 路径正确指向 `@raykit/sandbox/preload`
2. 确认 `contextIsolation: true`
3. 确认 `sandbox: true`

### 配置未加载

确认主进程正确处理了 `raykit:window-config` IPC 调用。

## 许可证

MIT © Raykit
