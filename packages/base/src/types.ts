type UnknownObject<T extends object> = Record<string | number | symbol, unknown> & { [K in keyof T]: unknown }

export type MaybePromise<T> = T | PromiseLike<T>

export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false
}

export function isFunction<T extends (...args: unknown[]) => unknown>(value: unknown): value is T {
  return typeof value === 'function'
}

export function isObject<T extends object>(value: unknown): value is UnknownObject<T> {
  return typeof value === 'object' && value !== null
}
