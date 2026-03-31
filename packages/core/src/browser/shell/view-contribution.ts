import type { Command, CommandRegistry } from '@raykit/commands'
import type { Widget } from '@raykit/widgets'
import type { BindWhenOnFluentSyntax, ContainerModuleLoadOptions, ServiceIdentifier } from 'inversify'
import { CommandContribution } from '@raykit/commands'
import { inject, injectable, unmanaged } from 'inversify'
import { WidgetService } from '../widget-service'
import { ApplicationShell } from './application-shell'

export interface OpenViewArguments {
  toggle?: boolean
  activate?: boolean
  reveal?: boolean
}

export interface ViewContributionOptions {
  widgetId: string
  toggleCommandId?: string
  widgetName: string
  defaultWidgetOptions: ApplicationShell.WidgetOptions
}

export function bindViewContribution<T extends AbstractViewContribution<Widget>>(options: ContainerModuleLoadOptions, identifier: ServiceIdentifier<T>): BindWhenOnFluentSyntax<T> {
  const syntax = options.bind<T>(identifier).toSelf().inSingletonScope()
  options.bind(CommandContribution).toService(identifier)
  return syntax
}

@injectable()
export abstract class AbstractViewContribution<T extends Widget> implements CommandContribution {
  @inject(WidgetService) protected readonly widgetService!: WidgetService

  @inject(ApplicationShell) protected readonly shell!: ApplicationShell

  readonly toggleCommand?: Command

  constructor(
    @unmanaged() protected readonly options: ViewContributionOptions,
  ) {
    if (options.toggleCommandId) {
      this.toggleCommand = {
        id: options.toggleCommandId,
        category: 'View',
        label: this.viewLabel,
      }
    }
  }

  get viewId(): string {
    return this.options.widgetId
  }

  get viewLabel(): string {
    return this.options.widgetName
  }

  get widget(): Promise<T> {
    return this.widgetService!.getOrCreateWidget(this.viewId)
  }

  async openView(args: Partial<OpenViewArguments> = {}): Promise<T> {
    const shell = this.shell
    const widget = await this.widgetService.getOrCreateWidget(this.viewId)
    console.log(widget)
    await shell.addWidget(widget!)
    return this.widget
  }

  registerCommands(commands: CommandRegistry) {
    if (this.toggleCommand) {
      commands.registerCommand(this.toggleCommand, {
        execute: () => this.toggleView(),
      })
    }
  }

  async closeView(): Promise<T | undefined> {
    const widget = await this.shell?.closeWidget(this.viewId)
    return widget as T | undefined
  }

  toggleView() {
    this.openView()
  }
}
