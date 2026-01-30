import { describe, expect, it } from 'vitest'
import { CancellationToken } from '../src/cancellation'

describe('cancellationToken', () => {
  describe('none', () => {
    it('should never be cancelled', () => {
      expect(CancellationToken.None.isCancellationRequested).toBe(false)
    })

    it('should have None event', () => {
      let called = false
      CancellationToken.None.onCancellationRequested(() => {
        called = true
      })
      // Should not be called for None
      expect(called).toBe(false)
    })
  })

  describe('cancelled', () => {
    it('should always be cancelled', () => {
      expect(CancellationToken.Cancelled.isCancellationRequested).toBe(true)
    })

    it('should fire immediately when listener is added', async () => {
      let called = false
      CancellationToken.Cancelled.onCancellationRequested(() => {
        called = true
      })
      // Wait for setTimeout
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(called).toBe(true)
    })
  })

  describe('is', () => {
    it('should return true for valid CancellationToken', () => {
      expect(CancellationToken.is(CancellationToken.None)).toBe(true)
      expect(CancellationToken.is(CancellationToken.Cancelled)).toBe(true)
    })

    it('should return false for invalid CancellationToken', () => {
      expect(CancellationToken.is(null)).toBe(false)
      expect(CancellationToken.is(undefined)).toBe(false)
      expect(CancellationToken.is({})).toBe(false)
      expect(CancellationToken.is({ isCancellationRequested: true })).toBe(false)
    })

    it('should return true for objects with correct structure', () => {
      const token = {
        isCancellationRequested: false,
        onCancellationRequested: () => ({ dispose: () => {} }),
      }
      expect(CancellationToken.is(token)).toBe(true)
    })
  })
})
