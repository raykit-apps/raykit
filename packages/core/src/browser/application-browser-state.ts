import type { Event } from '@raykit/base'
import type { ApplicationBrowserState } from '../common'
import { Deferred, Emitter } from '@raykit/base'

import { injectable } from 'inversify'

@injectable()
export class ApplicationBrowserStateService {
  private _state: ApplicationBrowserState = 'init'

  protected deferred: { [state: string]: Deferred<void> } = {}
  protected readonly stateChanged = new Emitter<ApplicationBrowserState>()

  get state(): ApplicationBrowserState {
    return this._state
  }

  set state(state: ApplicationBrowserState) {
    if (state !== this._state) {
      this.doSetState(state)
    }
  }

  get onStateChanged(): Event<ApplicationBrowserState> {
    return this.stateChanged.event
  }

  protected doSetState(state: ApplicationBrowserState): void {
    if (this.deferred[this._state] === undefined) {
      this.deferred[this._state] = new Deferred()
    }
    this._state = state
    if (this.deferred[state] === undefined) {
      this.deferred[state] = new Deferred()
    }
    this.deferred[state].resolve?.()
    this.stateChanged.fire(state)
  }

  reachedState(state: ApplicationBrowserState): Promise<void> {
    if (this.deferred[state] === undefined) {
      this.deferred[state] = new Deferred()
    }
    return this.deferred[state].promise
  }

  reachedAnyState(...states: ApplicationBrowserState[]): Promise<void> {
    return Promise.race(states.map(s => this.reachedState(s)))
  }
}
