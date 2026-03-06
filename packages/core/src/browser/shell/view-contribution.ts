import type { Command, CommandContribution, CommandRegistry } from '@raykit/commands'
import type { Widget } from '@raykit/widgets'
import { inject, unmanaged } from 'inversify'
import { WidgetService } from '../widget-service'
import { ApplicationShell } from './application-shell'

export interface ViewContributionOptions {
  widgetId: string
  toggleCommandId?: string
  widgetName: string
}

export abstract class AbstractViewContribution<T extends Widget> implements CommandContribution {
  @inject(WidgetService)
  protected readonly widgetService?: WidgetService

  @inject(ApplicationShell)
  protected readonly shell?: ApplicationShell

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

  async openView(): Promise<T> {
    return this.widget
  }

  registerCommands(commands: CommandRegistry) {
    if (this.toggleCommand) {
      commands.registerCommand(this.toggleCommand, {
        execute: () => this.toggleView(),
      })
    }
  }

  // async closeView(): Promise<T | undefined> {
  //   const widget = await this.shell.closeWidget(this.viewId)
  //   return widget as T | undefined
  // }

  toggleView() {
    this.openView()
  }
}
