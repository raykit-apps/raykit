# autoContainerModules 配置优先设计

## 1. 设计结论

`autoContainerModules` 应该作为 `raykit.config.ts` 的公开配置字段。

对用户：

- 只配置 `autoContainerModules`
- 不直接接触内部 Vite 插件

对 CLI 内部：

- 仍然通过内部 Vite 插件实现
- 负责扫描依赖、生成虚拟模块、watch `package.json`

也就是：

- **公开 API：配置字段**
- **内部实现：Vite 插件**

## 2. 使用方式

### 2.1 全部开启

如果想全部开启，只需要：

```ts
import { defineConfig } from '@raykit/cli'

export default defineConfig({
  autoContainerModules: true,
  build: [
    {
      entry: './src/main/index.ts',
      target: 'main',
    },
  ],
  renderer: {
    entry: './src/browser/index.html',
  },
})
```

语义是：

- 如果存在 `main` target，就启用 `main`
- 如果存在 `renderer`，就启用 `browser`
- 如果存在 `node` target，就启用 `node`

### 2.2 单独开启

如果要精确控制，则必须显式指定：

```ts
import { defineConfig } from '@raykit/cli'

export default defineConfig({
  autoContainerModules: {
    main: true,
    browser: true,
  },
  build: [
    {
      entry: './src/main/index.ts',
      target: 'main',
    },
    {
      entry: './src/node/index.ts',
      target: 'node',
    },
  ],
  renderer: {
    entry: './src/browser/index.html',
  },
})
```

这时：

- `main` 启用
- `browser` 启用
- `node` 不启用

对象模式下，未声明的 runtime 默认 `false`。

## 3. 配置类型设计

```ts
export type RuntimeKind = 'browser' | 'main' | 'node'

export interface AutoContainerModulesMap {
  browser?: boolean
  main?: boolean
  node?: boolean
}

export type AutoContainerModulesOption
  = | boolean
    | AutoContainerModulesMap
```

扩展 `@raykit/cli` 的 `UserConfig`：

```ts
export interface UserConfig {
  build: MaybeArray<BuildConfig>
  renderer?: MaybeArray<RendererConfig>
  launchElectron?: boolean
  autoContainerModules?: AutoContainerModulesOption
}
```

## 4. 规范化逻辑

CLI 需要先把配置规范化成内部统一结构。

```ts
export interface NormalizedAutoContainerModules {
  browser: boolean
  main: boolean
  node: boolean
}

function hasMainTarget(build: BuildConfig[]): boolean {
  return build.some(item => item.target === 'main')
}

function hasNodeTarget(build: BuildConfig[]): boolean {
  return build.some(item => (item.target ?? 'node') === 'node')
}

function hasBrowserTarget(renderer: RendererConfig[] | undefined): boolean {
  return !!renderer && renderer.length > 0
}

export function normalizeAutoContainerModules(
  option: AutoContainerModulesOption | undefined,
  build: BuildConfig[],
  renderer: RendererConfig[] | undefined,
): NormalizedAutoContainerModules {
  const available = {
    browser: hasBrowserTarget(renderer),
    main: hasMainTarget(build),
    node: hasNodeTarget(build),
  }

  if (option === true) {
    return {
      browser: available.browser,
      main: available.main,
      node: available.node,
    }
  }

  if (!option) {
    return {
      browser: false,
      main: false,
      node: false,
    }
  }

  return {
    browser: option.browser === true,
    main: option.main === true,
    node: option.node === true,
  }
}
```

## 5. 子模块 package.json 约定

自动加载信息仍然由子模块自己声明。

```json
{
  "name": "@raykit/commands",
  "exports": {
    ".": "./src/common/index.ts",
    "./browser": "./src/browser/index.ts"
  },
  "raykit": {
    "containerModules": {
      "browser": ["commandBrowserModule"]
    }
  }
}
```

```json
{
  "name": "@raykit/windows",
  "exports": {
    ".": "./src/common/index.ts",
    "./main": "./src/main/index.ts"
  },
  "raykit": {
    "containerModules": {
      "main": ["windowMainModule"]
    }
  }
}
```

固定约定：

- `browser` -> `<pkg>/browser`
- `main` -> `<pkg>/main`
- `node` -> `<pkg>/node`

也就是只配置导出名，不配置路径。

## 6. 扫描范围设计

扫描范围不再写死 `apps/desktop`，而是：

