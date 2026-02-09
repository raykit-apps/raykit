/**
 * Common types for sandbox module.
 */

/**
 * Product configuration interface.
 */
export interface IProductConfiguration {
  readonly name: string
  readonly version: string
  readonly [key: string]: unknown
}

/**
 * Process environment interface.
 */
export interface IProcessEnvironment {
  [key: string]: string | undefined
}

/**
 * NLS configuration interface.
 */
export interface INlsConfiguration {
  /**
   * All NLS messages produced by `localize` and `localize2` calls.
   */
  readonly messages: string[]

  /**
   * The actual language of the NLS messages (e.g. 'en', de' or 'pt-br').
   */
  readonly language: string | undefined
}

/**
 * The common properties required for any sandboxed renderer to function.
 */
export interface ISandboxConfiguration {
  /**
   * Identifier of the sandboxed renderer.
   */
  readonly windowId: number

  /**
   * Root path of the JavaScript sources.
   *
   * Note: This is NOT the installation root directory itself but contained in it at
   * a level that is platform dependent.
   */
  readonly appRoot: string

  /**
   * Per window process environment.
   */
  readonly userEnv: IProcessEnvironment

  /**
   * Product configuration.
   */
  readonly product: IProductConfiguration

  /**
   * Configured zoom level.
   */
  readonly zoomLevel?: number

  /**
   * Location of V8 code cache.
   */
  readonly codeCachePath?: string

  /**
   * NLS support
   */
  readonly nls: INlsConfiguration

  /**
   * DEV time only: All CSS-modules that we have.
   */
  readonly cssModules?: string[]
}
