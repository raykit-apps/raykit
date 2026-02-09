# Proposal: Sandbox Preload Module

## Why

Electron应用需要安全的渲染进程隔离机制。当前raykit缺少一个标准化的sandbox层来安全地暴露Electron API给renderer进程。我们需要实现类似VSCode的preload模式，通过contextBridge在sandbox环境下安全地暴露必要的Electron API。

## What Changes

- **新增** `@raykit/sandbox` 包，提供sandbox环境下的preload脚本
- **新增** `preload.ts` 主preload脚本，完整功能版
- **新增** `preload-aux.ts` 轻量版preload，用于辅助窗口
- **新增** `sandbox-types.ts` 和 `electron-types.ts` 类型定义
- **新增** `globals.ts` 提供renderer进程使用的全局类型和API导出
- **配置** `package.json` 通过exports分别导出preload和preload-aux路径
- **移除** 之前可能存在的main/目录设计

## Capabilities

### New Capabilities

- `sandbox-preload`: 主preload脚本，提供完整的Electron API沙盒封装（ipcRenderer、webFrame、webUtils、process等）
- `sandbox-preload-aux`: 轻量版preload脚本，仅提供基础IPC和webFrame功能
- `sandbox-globals`: renderer进程使用的全局API和类型定义，通过window.raykit访问

### Modified Capabilities

- (无修改)

## Impact

- **受影响项目**: 所有需要使用Electron的app，需要更新preload路径为`@raykit/sandbox/preload`
- **API变更**: 新增window.raykit全局对象，包含ipcRenderer、webFrame、process等沙盒化API
- **依赖变化**: 依赖electron作为peer dependency，@raykit/base提供基础工具
- **迁移指南**: 现有项目需要从直接使用electron改为通过@raykit/sandbox间接访问
- **安全影响**: 启用contextIsolation和sandbox后，renderer进程无法直接访问Node.js API，必须通过preload暴露的受控API
