import type { Bindable } from '../src/contribution-provider'
import { Container } from 'inversify'
import { describe, expect, it } from 'vitest'
import {

  bindContributionProvider,
  ContributionProvider,
} from '../src/contribution-provider'

// Test types
interface TestService {
  name: string
}

const TestServiceId = Symbol('TestService')
const TestContributionId = Symbol('TestContribution')

describe('bindContributionProvider', () => {
  describe('with Container', () => {
    it('should bind contribution provider to container', () => {
      const container = new Container()

      bindContributionProvider(container, TestContributionId)

      // Should not throw
      expect(() => {
        container.getNamed(ContributionProvider, TestContributionId)
      }).not.toThrow()
    })

    it('should return singleton instance', () => {
      const container = new Container()

      bindContributionProvider(container, TestContributionId)

      const provider1 = container.getNamed(ContributionProvider, TestContributionId)
      const provider2 = container.getNamed(ContributionProvider, TestContributionId)

      expect(provider1).toBe(provider2)
    })
  })

  describe('with Bind function', () => {
    it('should bind contribution provider to bind function', () => {
      const container = new Container()
      const bind = container.bind.bind(container) as Bindable

      bindContributionProvider(bind, TestContributionId)

      // Should not throw
      expect(() => {
        container.getNamed(ContributionProvider, TestContributionId)
      }).not.toThrow()
    })
  })

  describe('contributionProvider', () => {
    it('should get contributions from container', () => {
      const container = new Container()

      // Register some test services
      container.bind(TestServiceId).toConstantValue({ name: 'service1' })
      container.bind(TestServiceId).toConstantValue({ name: 'service2' })

      bindContributionProvider(container, TestServiceId)

      const provider = container.getNamed(ContributionProvider, TestServiceId)

      // Provider should be able to get services
      expect(provider).toBeDefined()
      expect(typeof provider.getContributions).toBe('function')
    })

    it('should return empty array when no contributions found', () => {
      const container = new Container()

      bindContributionProvider(container, TestContributionId)

      const provider = container.getNamed(ContributionProvider, TestContributionId)
      const contributions = provider.getContributions()

      expect(Array.isArray(contributions)).toBe(true)
      expect(contributions.length).toBe(0)
    })
  })
})
