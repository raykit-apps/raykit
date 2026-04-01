/// <reference types="vite/client" />

declare module 'virtual:raykit/auto-browser-modules' {
  import type { Container } from 'inversify'

  export function loadAutoBrowserModules(container: Container): void
}

declare module 'virtual:raykit/auto-main-modules' {
  import type { Container } from 'inversify'

  export function loadAutoMainModules(container: Container): void
}

declare module 'virtual:raykit/auto-node-modules' {
  import type { Container } from 'inversify'

  export function loadAutoNodeModules(container: Container): void
}
