import { Widget } from '@lumino/widgets'
import { decorate, injectable } from 'inversify'

decorate(injectable(), Widget)

export * from '@lumino/messaging'
export * from '@lumino/widgets'

@injectable()
export class BaseWidget extends Widget {

}
