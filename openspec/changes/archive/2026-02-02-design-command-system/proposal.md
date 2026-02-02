## Why

Raykit 需要一个统一的命令系统来支持模块化架构下的命令注册、发现和执行。目前各模块无法有效共享和复用命令逻辑，导致功能重复和集成困难。通过建立标准化的命令系统，可以实现跨模块、跨进程的统一命令管理。

## What Changes

- 创建 `packages/commands` 子项目，提供命令系统核心能力
- 实现 `common` 平台无关层：定义 `Command`、`CommandHandler`、`CommandRegistry` 核心接口和实现
- 实现 `browser` 层：通过 `BrowserApplicationContribution` 集成到应用生命周期
- 使用 `@raykit/base` 的 `ContributionProvider` 机制支持命令扩展点
- 命令系统仅负责命令注册和执行，不包含快捷键、菜单等 UI 功能

## Capabilities

### New Capabilities

- `command-core`: 核心命令系统，包括命令定义、处理器、注册表和扩展点
- `command-browser`: 浏览器端命令系统集成，通过 BrowserApplicationContribution 生命周期管理

### Modified Capabilities

## Impact

- 新增依赖：`@raykit/commands` 需要被应用引入
- 应用需要在其 `BrowserApplicationContribution` 中集成命令系统初始化
- 各功能模块可以通过实现 `CommandContribution` 扩展点注册自定义命令
- 命令系统设计上支持未来可能的 `main` 和 `node` 平台扩展，但本期仅实现 `browser`
