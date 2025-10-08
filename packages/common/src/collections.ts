/**
 * Groups the collection into a dictionary based on the provided group function.
 *
 * @template K - The type of the key used for grouping (must be string, number, or symbol).
 * @template V - The type of the elements in the input array.
 * @param {V[]} data - The array of elements to group.
 * @param {(element: V) => K} groupFn - A function that returns a key for each element.
 * @returns {Record<K, V[]>} An object where each key maps to an array of elements that share that key.
 *
 * @example
 * // Grouping an array of objects by a property
 * const users = [
 *   { name: "Alice", age: 25 },
 *   { name: "Bob", age: 30 },
 *   { name: "Charlie", age: 25 }
 * ];
 *
 * const groupedByAge = groupBy(users, user => user.age);
 * console.log(groupedByAge);
 * // Output:
 * // {
 * //   25: [{ name: "Alice", age: 25 }, { name: "Charlie", age: 25 }],
 * //   30: [{ name: "Bob", age: 30 }]
 * // }
 *
 * @example
 * // Grouping strings by their length
 * const words = ["apple", "banana", "pear", "kiwi"];
 *
 * const groupedByLength = groupBy(words, word => word.length);
 * console.log(groupedByLength);
 * // Output:
 * // {
 * //   5: ["apple", "pear", "kiwi"],
 * //   6: ["banana"]
 * // }
 */
export function groupBy<K extends string | number | symbol, V>(data: V[], groupFn: (element: V) => K): Record<K, V[]> {
  const result: Record<K, V[]> = Object.create(null)
  for (const element of data) {
    const key = groupFn(element)
    let target = result[key]
    if (!target) {
      target = result[key] = []
    }
    target.push(element)
  }
  return result
}
