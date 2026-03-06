import type { Event, MaybePromise } from '@raykit/base'
import { ContributionProvider, Emitter, WaitUntilEvent } from '@raykit/base'

import { Widget } from '@raykit/widgets'
import stableJsonStringify from 'fast-json-stable-stringify'
import { inject, injectable, named } from 'inversify'

export const WidgetFactory = Symbol('WidgetFactory')
export interface WidgetFactory {
  readonly id: string
  createWidget: (options?: any) => MaybePromise<Widget>
}

export interface WidgetConstructionOptions {
  factoryId: string
  options?: any
}

export interface WillCreateWidgetEvent extends WaitUntilEvent {
  readonly widget: Widget
  readonly factoryId: string
}

export interface DidCreateWidgetEvent {
  readonly widget: Widget
  readonly factoryId: string
}

@injectable()
export class WidgetService {
  protected _cachedFactories?: Map<string, WidgetFactory>
  protected readonly widgets = new Map<string, Widget>()
  protected readonly pendingWidgetPromises = new Map<string, Promise<Widget>>()

  constructor(
    @inject(ContributionProvider) @named(WidgetFactory)
    protected readonly factoryProvider: ContributionProvider<WidgetFactory>,
  ) {}

  protected readonly onWillCreateWidgetEmitter = new Emitter<WillCreateWidgetEvent>()

  readonly onWillCreateWidget: Event<WillCreateWidgetEvent> = this.onWillCreateWidgetEmitter.event

  protected readonly onDidCreateWidgetEmitter = new Emitter<DidCreateWidgetEvent>()

  readonly onDidCreateWidget: Event<DidCreateWidgetEvent> = this.onDidCreateWidgetEmitter.event

  async getWidget<T extends Widget>(factoryId: string, options?: any): Promise<T | undefined> {
    const key = this.toKey({ factoryId, options })
    const pendingWidget = this.doGetWidget<T>(key)
    const widget = pendingWidget && await pendingWidget
    return widget
  }

  async findWidget<T extends Widget>(factoryId: string, predicate: (options?: any) => boolean): Promise<T | undefined> {
    for (const [key, widget] of this.widgets.entries()) {
      if (this.testPredicate(key, factoryId, predicate)) {
        return widget as T
      }
    }
    for (const [key, widgetPromise] of this.pendingWidgetPromises.entries()) {
      if (this.testPredicate(key, factoryId, predicate)) {
        return widgetPromise as Promise<T>
      }
    }
  }

  protected testPredicate(key: string, factoryId: string, predicate: (options?: any) => boolean): boolean {
    const constructionOptions = this.fromKey(key)
    return constructionOptions.factoryId === factoryId && predicate(constructionOptions.options)
  }

  tryGetWidget<T extends Widget>(factoryId: string, options?: any): T | undefined {
    const key = this.toKey({ factoryId, options })
    const existing = this.widgets.get(key)
    if (existing instanceof Widget) {
      return existing as T
    }
    return undefined
  }

  protected doGetWidget<T extends Widget>(key: string): MaybePromise<T> | undefined {
    const pendingWidget = this.widgets.get(key) ?? this.pendingWidgetPromises.get(key)
    if (pendingWidget) {
      return pendingWidget as MaybePromise<T>
    }
    return undefined
  }

  async getOrCreateWidget<T extends Widget>(factoryId: string, options?: any): Promise<T> {
    const key = this.toKey({ factoryId, options })
    const existingWidget = this.doGetWidget<T>(key)
    if (existingWidget) {
      return existingWidget
    }
    const factory = this.factories.get(factoryId)
    if (!factory) {
      throw new Error(`No widget factory '${factoryId}' has been registered.`)
    }
    const widgetPromise = this.doCreateWidget<T>(factory, options).then((widget) => {
      this.widgets.set(key, widget)
      widget.disposed.connect(() => this.widgets.delete(key))
      this.onDidCreateWidgetEmitter.fire({ factoryId, widget })
      return widget
    }).finally(() => this.pendingWidgetPromises.delete(key))
    this.pendingWidgetPromises.set(key, widgetPromise)
    return widgetPromise
  }

  protected async doCreateWidget<T extends Widget>(factory: WidgetFactory, options?: any): Promise<T> {
    const widget = await factory.createWidget(options)
    try {
      await WaitUntilEvent.fire(this.onWillCreateWidgetEmitter, { factoryId: factory.id, widget })
    } catch (e) {
      widget.dispose()
      throw e
    }
    return widget as T
  }

  protected toKey(options: WidgetConstructionOptions): string {
    return stableJsonStringify(options)
  }

  protected fromKey(key: string): WidgetConstructionOptions {
    return JSON.parse(key)
  }

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