- 当前这份 `raykit.config.ts` 所属的宿主包
- 只扫描这个宿主包 `package.json.dependencies`

例如：

- 如果 `apps/desktop` 配了 `autoContainerModules`
  - 扫描 `apps/desktop/package.json.dependencies`
- 如果未来 `apps/admin` 也配了 `autoContainerModules`
  - 扫描 `apps/admin/package.json.dependencies`

这让能力变成通用特性，而不是只服务某个固定包名。

## 7. 内部插件设计

这个插件不作为首要公开 API，但 CLI 内部仍然使用它。

### 7.1 内部插件选项

```ts
interface InternalAutoContainerModulesPluginOptions {
  runtime: RuntimeKind
  packageRoot: string
  enabled: boolean
  virtualId: string
}
```

### 7.2 内部插件职责

- 读取宿主包 `package.json.dependencies`
- 扫描 workspace 包
- 读取依赖包的 `raykit.containerModules`
- 生成虚拟模块
- 在 dev 模式 watch `package.json`

### 7.3 为什么插件作为内部实现更合适

- `raykit.config.ts` 已经是 Raykit 的 DSL
- CLI 在 `resolveConfig` 阶段已经知道宿主包上下文
- 不需要让用户自己判断该在哪些 target 上挂插件
- 不需要公开过多底层实现细节

## 8. 虚拟模块设计

建议内部生成三个固定虚拟模块：

- `virtual:raykit/auto-browser-modules`
- `virtual:raykit/auto-main-modules`
- `virtual:raykit/auto-node-modules`

宿主代码可以稳定 import 它们。

### 8.1 生成规则

- 如果该 runtime 已启用：生成真实的静态 named import 和 `container.load(...)`
- 如果该 runtime 未启用：生成 no-op loader

这样做的好处是：

- 宿主入口代码可以长期稳定
- 切换配置时不需要反复改入口 import

### 8.2 生成示例

browser 开启时：

```ts
import type { Container } from 'inversify'
import { commandBrowserModule } from '@raykit/commands/browser'
import { quickInputModule } from '@raykit/quick-input/browser'

export function loadAutoBrowserModules(container: Container): void {
  container.load(commandBrowserModule, quickInputModule)
}
```

browser 关闭时：

```ts
import type { Container } from 'inversify'

export function loadAutoBrowserModules(container: Container): void {
  void container
}
```

## 9. 入口代码接入

### 9.1 main

```ts
import { ApplicationMain, applicationMainModule } from '@raykit/core'
import { Container } from 'inversify'
import { loadAutoMainModules } from 'virtual:raykit/auto-main-modules'

const container = new Container()
container.load(applicationMainModule)
loadAutoMainModules(container)

const application = container.get(ApplicationMain)
await application.start()
```

### 9.2 browser

```ts
import { ApplicationBrowser, applicationBrowserModule } from '@raykit/core/browser'
import { Container } from 'inversify'
import { loadAutoBrowserModules } from 'virtual:raykit/auto-browser-modules'

const container = new Container()
container.load(applicationBrowserModule)
loadAutoBrowserModules(container)

const application = container.get(ApplicationBrowser)
await application.start()
```

## 10. CLI 注入时机

建议在 `@raykit/cli` 的 `resolveConfig` 流程里完成：

1. 读取用户配置
2. 规范化 `autoContainerModules`
3. 根据各个 target 是否存在，给对应 Vite 配置注入内部插件

示意代码：

```ts
const normalized = normalizeAutoContainerModules(
  userConfig.autoContainerModules,
  buildViteConfig,
  rendererViteConfig,
)

if (userConfig.target === 'main') {
  viteConfig.plugins.push(
    createInternalAutoContainerModulesPlugin({
      runtime: 'main',
      packageRoot: root,
      enabled: normalized.main,
      virtualId: 'virtual:raykit/auto-main-modules',
    }),
  )
}

if (userConfig.target === 'node') {
  viteConfig.plugins.push(
    createInternalAutoContainerModulesPlugin({
      runtime: 'node',
      packageRoot: root,
      enabled: normalized.node,
      virtualId: 'virtual:raykit/auto-node-modules',
    }),
  )
}

// renderer
viteConfig.plugins.push(
  createInternalAutoContainerModulesPlugin({
    runtime: 'browser',
    packageRoot: root,
    enabled: normalized.browser,
    virtualId: 'virtual:raykit/auto-browser-modules',
  }),
)
```

