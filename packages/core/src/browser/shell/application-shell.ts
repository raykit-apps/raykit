import type { Layout } from '@raykit/widgets'
import { BoxLayout, Panel, Widget } from '@raykit/widgets'

import { injectable, postConstruct } from 'inversify'

@injectable()
export class ApplicationShell extends Widget {
  mainPanel?: Panel

  topPanel?: Panel

  bottomPanel?: Panel

  protected readonly maximizedElement: HTMLElement

  constructor() {
    super()

    this.maximizedElement = this.node.ownerDocument.createElement('div')
    this.maximizedElement.className = 'fixed top-0 left-0 bottom-0 right-0 z-[2000]'
    this.node.ownerDocument.body.appendChild(this.maximizedElement)
  }

  @postConstruct()
  protected init() {
    this.initializeShell()
  }

  protected initializeShell() {
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
    bottomPanel.id = 'raykit-top-panel'
    bottomPanel.hide()
    return bottomPanel
  }

  protected createLayout(): Layout {
    const boxLayout = new BoxLayout()
    return boxLayout
  }
}
