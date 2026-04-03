import type { IFrame, WindowConfiguration, WindowConfigurationRegistry, WindowContext } from '../src/common'
import type { IAppWindow } from '../src/main'
import { Disposable, DisposableStore, Emitter } from '@raykit/base'
import { describe, expect, it, vi } from 'vitest'

import { WindowMainService } from '../src/main'

vi.mock('electron', () => ({
  app: {
    getName: () => 'Raykit',
    getVersion: () => '0.0.0-test',
  },
  BrowserWindow: {
    fromWebContents: () => undefined,
  },
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}))

class TestWindowMainService extends WindowMainService {
  registerTestWindow(window: IAppWindow, reuseKey?: string): void {
    this.registerWindow(window, reuseKey)
  }
}

class TestAppWindow extends Disposable implements IAppWindow {
  protected readonly onDidCloseEmitter = this._register(new Emitter<void>())
  readonly onDidClose = this.onDidCloseEmitter.event

  protected readonly onDidMoveEmitter = this._register(new Emitter<IFrame>())
  readonly onDidMove = this.onDidMoveEmitter.event

  protected readonly onDidMaximizeEmitter = this._register(new Emitter<void>())
  readonly onDidMaximize = this.onDidMaximizeEmitter.event

  protected readonly onDidUnmaximizeEmitter = this._register(new Emitter<void>())
  readonly onDidUnmaximize = this.onDidUnmaximizeEmitter.event

  protected readonly onDidEnterFullScreenEmitter = this._register(new Emitter<void>())
  readonly onDidEnterFullScreen = this.onDidEnterFullScreenEmitter.event

  protected readonly onDidLeaveFullScreenEmitter = this._register(new Emitter<void>())
  readonly onDidLeaveFullScreen = this.onDidLeaveFullScreenEmitter.event

  protected _bounds: IFrame = { x: 0, y: 0, width: 1200, height: 800 }
  protected _disposed = false

  readonly win = {
    focus: vi.fn(),
    isMinimized: vi.fn(() => false),
    isVisible: vi.fn(() => true),
    restore: vi.fn(),
    show: vi.fn(),
  } as any

  readonly config: WindowConfiguration = {
    id: 'main',
    role: 'main',
  }

  readonly context: WindowContext = {
    configurationId: 'main',
    role: 'main',
  }

  constructor(
    readonly id: number,
  ) {
    super()
  }

  async init(_options?: unknown): Promise<void> {
    // NOOP
  }

  async load(): Promise<void> {
    // NOOP
  }

  getBounds(): IFrame {
    return this._bounds
  }

  matches(_webContents?: unknown): boolean {
    return false
  }

  focus(): void {
    this.win.focus()
  }

  show(): void {
    this.win.show()
  }

  hide(): void {
    // NOOP
  }

  close(): void {
    this.fireClose()
  }

  override dispose(): void {
    if (this._disposed) {
      return
    }

    this._disposed = true
    super.dispose()
  }

  get disposed(): boolean {
    return this._disposed
  }

  fireMove(bounds: IFrame): void {
    this._bounds = bounds
    this.onDidMoveEmitter.fire(bounds)
  }

  fireMaximize(): void {
    this.onDidMaximizeEmitter.fire()
  }

  fireUnmaximize(): void {
    this.onDidUnmaximizeEmitter.fire()
  }

  fireEnterFullScreen(): void {
    this.onDidEnterFullScreenEmitter.fire()
  }

  fireLeaveFullScreen(): void {
    this.onDidLeaveFullScreenEmitter.fire()
  }

  fireClose(): void {
    this.onDidCloseEmitter.fire()
  }
}

describe('windowMainService', () => {
  it('forwards window lifecycle events and unregisters closed windows', () => {
    const service = createService()
    const window = new TestAppWindow(1)
    const events = {
      destroyed: [] as number[],
      fullscreen: [] as boolean[],
      maximized: [] as number[],
      moved: [] as IFrame[],
      opened: [] as number[],
      unmaximized: [] as number[],
    }
    const disposables = new DisposableStore()

    disposables.add(service.onDidOpenWindow(appWindow => events.opened.push(appWindow.id)))
    disposables.add(service.onDidDestroyWindow(appWindow => events.destroyed.push(appWindow.id)))
    disposables.add(service.onDidMoveWindow(event => events.moved.push(event.bounds)))
    disposables.add(service.onDidMaximizeWindow(appWindow => events.maximized.push(appWindow.id)))
    disposables.add(service.onDidUnmaximizeWindow(appWindow => events.unmaximized.push(appWindow.id)))
    disposables.add(service.onDidChangeFullScreen(event => events.fullscreen.push(event.fullscreen)))

    service.registerTestWindow(window, 'main')

    expect(events.opened).toEqual([1])
    expect(service.getWindowById(1)).toBe(window)

    window.fireMove({ x: 10, y: 20, width: 1024, height: 768 })
    window.fireMaximize()
    window.fireUnmaximize()
    window.fireEnterFullScreen()
    window.fireLeaveFullScreen()
    window.fireClose()
    window.fireMaximize()

    expect(events.moved).toEqual([{ x: 10, y: 20, width: 1024, height: 768 }])
    expect(events.maximized).toEqual([1])
    expect(events.unmaximized).toEqual([1])
    expect(events.fullscreen).toEqual([true, false])
    expect(events.destroyed).toEqual([1])
    expect(service.getWindows()).toEqual([])

    disposables.dispose()
    service.dispose()
  })

  it('disposes registered windows and unsubscribes service listeners on dispose', () => {
    const service = createService()
    const window = new TestAppWindow(2)
    const onDidMoveWindow = vi.fn()

    const listener = service.onDidMoveWindow(onDidMoveWindow)

    service.registerTestWindow(window, 'main')
    service.dispose()
    window.fireMove({ x: 1, y: 2, width: 3, height: 4 })

    expect(window.disposed).toBe(true)
    expect(onDidMoveWindow).not.toHaveBeenCalled()
    expect(service.getWindows()).toEqual([])

    listener.dispose()
  })
})

function createService(): TestWindowMainService {
  return new TestWindowMainService(
    async () => {
      throw new Error('Window factory should not be used in this test.')
    },
    {
      getWindowConfiguration: () => undefined,
      onStart: async () => {},
    } as WindowConfigurationRegistry,
  )
}