## 11. 扫描实现代码

### 11.1 读取宿主包依赖

```ts
export function readPackageDependencies(packageRoot: string): string[] {
  const pkg = require(path.join(packageRoot, 'package.json')) as {
    dependencies?: Record<string, string>
  }
  return Object.keys(pkg.dependencies ?? {})
}
```

### 11.2 解析当前 runtime 的模块 import

```ts
export function resolveAutoModuleImports(
  packageRoot: string,
  runtime: RuntimeKind,
): AutoModuleImport[] {
  const workspaceRoot = findWorkspaceRoot(packageRoot)
  const workspacePackages = scanWorkspacePackages(workspaceRoot)
  const dependencies = readPackageDependencies(packageRoot)

  const imports: AutoModuleImport[] = []

  for (const packageName of dependencies) {
    const meta = workspacePackages.get(packageName)
    if (!meta) {
      continue
    }

    const exportNames = meta.containerModules[runtime] ?? []
    if (exportNames.length === 0) {
      continue
    }

    if (!hasRuntimeExport(meta.exports, runtime)) {
      throw new Error(
        `[raykit:auto-modules] ${packageName} declares ${runtime} containerModules but missing exports["./${runtime}"]`,
      )
    }

    for (const exportName of exportNames) {
      imports.push({
        packageName,
        runtime,
        exportName,
        specifier: `${packageName}/${runtime}`,
      })
    }
  }

  return imports
}
```

### 11.3 生成虚拟模块源码

```ts
export function generateVirtualModuleSource(
  runtime: RuntimeKind,
  imports: AutoModuleImport[],
  enabled: boolean,
): string {
  const loaderName = getLoaderName(runtime)

  if (!enabled || imports.length === 0) {
    return [
      `import type { Container } from 'inversify'`,
      ``,
      `export function ${loaderName}(container: Container): void {`,
      `  void container`,
      `}`,
      ``,
    ].join('\n')
  }

  const grouped = new Map<string, string[]>()
  for (const item of imports) {
    const names = grouped.get(item.specifier) ?? []
    names.push(item.exportName)
    grouped.set(item.specifier, names)
  }

  const importLines = Array.from(grouped.entries(), ([specifier, names]) => {
    const uniqueNames = [...new Set(names)]
    return `import { ${uniqueNames.join(', ')} } from '${specifier}'`
  })

  const moduleNames = imports.map(item => item.exportName)

  return [
    `import type { Container } from 'inversify'`,
    ...importLines,
    ``,
    `export function ${loaderName}(container: Container): void {`,
    `  container.load(${moduleNames.join(', ')})`,
    `}`,
    ``,
  ].join('\n')
}
```

## 12. 校验策略

第一阶段建议校验：

1. `autoContainerModules: true` 时，只对实际存在的 runtime target 生效
2. 对象模式下，只启用显式指定为 `true` 的 runtime
3. 子模块声明了某 runtime 配置，就必须存在对应 `exports["./runtime"]`
4. named import 如果找不到导出名，交给构建报错

## 13. watch 设计

dev 模式建议 watch：

- 当前宿主包的 `package.json`
- `packages/*/package.json`
- `extensions/*/package.json`

这样修改：

- 宿主依赖
- 子模块 `raykit.containerModules`

都会触发虚拟模块重建。

## 14. 推荐实施顺序

### 第一步

扩展 `@raykit/cli` 的 `UserConfig`，加入：

```ts
interface UserConfig {
  autoContainerModules?: boolean | {
    browser?: boolean
    main?: boolean
    node?: boolean
  }
}
```

### 第二步

在 `resolveConfig` 阶段加入规范化逻辑。

### 第三步

实现内部插件和虚拟模块生成。

### 第四步

修改宿主入口代码接入固定虚拟模块。

### 第五步

给需要自动装载的子模块补充 `package.json.raykit.containerModules`。

## 15. 最终结论

最终设计应为：

- 对外：`raykit.config.ts` 的 `autoContainerModules` 配置字段
- `true` 表示按现有 target 全部开启
- 对象表示只启用显式指定的 runtime
- 对内：CLI 自动注入内部 Vite 插件
- 插件只扫描当前宿主包 `dependencies`
- 子模块通过自己的 `package.json.raykit.containerModules` 声明要自动加载的模块名

这比直接把 Vite 插件暴露给用户更方便，也更符合 Raykit 自己的配置模型。
