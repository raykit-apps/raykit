# 项目概述

raykit 是一个electron开发的桌面端应用，使用pnpm+monorepo项目结构

每次执行前，请给我打个招呼，例如：你好SpuerMomonga

## 设计规范

- UI需要经过专业的UI/UX设计
- 项目配色：#006A6B,#00AC7B,#6FD8BA,#FFF6A1,#F6FFF9

## 开发规范

- 复用现有依赖，需要添加新的依赖每次都需要询问，同意之后才能添加
- UI必须保证100ms内响应
- 禁止使用npm命令执行命令，使用pnpm执行命令