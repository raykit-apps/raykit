import type { MaybePromise } from '@raykit/base'
import type { MainApplication } from './main-application'

/**
 * Symbol for the main application contribution.
 */
export const MainApplicationContribution = Symbol('MainApplicationContribution')

/**
 * Contribution for hooking into the main application lifecycle:
 *
 * - `onStart()`
 * - `onStop()`
 */
export interface MainApplicationContribution {

  /**
   * Called when the application is started.
   * Use this to start any services or functionality.
   *
   * The implementation may be async, however it will still block the
   * startup step until it's resolved.
   *
   * @returns either `undefined` or a Promise resolving to `undefined`.
   */
  onStart?: (application: MainApplication) => MaybePromise<void>

  /**
   * Called when the application is stopped or unloaded.
   * Use this to clean up resources.
   *
   * Note: Only synchronous operations should be performed here.
   */
  onStop?: (application: MainApplication) => void
}
