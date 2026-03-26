import type { Layout } from '@raykit/widgets'
import { BoxLayout, BoxPanel, Panel, Widget } from '@raykit/widgets'

import { inject, injectable, postConstruct } from 'inversify'
import { ActionsBar } from '../actions-bar'

@injectable()
export class ApplicationShell extends Widget {
  mainPanel?: Panel

  topPanel?: Panel

  bottomPanel?: Panel

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

    this.mainPanel = this.createMainPanel()
    this.topPanel = this.createTopPanel()
    this.bottomPanel = this.createBottomPanel()

    this.layout = this.createLayout()
  }

  protected createMainPanel(): Panel {
    const mainPanel = new Panel()
    mainPanel.id = 'raykit-main-panel'
    mainPanel.hide()
    return mainPanel
  }

  protected createTopPanel(): Panel {
    const topPanel = new Panel()
    topPanel.id = 'raykit-top-panel'
    topPanel.hide()
    return topPanel
  }

  protected createBottomPanel(): Panel {
    const bottomPanel = new Panel()
    bottomPanel.id = 'raykit-bottom-panel'
    bottomPanel.hide()
    return bottomPanel
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
    const area = options?.area ?? 'main'
    switch (area) {
      case 'main':
        this.mainPanel?.addWidget(widget)
        break
      case 'top':
        this.topPanel?.addWidget(widget)
        break
      case 'bottom':
        this.bottomPanel?.addWidget(widget)
        break
      default:
        throw new Error(`Unexpected area: ${options?.area}`)
    }
  }
}

export namespace ApplicationShell {
  export type Area = 'main' | 'top' | 'bottom'

  export interface WidgetOptions {
    area?: Area
    ref?: Widget
  }
}
