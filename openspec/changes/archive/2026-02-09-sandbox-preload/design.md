## Context

Raykit 是一个基于 Electron 的桌面应用框架。当前架构中，renderer 进程缺乏标准化的安全隔离机制。我们需要实现类似 VSCode 的 sandbox preload 模式，通过 contextBridge 在 sandbox 环境下安全地暴露必要的 Electron API。

当前约束：

- 必须使用 `contextIsolation: true` 确保 renderer 无法直接访问 Node.js
- 必须验证 IPC 通道名（必须以 `raykit:` 开头）
- 类型安全必须完整支持 TypeScript
- 与 raykit 现有架构一致（无 inversify 模块，分层清晰）

## Goals / Non-Goals

**Goals:**

- 创建 `@raykit/sandbox` 包提供标准化的 sandbox preload 脚本
- 实现主 `preload.ts` 完整功能和 `preload-aux.ts` 轻量版
- 提供完整的 TypeScript 类型定义支持
- 通过 `package.json` exports 分别导出 preload 和 preload-aux 路径
- 实现 IPC 通道验证（必须以 `raykit:` 开头）

**Non-Goals:**

- 不实现 main/ 目录相关功能
- 不使用 inversify 模块绑定
- 不直接暴露完整的 Electron API（只暴露最小子集）
- 不支持 renderer 直接 require Node.js 模块

## Decisions

### 1. 目录结构扁平化

**决定**: 合并 browser/ 和 electron-browser/，统一放在 browser/ 目录下。

**理由**:

- 简化目录结构，减少层级
- raykit 是 Electron-only 框架，不需要区分 browser/electron-browser

**替代方案**: 保持 VSCode 的 electron-browser/ 分离 - 被拒绝，过于复杂。

### 2. Package.json Exports 导出 Preload 脚本

**决定**: 使用 package.json exports 字段分别导出 preload 和 preload-aux。

```json
{
  "exports": {
    ".": "./src/browser/index.ts",
    "./preload": "./src/browser/preload.ts",
    "./preload-aux": "./src/browser/preload-aux.ts"
  }
}
```

**理由**:

- Electron preload 配置需要直接引用脚本路径
- 清晰的导入语义：`@raykit/sandbox/preload`
- 符合 Node.js 子路径导入规范

### 3. 命名空间从 `vscode` 改为 `raykit`

**决定**: 全局对象从 `window.vscode` 改为 `window.raykit`。

**映射规则**:

- `vscode:` → `raykit:`
- `vscode-window-config` → `raykit-window-config`
- `VSCODE_CWD` → `RAYKIT_CWD`
- `window.vscode` → `window.raykit`

**理由**: 项目品牌化，与 raykit 项目命名保持一致。

### 4. IPC 通道前缀验证

**决定**: 所有 IPC 通道名必须以 `raykit:` 开头，否则抛出错误。

**实现**:

```typescript
function validateIPC(channel: string): true | never {
  if (!channel?.startsWith('raykit:')) {
    throw new Error(`Unsupported event IPC channel '${channel}'`)
  }
  return true
}
```

**理由**: 防止未授权的 IPC 通道使用，增强安全性。

### 5. 类型定义策略

**决定**: 在 `electron-types.ts` 中复制 Electron 类型定义，而非直接依赖 electron 类型。

**理由**:

- 控制暴露的 API 表面
- 避免 renderer 进程直接依赖 electron 包
- 与 VSCode 模式保持一致

### 6. 无 Inversify 模块设计

**决定**: sandbox 包不提供 inversify ContainerModule。

**理由**:

- sandbox 是基础设施层，不是业务逻辑
- preload 脚本是纯技术实现，不需要 DI
- 简化架构，减少不必要的抽象

**替代方案**: 创建 browser-sandbox-module.ts - 被拒绝，不必要。

### 7. Preload-Aux 精简策略

**决定**: `preload-aux.ts` 仅提供 `ipcRenderer.send/invoke` 和 `webFrame.setZoomLevel`。

**对比**:
| 功能 | preload.ts | preload-aux.ts |
|-----|-----------|----------------|
| ipcRenderer.send | ✓ | ✓ |
| ipcRenderer.invoke | ✓ | ✓ |
| ipcRenderer.on/once/removeListener | ✓ | ✗ |
| webFrame.setZoomLevel | ✓ | ✓ |
| webUtils.getPathForFile | ✓ | ✗ |
| process._ | ✓ | ✗ |
| context._ | ✓ | ✗ |

**理由**: 辅助窗口（如 about、settings）通常只需要基本 IPC 和缩放功能，减少攻击面。

## Risks / Trade-offs

**[风险 1] Type 定义与 Electron 版本不同步** → **缓解**: 定期对比 Electron 更新，关注 breaking changes。类型定义是手动复制的，需要维护。

**[风险 2] IPC 通道前缀限制过于严格** → **缓解**: 提供配置选项让应用自定义前缀，但默认强制 `raykit:`。文档中明确说明这一限制。

**[风险 3] Preload 脚本路径在打包后失效** → **缓解**: package.json exports 使用相对路径，确保在 monorepo 和打包后都有效。需要测试 pnpm + electron-builder 场景。

**[风险 4] 与现有 IPC 系统冲突** → **缓解**: raykit 已有 `@raykit/ipc` 包。需要确保 sandbox 的 IPC 验证与现有系统兼容，或明确分层关系。

**[Trade-off] 安全性 vs 灵活性**

- 选择: 强制 IPC 前缀验证、最小API暴露
- 代价: 开发者需要适应约束，不能直接访问所有 Electron API
- 收益: 大幅降低安全风险，符合 Electron 安全最佳实践

## Migration Plan

**阶段 1: 实现 @raykit/sandbox 包**

- 创建 package.json 和目录结构
- 实现 preload.ts、preload-aux.ts、类型定义
- 配置 package.json exports

**阶段 2: 内部测试**

- 在示例 app 中使用 @raykit/sandbox
- 验证 IPC 通道验证工作正常
- 测试 TypeScript 类型推断

**阶段 3: 文档和发布**

- 编写 README.md
- 提供迁移指南
- 标记包为可用状态

**Rollback Strategy**: 如果发现问题，可以降级到直接使用 Electron preload，绕过 @raykit/sandbox。

## Open Questions

1. **IPC 前缀**: 是否允许应用自定义前缀（如 `myapp:`）？还是强制所有应用使用 `raykit:`？

2. **@raykit/ipc 关系**: 现有的 `@raykit/ipc` 包与 sandbox 是什么关系？是上层封装还是独立系统？

3. **辅助窗口判定**: 什么场景使用 `preload-aux`？是否有标准来判断应该用完整版还是轻量版？

4. **测试策略**: 如何测试 preload 脚本？需要 Electron 环境还是可以用 Node.js 模拟？

5. **打包配置**: electron-builder 或其他打包工具需要特殊配置来支持 `@raykit/sandbox/preload` 这种子路径导入吗？
