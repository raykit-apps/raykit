import type { Event, IDisposable, MaybePromise } from '@raykit/base'
import { ContributionProvider, Disposable, Emitter, toDisposable } from '@raykit/base'
import { inject, injectable, named } from 'inversify'

export const TrayContribution = Symbol('TrayContribution')

export interface TrayContribution {
  registerTrayItems: (registry: TrayMenuRegistry) => MaybePromise<void>
}

export type TrayMenuItemType = 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'

export interface TrayMenuItem {
  id: string
  label?: string
  enabled?: boolean
  visible?: boolean
  checked?: boolean
  accelerator?: string
  type?: TrayMenuItemType
  order?: number
  submenu?: readonly TrayMenuItem[]
  click?: () => MaybePromise<void>
}

export const TrayMenuService = Symbol('TrayMenuService')

export interface TrayMenuService {
  readonly onTrayMenuItemsChanged: Event<void>
  getItems: () => readonly TrayMenuItem[]
}

@injectable()
export class TrayMenuRegistry implements TrayMenuService {
  protected readonly trayMenuItems: { [id: string]: TrayMenuItem } = {}
  protected readonly toUnregisterTrayItems = new Map<string, IDisposable>()

  protected readonly onTrayMenuItemsChangedEmitter = new Emitter<void>()
  readonly onTrayMenuItemsChanged = this.onTrayMenuItemsChangedEmitter.event

  constructor(
    @inject(ContributionProvider) @named(TrayContribution)
    protected readonly contributionProvider: ContributionProvider<TrayContribution>,
  ) {}

  async onStart(): Promise<void> {
    const contributions = this.contributionProvider.getContributions()
    for (const contribution of contributions) {
      await contribution.registerTrayItems(this)
    }
  }

  * getAllTrayMenuItems(): IterableIterator<Readonly<TrayMenuItem>> {
    for (const trayMenuItem of Object.values(this.trayMenuItems)) {
      yield trayMenuItem
    }
  }

  registerTrayItem(item: TrayMenuItem): IDisposable {
    if (this.trayMenuItems[item.id]) {
      console.warn(`Tray menu item '${item.id}' is already registered.`)
      return Disposable.None
    }

    const toDispose = this.doRegisterTrayItem(item)
    this.toUnregisterTrayItems.set(item.id, toDispose)
    this.fireDidChange()
    return toDispose
  }

  protected doRegisterTrayItem(item: TrayMenuItem): IDisposable {
    this.trayMenuItems[item.id] = item

    return toDisposable(() => {
      delete this.trayMenuItems[item.id]
      this.toUnregisterTrayItems.delete(item.id)
      this.fireDidChange()
    })
  }

  unregisterTrayItem(item: TrayMenuItem): void
  unregisterTrayItem(id: string): void
  unregisterTrayItem(itemOrId: TrayMenuItem | string): void {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
    const toUnregister = this.toUnregisterTrayItems.get(id)
    if (toUnregister) {
      toUnregister.dispose()
    }
  }

  getItems(): readonly TrayMenuItem[] {
    return Object.values(this.trayMenuItems).sort((left, right) => {
      const order = (left.order ?? 0) - (right.order ?? 0)
      if (order !== 0) {
        return order
      }
      return left.id.localeCompare(right.id)
    })
  }

  protected fireDidChange(): void {
    this.onTrayMenuItemsChangedEmitter.fire()
  }
}
