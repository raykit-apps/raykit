import { describe, expect, it } from 'vitest'
import { CancellationToken } from '../src/cancellation'
import { Emitter, Event, WaitUntilEvent } from '../src/event'

describe('event', () => {
  describe('none', () => {
    it('should be a no-op event', () => {
      let called = false
      const disposable = Event.None(() => {
        called = true
      })
      expect(called).toBe(false)
      expect(disposable.dispose).toBeDefined()
    })
  })

  describe('once', () => {
    it('should only fire once', () => {
      const emitter = new Emitter<string>()
      const onceEvent = Event.once(emitter.event)

      let count = 0
      onceEvent(() => {
        count++
      })

      emitter.fire('first')
      emitter.fire('second')

      expect(count).toBe(1)
    })
  })

  describe('toPromise', () => {
    it('should resolve when event fires', async () => {
      const emitter = new Emitter<string>()
      const promise = Event.toPromise(emitter.event)

      emitter.fire('value')

      const result = await promise
      expect(result).toBe('value')
    })
  })

  describe('filter', () => {
    it('should only pass filtered events', () => {
      const emitter = new Emitter<number>()
      const filteredEvent = Event.filter(emitter.event, n => n > 5)

      const values: number[] = []
      filteredEvent(v => values.push(v))

      emitter.fire(3)
      emitter.fire(7)
      emitter.fire(2)
      emitter.fire(10)

      expect(values).toEqual([7, 10])
    })
  })
})

describe('emitter', () => {
  describe('basic functionality', () => {
    it('should emit events to listeners', () => {
      const emitter = new Emitter<string>()
      const values: string[] = []

      emitter.event(value => values.push(value))
      emitter.fire('hello')
      emitter.fire('world')

      expect(values).toEqual(['hello', 'world'])
    })

    it('should support multiple listeners', () => {
      const emitter = new Emitter<number>()
      const values1: number[] = []
      const values2: number[] = []

      emitter.event(v => values1.push(v))
      emitter.event(v => values2.push(v * 2))
      emitter.fire(5)

      expect(values1).toEqual([5])
      expect(values2).toEqual([10])
    })

    it('should allow removing listeners', () => {
      const emitter = new Emitter<string>()
      const values: string[] = []

      const disposable = emitter.event(value => values.push(value))
      emitter.fire('first')
      disposable.dispose()
      emitter.fire('second')

      expect(values).toEqual(['first'])
    })
  })

  describe('disposal', () => {
    it('should not allow new listeners after disposal', () => {
      const emitter = new Emitter<string>()
      emitter.dispose()

      // Should not throw but listener won't be added
      const disposable = emitter.event(() => {})
      expect(disposable.dispose).toBeDefined()
    })
  })

  describe('max listeners', () => {
    it('should track max listeners', () => {
      const emitter = new Emitter<string>()
      const max = Event.getMaxListeners(emitter.event)
      expect(typeof max).toBe('number')
    })

    it('should allow setting max listeners', () => {
      const emitter = new Emitter<string>()
      const originalMax = Event.getMaxListeners(emitter.event)

      Event.setMaxListeners(emitter.event, originalMax + 10)

      const newMax = Event.getMaxListeners(emitter.event)
      expect(newMax).toBe(originalMax + 10)
    })
  })
})

describe('waitUntilEvent', () => {
  describe('fire', () => {
    it('should fire wait until events', async () => {
      const emitter = new Emitter<{ token: CancellationToken, waitUntil: (p: Promise<void>) => void }>()
      let waitCalled = false

      emitter.event((e) => {
        e.waitUntil(new Promise((resolve) => {
          setTimeout(() => {
            waitCalled = true
            resolve()
          }, 10)
        }))
      })

      await WaitUntilEvent.fire(emitter, { token: CancellationToken.None })

      expect(waitCalled).toBe(true)
    })

    it('should handle empty waitables', async () => {
      const emitter = new Emitter<{ token: CancellationToken, waitUntil: (p: Promise<void>) => void }>()

      emitter.event(() => {
        // Not calling waitUntil
      })

      // Should not throw
      await WaitUntilEvent.fire(emitter, { token: CancellationToken.None })
    })

    it('should handle timeout', async () => {
      const emitter = new Emitter<{ token: CancellationToken, waitUntil: (p: Promise<void>) => void }>()

      emitter.event((e) => {
        e.waitUntil(new Promise(() => {})) // Never resolves
      })

      const start = Date.now()
      await WaitUntilEvent.fire(emitter, { token: CancellationToken.None }, 50)
      const elapsed = Date.now() - start

      expect(elapsed).toBeLessThan(100)
    })

    it('should throw for async waitUntil call', async () => {
      const emitter = new Emitter<{ token: CancellationToken, waitUntil: (p: Promise<void>) => void }>()

      emitter.event((e) => {
        e.waitUntil(Promise.resolve())
        // This should throw because waitables is frozen
        expect(() => {
          e.waitUntil(Promise.resolve())
        }).toThrow('waitUntil cannot be called asynchronously')
      })

      await WaitUntilEvent.fire(emitter, { token: CancellationToken.None })
    })
  })
})
