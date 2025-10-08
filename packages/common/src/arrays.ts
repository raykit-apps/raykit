export type CompareResult = number

export type Comparator<T> = (a: T, b: T) => CompareResult

export function compareBy<TItem, TCompareBy>(selector: (item: TItem) => TCompareBy, comparator: Comparator<TCompareBy>): Comparator<TItem> {
  return (a, b) => comparator(selector(a), selector(b))
}

export const numberComparator: Comparator<number> = (a, b) => a - b
