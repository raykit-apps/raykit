import type { ContributionProvider } from '@raykit/base'
import type { WindowConfigurationContribution } from '../src/common'
import { describe, expect, it, vi } from 'vitest'
import { WindowConfigurationRegistry } from '../src/common'

describe('windowConfigurationRegistry', () => {
  it('collects contributed window configurations', async () => {
    const registry = new WindowConfigurationRegistry(mockProvider([
      {
        registerWindowConfigurations: (target) => {
          target.registerWindowConfiguration({ id: 'main', width: 1280 })
          target.registerWindowConfiguration({ id: 'settings', width: 640, height: 520 })
        },
      },
    ]))

    await registry.onStart()

    expect(registry.getWindowConfiguration('main')?.width).toBe(1280)
    expect(registry.getWindowConfiguration('settings')).toEqual({
      id: 'settings',
      width: 640,
      height: 520,
    })
  })

  it('replaces duplicate configuration ids', () => {
    const registry = new WindowConfigurationRegistry(mockProvider([]))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    registry.registerWindowConfiguration({ id: 'main', width: 1200 })
    registry.registerWindowConfiguration({ id: 'main', width: 1440 })

    expect(registry.getWindowConfiguration('main')?.width).toBe(1440)
    expect(warn).toHaveBeenCalledWith(
      'Window configuration \'main\' is already registered. Replacing the existing configuration.',
    )

    warn.mockRestore()
  })
})

function mockProvider(contributions: WindowConfigurationContribution[]): ContributionProvider<WindowConfigurationContribution> {
  return {
    getContributions: () => contributions,
  }
}
