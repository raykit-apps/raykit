import { describe, expect, it, vi } from 'vitest'
import { Disposable, DisposableCollection, DisposableGroup } from '../src/disposable'

describe('disposable', () => {
  describe('disposable.is', () => {
    it('should return true for objects with dispose function', () => {
      const disposable = { dispose: () => {} }
      expect(Disposable.is(disposable)).toBe(true)
    })

    it('should return false for objects without dispose function', () => {
      expect(Disposable.is({})).toBe(false)
      expect(Disposable.is({ dispose: 'not a function' })).toBe(false)
      expect(Disposable.is(null)).toBe(false)
      expect(Disposable.is(undefined)).toBe(false)
    })
  })

  describe('disposable.create', () => {
    it('should create a disposable from a function', () => {
      const fn = vi.fn()
      const disposable = Disposable.create(fn)

      expect(Disposable.is(disposable)).toBe(true)
      disposable.dispose()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('disposable.NULL', () => {
    it('should be a disposable that does nothing', () => {
      expect(Disposable.is(Disposable.NULL)).toBe(true)
      expect(() => Disposable.NULL.dispose()).not.toThrow()
    })
  })
})

describe('disposableCollection', () => {
  it('should initialize empty', () => {
    const collection = new DisposableCollection()
    expect(collection.disposed).toBe(true)
  })

  it('should push and dispose items', () => {
    const collection = new DisposableCollection()
    const disposable1 = { dispose: vi.fn() }
    const disposable2 = { dispose: vi.fn() }

    collection.push(disposable1)
    collection.push(disposable2)

    expect(collection.disposed).toBe(false)

    collection.dispose()

    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
    expect(disposable2.dispose).toHaveBeenCalledTimes(1)
    expect(collection.disposed).toBe(true)
  })

  it('should handle dispose being called multiple times', () => {
    const collection = new DisposableCollection()
    const disposable = { dispose: vi.fn() }

    collection.push(disposable)
    collection.dispose()
    collection.dispose() // Should not throw

    expect(disposable.dispose).toHaveBeenCalledTimes(1)
  })

  it('should handle errors during disposal', () => {
    const collection = new DisposableCollection()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const disposable = {
      dispose: vi.fn().mockImplementation(() => {
        throw new Error('Dispose error')
      }),
    }

    collection.push(disposable)
    collection.dispose()

    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('should dispose all items when pushed as array', () => {
    const collection = new DisposableCollection()
    const disposable1 = { dispose: vi.fn() }
    const disposable2 = { dispose: vi.fn() }

    collection.pushAll([disposable1, disposable2])
    collection.dispose()

    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
    expect(disposable2.dispose).toHaveBeenCalledTimes(1)
  })

  it('should return remove handle from push', () => {
    const collection = new DisposableCollection()
    const disposable = { dispose: vi.fn() }

    const removeHandle = collection.push(disposable)
    removeHandle.dispose()

    collection.dispose()
    expect(disposable.dispose).not.toHaveBeenCalled()
  })
})

describe('disposableGroup', () => {
  describe('canPush', () => {
    it('should return true for objects with push method', () => {
      const group = { push: () => {} }
      expect(DisposableGroup.canPush(group)).toBe(true)
    })

    it('should return false for objects without push method', () => {
      expect(DisposableGroup.canPush({} as unknown as DisposableGroup)).toBe(false)
      expect(DisposableGroup.canPush({ push: 'not a function' } as unknown as DisposableGroup)).toBe(false)
      expect(DisposableGroup.canPush(undefined)).toBe(false)
    })
  })

  describe('canAdd', () => {
    it('should return true for objects with add method', () => {
      const group = { add: () => {} }
      expect(DisposableGroup.canAdd(group)).toBe(true)
    })

    it('should return false for objects without add method', () => {
      expect(DisposableGroup.canAdd({} as unknown as DisposableGroup)).toBe(false)
      expect(DisposableGroup.canAdd({ add: 'not a function' } as unknown as DisposableGroup)).toBe(false)
      expect(DisposableGroup.canAdd(undefined)).toBe(false)
    })
  })
})
