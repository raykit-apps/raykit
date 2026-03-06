import type { MaybePromise } from '@raykit/base'
import type { ApplicationBrowser } from './application-browser'

/**
 * Symbol for the browser application contribution.
 */
export const ApplicationBrowserContribution = Symbol('ApplicationBrowserContribution')

/**
 * Contribution for hooking into the browser application lifecycle:
 *
 * - `initialize()`
 * - `configure()`
 * - `onStart()`
 * - `onStop()`
 */
export interface ApplicationBrowserContribution {
  /**
   * Called on application startup before configure is called.
   * Use this for functionality which has to run as early as possible.
   *
   * The implementation may be async, however it will still block the
   * initialization step until it's resolved.
   *
   * @returns either `undefined` or a Promise resolving to `undefined`.
   */
  initialize?: () => void

  /**
   * Called after the initialization of the application is complete.
   * Use this to configure the application before it is started.
   *
   * The implementation may be async, however it will still block the
   * configuration step until it's resolved.
   *
   * @returns either `undefined` or a Promise resolving to `undefined`.
   */
  configure?: (app: ApplicationBrowser) => MaybePromise<void>

  /**
   * Called when the application is started.
   * Use this to start any services or functionality.
   *
   * The implementation may be async, however it will still block the
   * startup step until it's resolved.
   *
   * @returns either `undefined` or a Promise resolving to `undefined`.
   */
  onStart?: (app: ApplicationBrowser) => MaybePromise<void>

  /**
   * Called when the application is stopped or unloaded.
   * Use this to clean up resources.
   *
   * Note: Only synchronous operations should be performed here.
   */
  onStop?: (app: ApplicationBrowser) => void

  /**
   * Called after the application shell has been attached in case there is no previous workbench layout state.
   * Should return a promise if it runs asynchronously.
   */
  initializeLayout?: (app: ApplicationBrowser) => MaybePromise<void>
}

/**
 * Default browser contribution that can be extended by clients if they do not want to implement any of the
 * methods from the interface but still want to contribute to the browser application.
 */
export abstract class DefaultApplicationBrowserContribution implements ApplicationBrowserContribution {
  initialize(): void {
    // NOOP
  }
}
