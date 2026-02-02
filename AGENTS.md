# 项目概述

raykit 是一个electron开发的桌面端应用，使用pnpm+monorepo项目结构

`apps/*`是可执行应用子应用。
`packages/*`下是模块化设计的子模块，提供给`apps/*`下的应用调用。

## 设计规范

- UI需要经过专业的UI/UX设计
- 项目配色：#006A6B,#00AC7B,#6FD8BA,#FFF6A1,#F6FFF9

## 开发规范

- 复用现有依赖，需要添加新的依赖每次都需要询问，同意之后才能添加。
- UI必须保证100ms内响应。
- 禁止使用npm命令执行命令，使用pnpm执行命令。
- 添加新命令之后必须在根目录执行`pnpm i`。
- 每次编写完代码必须在根目录执行`pnpm lint:fix`和`pnpm check`，出现报错必须进行错误修复。
- 使用vitest进行单元测试，使用playwright进行e2e测试，测试出现问题必须进行问题修复。

## 技术栈

- 使用vitest进行单元测试
