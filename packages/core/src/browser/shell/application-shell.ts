import type { DockPanel } from '@lumino/widgets'
import { Widget } from '@raykit/widgets'
import { injectable, postConstruct } from 'inversify'

@injectable()
export class ApplicationShell extends Widget {
  mainPanel?: DockPanel

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

  }
}
