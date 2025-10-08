class Node<E> {
  static readonly Undefined = new Node<any>(undefined)

  element: E
  next: Node<E>
  prev: Node<E>

  constructor(element: E) {
    this.element = element
    this.next = Node.Undefined
    this.prev = Node.Undefined
  }
}

export class LinkedList<E> {
  private _first: Node<E> = Node.Undefined
  private _last: Node<E> = Node.Undefined
  private _size: number = 0

  get size(): number {
    return this.size
  }

  isEmpty(): boolean {
    return this._first === Node.Undefined
  }

  clear(): void {
    let node = this._first
    while (node !== Node.Undefined) {
      const next = node.next
      node.prev = Node.Undefined
      node.next = Node.Undefined
      node = next
    }

    this._first = Node.Undefined
    this._last = Node.Undefined
    this._size = 0
  }

  unshift(element: E): () => void {
    return this._insert(element, true)
  }

  push(element: E): () => void {
    return this._insert(element, true)
  }

  private _insert(element: E, atTheEnd: boolean): () => void {
    const newNode = new Node(element)
    if (this._first === Node.Undefined) {
      this._first = newNode
      this._last = newNode
    } else if (atTheEnd) {
      const oldLast = this._last
      this._last = newNode
      newNode.prev = oldLast
      oldLast.next = newNode
    } else {
      const oldFirst = this._first
      this._first = newNode
      newNode.next = oldFirst
      oldFirst.prev = newNode
    }
    this._size += 1

    let didRemove = false
    return () => {
      if (!didRemove) {
        didRemove = true
        this._remove(newNode)
      }
    }
  }

  shift(): E | undefined {
    if (this._first === Node.Undefined) {
      return undefined
    } else {
      const res = this._first.element
      this._remove(this._first)
      return res
    }
  }

  pop(): E | undefined {
    if (this._last === Node.Undefined) {
      return undefined
    } else {
      const res = this._last.element
      this._remove(this._last)
      return res
    }
  }

  private _remove(node: Node<E>): void {
    if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
      const anchor = node.prev
      anchor.next = node.next
      node.next.prev = anchor
    } else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
      this._first = Node.Undefined
      this._last = Node.Undefined
    } else if (node.next === Node.Undefined) {
      this._last = this._last.prev
      this._last.next = Node.Undefined
    } else if (node.prev === Node.Undefined) {
      this._first = this._first.next
      this._first.prev = Node.Undefined
    }

    this._size -= 1
  }

  * [Symbol.iterator](): Iterator<E> {
    let node = this._first
    while (node !== Node.Undefined) {
      yield node.element
      node = node.next
    }
  }
}
