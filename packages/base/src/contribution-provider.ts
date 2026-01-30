import type { ContainerModuleLoadOptions, ResolutionContext, ServiceIdentifier } from 'inversify'

export const ContributionProvider = Symbol('ContributionProvider')

export interface ContributionProvider<T extends object> {
  getContributions: () => T[]
}

class ContainerBasedContributionProvider<T extends object> implements ContributionProvider<T> {
  protected services: T[] | undefined

  constructor(
    protected readonly serviceIdentifier: ServiceIdentifier<T>,
    protected readonly context: ResolutionContext,
  ) {}

  getContributions(): T[] {
    if (this.services === undefined) {
      const currentServices: T[] = []
      const currentContext: ResolutionContext | null = this.context
      if (currentContext !== null) {
        try {
          currentServices.push(...currentContext.getAll<T>(this.serviceIdentifier))
        } catch (error) {
          console.error(error)
        }
      }

      this.services = currentServices
    }
    return this.services
  }
}

export function bindContributionProvider(bindable: ContainerModuleLoadOptions, id: symbol): void {
  bindable
    .bind(ContributionProvider)
    .toDynamicValue(ctx => new ContainerBasedContributionProvider(id, ctx))
    .inSingletonScope()
    .whenNamed(id)
}
