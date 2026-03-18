# Repo Map

Use these files as the current source of truth for the bridge:

- `packages/widgets/src/browser/widget.ts`
  - Applies `@injectable()` to Lumino `Widget` with `decorate(injectable(), Widget)`.
  - Defines `BaseWidget`, which adds `_register(...)` and disposes a `DisposableStore` in `dispose()`.
- `packages/widgets/src/browser/solid-widget.ts`
  - Defines `SolidWidget`.
  - Calls Solid `render(...)` only from `onAfterAttach`, which is the correct full-view bridge for Lumino widgets.
- `packages/widgets/src/browser/solid-renderer.ts`
  - Defines `SolidRenderer` and `RendererHost`.
  - Creates or injects a host element, then renders a Solid tree into that host.
  - Treats the Solid root as a disposable resource.
- `packages/core/src/browser/widget-service.ts`
  - Defines `WidgetFactory`, `WidgetService`, widget caching, and widget creation events.
  - Uses a contribution provider to collect all widget factories.
- `packages/core/src/browser/application-browser-module.ts`
  - Binds `ApplicationBrowser`, `ApplicationBrowserContribution`, `WidgetFactory`, and `WidgetService`.
- `packages/core/src/browser/application-browser.ts`
  - Starts browser contributions, attaches the shell, and calls `initializeLayout`.
- `packages/base/src/contribution-provider.ts`
  - Defines the contribution provider pattern used across the repo.
- `packages/base/src/event.ts`
  - Defines `Emitter`, `Event`, and `WaitUntilEvent`, which are the default event tools for service-driven communication.

Read the target package after reading these files. The bridge belongs in the package that owns the browser feature, not automatically in `packages/widgets` or `packages/core`.

## Current Constraints

- `SolidRenderer` exists as a reusable primitive, but the repo does not currently contain a business-facing example that uses it.
- `ApplicationShell` is not exported from `@raykit/core/browser`, but `ApplicationBrowser.shell` is available through the browser contribution lifecycle.
- `AbstractViewContribution` exists in `packages/core/src/browser/shell/view-contribution.ts`, but it is not currently exported from `@raykit/core/browser`. Do not depend on it from another package unless you first expose it or keep the logic local to `packages/core`.
