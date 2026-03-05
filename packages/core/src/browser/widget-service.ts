import type { MaybePromise } from '@raykit/base'
import type { Widget } from '@raykit/widgets'
import { ContributionProvider } from '@raykit/base'
import { inject, injectable, named } from 'inversify'

export const WidgetFactory = Symbol('WidgetFactory')
export interface WidgetFactory {
  readonly id: string
  createWidget: (options?: any) => MaybePromise<Widget>
}

@injectable()
export class WidgetService {
  protected _cachedFactories?: Map<string, WidgetFactory>

  protected readonly widgets = new Map<string, Widget>()

  constructor(
    @inject(ContributionProvider) @named(WidgetFactory)
    protected readonly factoryProvider: ContributionProvider<WidgetFactory>,
  ) {}

  protected get factories(): Map<string, WidgetFactory> {
    if (!this._cachedFactories) {
      this._cachedFactories = new Map()
      for (const factory of this.factoryProvider.getContributions()) {
        if (factory.id) {
          this._cachedFactories.set(factory.id, factory)
        } else {
          // this.logger.error('Invalid ID for factory: ' + factory + ". ID was: '" + factory.id + "'.");
          console.warn(`Invalid ID for factory: ${factory}. ID was: '${factory.id}'.`)
        }
      }
    }
    return this._cachedFactories
  }
}
