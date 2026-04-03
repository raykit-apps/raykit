import { describe, expect, it } from 'vitest'
import { getWindowReuseKey, normalizeWindowConfiguration, toBrowserWindowOptions } from '../src/main'

describe('windowOptions', () => {
  it('keeps native controls when hiding the title bar', () => {
    const configuration = normalizeWindowConfiguration({
      id: 'palette',
      hideTitleBar: true,
      showWindowControls: true,
    })

    expect(configuration.frame).toBe(true)
    expect(configuration.titleBarStyle).toBe('hidden')
    expect(configuration.titleBarOverlay).toBe(true)
  })

  it('uses a frameless window when hiding the title bar without controls', () => {
    const configuration = normalizeWindowConfiguration({
      id: 'frameless',
      hideTitleBar: true,
    })

    expect(configuration.frame).toBe(false)
    expect(configuration.titleBarStyle).toBe('hidden')
  })

  it('reuses standalone view windows per view id', () => {
    const reuseKey = getWindowReuseKey(
      { id: 'view', singleton: true },
      { configurationId: 'view', role: 'view', viewId: 'quick.view' },
    )

    expect(reuseKey).toBe('view:quick.view')
  })

  it('centers windows without explicit coordinates', () => {
    const options = toBrowserWindowOptions({
      id: 'main',
      width: 1200,
      height: 800,
    })

    expect(options.center).toBe(true)
    expect(options.width).toBe(1200)
    expect(options.height).toBe(800)
  })
})
