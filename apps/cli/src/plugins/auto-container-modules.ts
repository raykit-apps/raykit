import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

export type RuntimeKind = 'browser' | 'main' | 'node'

export interface AutoContainerModulesMap {
  browser?: boolean
  main?: boolean
  node?: boolean
}

export type AutoContainerModulesOption = boolean | AutoContainerModulesMap

export interface NormalizedAutoContainerModules {
  browser: boolean
  main: boolean
  node: boolean
}

interface PackageContainerModulesConfig {
  browser?: string[]
  main?: string[]
  node?: string[]
}

interface RaykitPackageJson {
  name?: string
  exports?: Record<string, string | { import?: string, default?: string }>
  dependencies?: Record<string, string>
  raykit?: {
    containerModules?: PackageContainerModulesConfig
  }
}

interface WorkspacePackageMeta {
  name: string
  dir: string
  exports?: RaykitPackageJson['exports']
  containerModules: PackageContainerModulesConfig
}

interface AutoModuleImport {
  exportName: string
  specifier: string
}

export interface InternalAutoContainerModulesPluginOptions {
  runtime: RuntimeKind
  packageRoot: string
  enabled: boolean
  virtualId: string
}

interface BuildRuntimeConfig {
  target?: 'main' | 'node' | 'preload'
}

interface RendererRuntimeConfig {
  entry: string
}

function hasMainTarget(build: BuildRuntimeConfig[]): boolean {
  return build.some(item => item.target === 'main')
}

function hasNodeTarget(build: BuildRuntimeConfig[]): boolean {
  return build.some(item => (item.target ?? 'node') === 'node')
}

function hasBrowserTarget(renderer: RendererRuntimeConfig[]): boolean {
  return renderer.length > 0
}

export function normalizeAutoContainerModules(
  option: AutoContainerModulesOption | undefined,
  build: BuildRuntimeConfig[],
  renderer: RendererRuntimeConfig[],
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

function readPackageJson<T extends RaykitPackageJson = RaykitPackageJson>(packageJsonPath: string): T {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as T
}

function readPackageDependencies(packageRoot: string): string[] {
  const pkg = readPackageJson(path.join(packageRoot, 'package.json'))
  return Object.keys(pkg.dependencies ?? {})
}

function findWorkspaceRoot(startDir: string): string {
  let current = path.resolve(startDir)

  while (true) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      throw new Error('[raykit:auto-modules] Cannot find pnpm-workspace.yaml')
    }

    current = parent
  }
}

function scanWorkspaceDir(workspaceRoot: string, relativeDir: 'packages' | 'extensions'): WorkspacePackageMeta[] {
  const dir = path.join(workspaceRoot, relativeDir)
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap((entry) => {
      const packageRoot = path.join(dir, entry.name)
      const packageJsonPath = path.join(packageRoot, 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
        return []
      }

      const pkg = readPackageJson(packageJsonPath)
      if (!pkg.name) {
        return []
      }

      return [{
        name: pkg.name,
        dir: packageRoot,
        exports: pkg.exports,
        containerModules: pkg.raykit?.containerModules ?? {},
      }]
    })
}

function scanWorkspacePackages(workspaceRoot: string): Map<string, WorkspacePackageMeta> {
  const metas = [
    ...scanWorkspaceDir(workspaceRoot, 'packages'),
    ...scanWorkspaceDir(workspaceRoot, 'extensions'),
  ]

  return new Map(metas.map(meta => [meta.name, meta]))
}

function hasRuntimeExport(
  exportsField: WorkspacePackageMeta['exports'],
  runtime: RuntimeKind,
): boolean {
  if (!exportsField) {
    return false
  }
  return `./${runtime}` in exportsField
}

function resolveAutoModuleImports(
  packageRoot: string,
  runtime: RuntimeKind,
): { imports: AutoModuleImport[], watchFiles: string[] } {
  const workspaceRoot = findWorkspaceRoot(packageRoot)
  const workspacePackages = scanWorkspacePackages(workspaceRoot)
  const dependencies = readPackageDependencies(packageRoot)
  const imports: AutoModuleImport[] = []
  const watchFiles = new Set<string>([
    path.join(packageRoot, 'package.json'),
  ])

  for (const meta of workspacePackages.values()) {
    watchFiles.add(path.join(meta.dir, 'package.json'))
  }

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

    const seen = new Set<string>()
    for (const exportName of exportNames) {
      if (!exportName || seen.has(exportName)) {
        continue
      }
      seen.add(exportName)
      imports.push({
        exportName,
        specifier: `${packageName}/${runtime}`,
      })
    }
  }

  return {
    imports,
    watchFiles: [...watchFiles],
  }
}

function getLoaderName(runtime: RuntimeKind): string {
  switch (runtime) {
    case 'browser':
      return 'loadAutoBrowserModules'
    case 'main':
      return 'loadAutoMainModules'
    case 'node':
      return 'loadAutoNodeModules'
  }
}

function generateVirtualModuleSource(
  runtime: RuntimeKind,
  imports: AutoModuleImport[],
  enabled: boolean,
): string {
  const loaderName = getLoaderName(runtime)

  if (!enabled || imports.length === 0) {
    return [
      `export function ${loaderName}(container) {`,
      `  void container`,
      `}`,
      ``,
    ].join('\n')
  }

  const groupedImports = new Map<string, string[]>()
  const orderedModuleNames: string[] = []
  const seenImports = new Set<string>()

  for (const item of imports) {
    const names = groupedImports.get(item.specifier) ?? []
    if (!names.includes(item.exportName)) {
      names.push(item.exportName)
      groupedImports.set(item.specifier, names)
    }

    const importKey = `${item.specifier}:${item.exportName}`
    if (!seenImports.has(importKey)) {
      seenImports.add(importKey)
      orderedModuleNames.push(item.exportName)
    }
  }

  const importLines = Array.from(groupedImports.entries(), ([specifier, names]) => {
    return `import { ${names.join(', ')} } from '${specifier}'`
  })

  return [
    ...importLines,
    ``,
    `export function ${loaderName}(container) {`,
    `  container.load(${orderedModuleNames.join(', ')})`,
    `}`,
    ``,
  ].join('\n')
}

export function createInternalAutoContainerModulesPlugin(
  options: InternalAutoContainerModulesPluginOptions,
): Plugin {
  const resolvedVirtualId = `\0${options.virtualId}`

  return {
    name: `raykit:auto-container-modules:${options.runtime}`,

    resolveId(id) {
      if (id === options.virtualId) {
        return resolvedVirtualId
      }
    },

    load(id) {
      if (id !== resolvedVirtualId) {
        return
      }

      const { imports, watchFiles } = resolveAutoModuleImports(options.packageRoot, options.runtime)

      for (const file of watchFiles) {
        this.addWatchFile(file)
      }

      return generateVirtualModuleSource(options.runtime, imports, options.enabled)
    },
  }
}
