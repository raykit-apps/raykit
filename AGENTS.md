# AI助手执行规范（强制性）

## 技能加载规范（严格执行）

**绝对禁止**：使用 `Read` 工具直接读取 `.opencode/skills/` 目录下的任何技能文件。

**必须使用**：使用 `Skill` 工具加载技能，格式为：
```
skill: {"name": "skill-name"}
```

**可用技能列表**（必须从这些技能中选择）：
- `using-superpowers` - 任何对话开始时必须首先使用
- `brainstorming` - 任何创造性工作前必须使用
- `using-git-worktrees` - 开始功能工作前必须使用
- `test-driven-development` - 实现功能或修复bug前必须使用
- `systematic-debugging` - 遇到bug或测试失败前必须使用
- `writing-plans` - 编写多步骤任务计划前必须使用
- `executing-plans` - 执行计划前必须使用
- `verification-before-completion` - 完成工作前必须使用
- `dispatching-parallel-agents` - 并行处理独立任务时使用
- `requesting-code-review` - 完成主要功能或合并前使用
- `receiving-code-review` - 收到代码审查反馈时使用
- `finishing-a-development-branch` - 完成开发分支时使用

## 执行流程强制规范

**对于任何用户请求，必须按以下顺序执行**：

1. **第一步：技能检查**
   - 判断是否有1%可能适用的技能
   - 如果是，**立即停止**，先使用 `Skill` 工具加载技能
   - 加载技能后，严格遵循技能中的指示执行

2. **第二步：头脑风暴（如适用）**
   - 任何创造性工作（创建功能、构建组件、添加功能、修改行为）前
   - 必须使用 `brainstorming` 技能

3. **第三步：询问git工作树（如适用）**
   - 开始功能工作前
   - 必须使用 `using-git-worktrees` 技能

4. **第四步：创建执行计划（如适用）**
   - 多步骤任务前
   - 使用 `writing-plans` 技能

5. **第五步：验证完成（必须）**
   - 任何工作完成、修复或测试通过前
   - 使用 `verification-before-completion` 技能

## 禁止行为清单

以下行为**严格禁止**：

1. ❌ 使用 `Read` 工具读取 `.opencode/skills/` 下的技能文件
2. ❌ 在用户请求后未检查技能适用性就直接响应
3. ❌ 跳过头脑风暴直接开始创造性工作
4. ❌ 跳过git工作树检查直接开始功能工作
5. ❌ 多步骤任务未创建执行计划
6. ❌ 工作完成前未进行验证
7. ❌ 凭记忆执行技能而不重新加载
8. ❌ 认为任务"简单"就跳过技能检查
9. ❌ 以"需要更多上下文"为由跳过技能检查

## 红警信号

如果出现以下想法，说明你在**合理化跳过技能**：

- "这只是个简单的问题" → 问题也是任务，检查技能
- "我需要更多上下文" → 技能检查在澄清问题之前
- "让我先探索代码库" → 技能告诉你如何探索，先检查
- "这不需要正式的技能" → 如果技能存在，就用它
- "我记得这个技能" → 技能会演进，重新加载
- "这不算任务" → 行动=任务，检查技能
- "技能太复杂了" → 简单的事情会变复杂，用它
- "我先做这件事" → 在做任何事之前先检查

---

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
- 添加依赖之后必须在根目录执行`pnpm i`。
- 每次编写完代码必须在根目录执行`pnpm lint:fix`和`pnpm check`，出现报错必须进行错误修复。
- 使用vitest进行单元测试，使用playwright进行e2e测试，测试出现问题必须进行问题修复。
- 每个子模块必须符合单一职责的设计原则
- 子模块`package.json`和`tsconfig.ts`中配置参考已有模块的配置，例如：packages/core,packages/base

## 技术栈

- 使用vitest进行单元测试
- UI使用solid-js+lumino，组件库使用kobalte
- css样式使用tailwindcss4
- inversify负责依赖注入
