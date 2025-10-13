export function memoize(_target: object, key: string, descriptor: PropertyDescriptor) {
  let fnKey: 'value' | 'get' | null = null
  let fn: Function | null = null

  if (typeof descriptor.value === 'function') {
    fnKey = 'value'
    fn = descriptor.value

    if (fn!.length !== 0) {
      console.warn('Memoize should only be used in functions with zero parameters')
    }
  } else if (typeof descriptor.get === 'function') {
    fnKey = 'get'
    fn = descriptor.get
  }

  if (!fn) {
    throw new Error('not supported')
  }

  const memoizeKey = `$memoize$${key}`
  descriptor[fnKey!] = function (...args: any[]) {
    if (!Object.prototype.hasOwnProperty.call(this, memoizeKey)) {
      Object.defineProperty(this, memoizeKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: fn.apply(this, args),
      })
    }
    return (this as any)[memoizeKey]
  }
}
