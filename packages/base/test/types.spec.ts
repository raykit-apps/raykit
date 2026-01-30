import type { MaybePromise } from '../src/types'
import { describe, expect, it } from 'vitest'
import { isBoolean, isFunction, isObject } from '../src/types'

describe('types', () => {
  describe('isBoolean', () => {
    it('should return true for true', () => {
      expect(isBoolean(true)).toBe(true)
    })

    it('should return true for false', () => {
      expect(isBoolean(false)).toBe(true)
    })

    it('should return false for non-boolean values', () => {
      expect(isBoolean(1)).toBe(false)
      expect(isBoolean('true')).toBe(false)
      expect(isBoolean(null)).toBe(false)
      expect(isBoolean(undefined)).toBe(false)
      expect(isBoolean({})).toBe(false)
    })
  })

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
    })

    it('should return false for non-function values', () => {
      expect(isFunction(1)).toBe(false)
      expect(isFunction('function')).toBe(false)
      expect(isFunction(null)).toBe(false)
      expect(isFunction(undefined)).toBe(false)
      expect(isFunction({})).toBe(false)
      expect(isFunction([])).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject([])).toBe(true)
    })

    it('should return false for null', () => {
      expect(isObject(null)).toBe(false)
    })

    it('should return false for non-object values', () => {
      expect(isObject(1)).toBe(false)
      expect(isObject('object')).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject(true)).toBe(false)
    })
  })

  describe('maybePromise type', () => {
    it('should accept both sync and async values', () => {
      const syncValue: MaybePromise<string> = 'hello'
      const asyncValue: MaybePromise<string> = Promise.resolve('hello')

      expect(syncValue).toBe('hello')
      expect(asyncValue).toBeInstanceOf(Promise)
    })
  })
})
