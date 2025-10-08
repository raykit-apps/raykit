export function is<T = any>(thing: unknown): thing is Iterable<T> {
  return !!thing && typeof thing === 'object' && typeof (thing as Iterable<T>)[Symbol.iterator] === 'function'
}
