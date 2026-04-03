import type { Layout } from '@raykit/widgets'
import { BoxLayout, BoxPanel, Panel, Widget } from '@raykit/widgets'
import { inject, injectable, postConstruct } from 'inversify'
import { ActionsBar } from '../actions-bar'

@injectable()
export class ApplicationShell extends Widget {
  topPanel?: Panel

  mainPanel?: Panel

  protected standaloneViewId?: string

  protected readonly maximizedElement: HTMLElement

  constructor(
    @inject(ActionsBar) protected readonly actionsBar: ActionsBar,
  ) {
    super()

    this.maximizedElement = this.node.ownerDocument.createElement('div')
    this.maximizedElement.className = 'fixed hidden top-0 left-0 bottom-0 right-0 z-[2000]'
    this.node.ownerDocument.body.appendChild(this.maximizedElement)
  }

  @postConstruct()
  protected init() {
    this.initializeShell()
  }

  protected initializeShell() {
    this.addClass('raykit-application-shell')
    this.id = 'raykit-app-shell'

    this.topPanel = this.createTopPanel()

    this.mainPanel = this.createMainPanel()

    this.layout = this.createLayout()
  }

  protected createMainPanel(): Panel {
    const mainPanel = new Panel()
    mainPanel.id = 'raykit-main-panel'
    mainPanel.show()
    return mainPanel
  }

  protected createTopPanel(): Panel {
    const topPanel = new Panel()
    topPanel.id = 'raykit-top-panel'
    topPanel.show()
    return topPanel
  }

  protected createLayout(): Layout {
    const boxLayout = new BoxLayout({ direction: 'top-to-bottom', spacing: 0 })

    BoxPanel.setStretch(this.topPanel!, 0)
    boxLayout.addWidget(this.topPanel!)

    BoxPanel.setStretch(this.mainPanel!, 1)
    boxLayout.addWidget(this.mainPanel!)

    BoxPanel.setStretch(this.actionsBar!, 0)
    boxLayout.addWidget(this.actionsBar!)

    return boxLayout
  }

  async addWidget(widget: Widget, options?: Readonly<ApplicationShell.WidgetOptions>): Promise<void> {
    if (!widget.id) {
      console.error('Widgets added to the application shell must have a unique id property.')
      return
    }

    if (this.standaloneViewId && widget.id !== this.standaloneViewId) {
      widget.hide()
      return
    }

    const area = this.standaloneViewId ? 'main' : (options?.area ?? 'main')
    const panel = area === 'top' ? this.topPanel : this.mainPanel
    if (!panel) {
      return
    }

    if (widget.parent === panel) {
      widget.show()
      return
    }

    switch (area) {
      case 'main':
        this.mainPanel?.addWidget(widget)
        break
      case 'top':
        this.topPanel?.addWidget(widget)
        break
      default:
        throw new Error(`Unexpected area: ${options?.area}`)
    }
  }

  getWidgets(area: ApplicationShell.Area): Widget[] {
    switch (area) {
      case 'main':
        return [...this.mainPanel?.widgets ?? []]
      case 'top':
        return [...this.topPanel?.widgets ?? []]
      default:
        throw new Error(`Illegal argument: ${area}`)
    }
  }

  async closeWidget(_id: string) {
    const widget = [
      ...(this.mainPanel?.widgets ?? []),
      ...(this.topPanel?.widgets ?? []),
    ].find(candidate => candidate.id === _id)

    widget?.close()
    return widget
  }

  configureStandaloneView(viewId: string): void {
    this.standaloneViewId = viewId
    this.topPanel?.hide()
    this.actionsBar.hide()
  }
}

export namespace ApplicationShell {
  export type Area = 'main' | 'top'
  export interface WidgetOptions {
    area?: Area
    ref?: Widget
  }
}
