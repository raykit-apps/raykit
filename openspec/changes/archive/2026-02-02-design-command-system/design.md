## Context

Raykit 是一个基于 Electron + SolidJS 的桌面应用，采用 monorepo 架构和依赖注入（Inversify）模式。现有的 `@raykit/core` 包提供了 `BrowserApplication` 和 `BrowserApplicationContribution` 生命周期机制。

目前，应用缺乏统一的命令系统，各模块通过直接调用的方式互相依赖，导致：

- 模块间耦合度高
- 功能复用困难
- 难以实现统一的快捷键、菜单等 UI 集成

## Goals / Non-Goals

**Goals:**

- 提供一个平台无关的命令定义和注册机制（`common` 层）
- 通过 `BrowserApplicationContribution` 在浏览器端集成命令系统
- 支持命令的延迟加载和动态注册
- 保持命令系统与 UI（快捷键、菜单）的完全解耦
- 遵循 Theia 命令系统的成熟设计模式

**Non-Goals:**

- 实现主进程（main）或 Node 后端（node）的命令系统（本期仅实现 browser）
- 提供快捷键绑定、菜单栏、命令面板等 UI 功能
- 支持命令的历史记录、撤销/重做等高级功能
- 实现命令的远程执行或 RPC 通信

## Decisions

### 1. 目录结构遵循 packages/core 模式

**Decision**: 采用 `src/common/`、`src/browser/` 结构，通过 `package.json` 的 `exports` 字段提供子路径导出。

**Rationale**: 与 `@raykit/core` 保持一致，便于开发者理解和使用。

**Alternatives considered**:

- 使用 `src/index.ts` 统一导出 — 不够灵活，无法区分平台
- 使用文件后缀如 `.browser.ts`、`.node.ts` — 与现有架构风格不符

### 2. 仅实现 browser 层，预留 common 扩展

**Decision**: 本期仅实现 `browser` 目录，`main` 和 `node` 目录为空但保留结构。

**Rationale**: 当前需求仅涉及渲染进程命令系统，避免过度设计。未来需要主进程命令时可扩展。

**Alternatives considered**:

- 同时实现 main 层 — 增加开发复杂度，暂无明确需求
- 完全不预留目录 — 未来扩展时需要重构目录结构

### 3. 通过 BrowserApplicationContribution 集成

**Decision**: 创建 `BrowserCommandContribution` 实现 `BrowserApplicationContribution`，在 `configure()` 阶段注册命令。

**Rationale**: 利用现有的应用生命周期，确保命令系统在应用启动时正确初始化。

**Alternatives considered**:

- 在模块加载时立即注册 — 时机过早，可能依赖未就绪
- 在 `onStart()` 中注册 — 时机过晚，可能错过早期命令调用
- 手动调用初始化函数 — 增加使用复杂度

### 4. 保持与 UI 功能解耦

**Decision**: 命令系统仅提供命令注册和执行能力，不包含快捷键绑定、菜单集成等功能。

**Rationale**: 遵循单一职责原则，快捷键和菜单属于独立关注点，可通过命令 ID 与命令系统关联。

**Alternatives considered**:

- 内置快捷键系统 — 与命令系统耦合，不利于不同 UI 框架复用
- 提供菜单注册 API — 超出命令系统职责范围

### 5. 使用 Theia 命令系统模式

**Decision**: 借鉴 Theia 的 `Command`、`CommandHandler`、`CommandRegistry` 设计，支持多处理器和条件启用。

**Rationale**: Theia 的命令系统经过验证，支持复杂的 IDE 场景，与 raykit 的编辑器定位匹配。

**Alternatives considered**:

- 使用 VS Code 命令 API — 更偏向运行时扩展，不适合静态模块
- 自定义简化设计 — 可能无法满足未来复杂场景

## Risks / Trade-offs

| Risk                 | Impact | Mitigation                                                               |
| -------------------- | ------ | ------------------------------------------------------------------------ |
| 命令 ID 冲突         | 中     | 采用命名空间约定（如 `package.command-name`），在注册时检查重复并告警    |
| 性能瓶颈（大量命令） | 低     | 使用 Map 存储命令，O(1) 查找；处理器链采用数组存储，实际场景命令数量有限 |
| 与现有代码集成困难   | 中     | 提供详细的迁移指南，保持 API 简洁，提供 TypeScript 类型支持              |
| 过度设计未来扩展     | 低     | 仅实现 browser 层，main/node 层预留空目录，暂不实现                      |

## Migration Plan

**不适用** — 这是一个新功能，不涉及现有代码迁移。

后续各模块可以通过以下步骤接入命令系统：

1. 在模块中实现 `CommandContribution` 接口
2. 在 `registerCommands(registry)` 方法中注册命令和处理器
3. 确保模块的 inversify 配置将 contribution 绑定到 `CommandContribution` symbol
4. 应用启动时，命令系统将自动发现并注册这些命令

## Open Questions

1. **处理器优先级策略**：当多个处理器注册到同一命令时，目前的"第一个启用者获胜"策略是否足够？是否需要显式的优先级数值？

2. **命令分组/命名空间**：是否需要内置的命令分组机制（如 VS Code 的 `contributes.commands` 中的 `category`），还是完全由调用方决定展示方式？

3. **异步处理器错误处理**：当 `execute()` 返回的 Promise 被拒绝时，命令系统是否应该捕获并提供统一的错误处理钩子，还是让错误冒泡给调用者？

4. **内存管理**：已注册的命令和处理器是否需要显式的 `dispose()` 机制，还是依赖应用生命周期结束时的垃圾回收？

5. **命令历史/撤销**：虽然明确不在本期范围，但未来的撤销/重做功能是否需要现在预留接口（如 `isUndoable()`、`undo()` 等）？
