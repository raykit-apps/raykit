import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

export function isObject<T = Record<string, unknown>>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export const wildcardHosts = new Set(['0.0.0.0', '::', '0000:0000:0000:0000:0000:0000:0000:0000'])

export function resolveHostname(optionsHost: string | boolean | undefined): string {
  return typeof optionsHost === 'string' && !wildcardHosts.has(optionsHost) ? optionsHost : 'localhost'
}

interface PackageData {
  main?: string
  type?: 'module' | 'commonjs'
  dependencies?: Record<string, string>
}

let packageCached: PackageData | null = null

export function loadPackageData(root = process.cwd()): PackageData | null {
  if (packageCached)
    return packageCached
  const pkg = path.join(root, 'package.json')
  if (fs.existsSync(pkg)) {
    const _require = createRequire(import.meta.url)
    const data = _require(pkg)
    packageCached = {
      main: data.main,
      type: data.type,
      dependencies: data.dependencies,
    }
    return packageCached
  }
  return null
}

type DeepWritable<T>
  = T extends ReadonlyArray<unknown>
    ? { -readonly [P in keyof T]: DeepWritable<T[P]> }
    : T extends RegExp
      ? RegExp
      : T[keyof T] extends Function
        ? T
        : { -readonly [P in keyof T]: DeepWritable<T[P]> }

export function deepClone<T>(value: T): DeepWritable<T> {
  if (Array.isArray(value)) {
    return value.map(v => deepClone(v)) as DeepWritable<T>
  }
  if (isObject(value)) {
    const cloned: Record<string, any> = {}
    for (const key in value) {
      cloned[key] = deepClone(value[key])
    }
    return cloned as DeepWritable<T>
  }
  if (typeof value === 'function') {
    return value as DeepWritable<T>
  }
  if (value instanceof RegExp) {
    return new RegExp(value) as DeepWritable<T>
  }
  if (typeof value === 'object' && value != null) {
    throw new Error('Cannot deep clone non-plain object')
  }
  return value as DeepWritable<T>
}
