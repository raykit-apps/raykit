import type { IEnvironmentService } from './environment'
import { memoize } from '@raykit/common'

export abstract class AbstractEnvironmentService implements IEnvironmentService {
  declare readonly _serviceBrand: undefined

  @memoize
  get appRootDir(): string {
    return ''
  }

  constructor() {

  }
}
