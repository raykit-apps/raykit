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
  protected readonly widgets = new Map<string, Widget>()

  constructor(
    @inject(ContributionProvider) @named(WidgetFactory)
    protected readonly factoryProvider: ContributionProvider<WidgetFactory>,
  ) {}
}
