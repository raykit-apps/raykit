import type { ContributionProvider } from '@raykit/base'
import type { TrayContribution } from '../src/common'
import { describe, expect, it, vi } from 'vitest'
import { TrayMenuRegistry } from '../src/common'

describe('trayMenuRegistry', () => {
  it('collects contributed tray items in order', async () => {
    const registry = new TrayMenuRegistry(mockProvider([
      {
        registerTrayItems: (target) => {
          target.registerTrayItem({ id: 'tray.two', label: 'Second', order: 200 })
          target.registerTrayItem({ id: 'tray.one', label: 'First', order: 100 })
        },
      },
    ]))

    await registry.onStart()

    expect(registry.getItems().map(item => item.id)).toEqual([
      'tray.one',
      'tray.two',
    ])
  })

  it('ignores duplicate tray item ids', () => {
    const registry = new TrayMenuRegistry(mockProvider([]))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    registry.registerTrayItem({ id: 'tray.duplicate', label: 'First' })
    registry.registerTrayItem({ id: 'tray.duplicate', label: 'Second' })

    expect(registry.getItems()).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith('Tray menu item \'tray.duplicate\' is already registered.')

    warn.mockRestore()
  })
})

function mockProvider(contributions: TrayContribution[]): ContributionProvider<TrayContribution> {
  return {
    getContributions: () => contributions,
  }
}
