---
name: raykit-solid-lumino-bridge
description: Bridge solid-js UI with @lumino/widgets and inversify in the Raykit browser runtime. Use when creating or refactoring browser-side widgets, renderer hosts, widget factories, application contributions, or service-driven communication between Solid views and external container state in Raykit packages and desktop browser code.
---

# Raykit Solid Lumino Bridge

Use Raykit's existing browser primitives before adding new abstractions. Reuse `BaseWidget`, `SolidWidget`, `SolidRenderer`, `WidgetFactory`, `WidgetService`, and `ApplicationBrowserContribution` instead of inventing a parallel bridge.

## Start Here

1. Inspect the target package and confirm that the work belongs in `src/browser`.
2. Read [repo-map.md](./references/repo-map.md) to anchor the implementation to existing code.
3. Choose one rendering path:
   - Use `SolidWidget` for a full Lumino view or panel body.
   - Use `SolidRenderer` for a specific host element that already exists.
4. Put shared state and cross-widget communication into an injectable service.
5. Register widget creation through `WidgetFactory` and open or attach the widget from an `ApplicationBrowserContribution`.
6. Validate with `pnpm lint:fix` and `pnpm check`.

## Choose The Bridge

Use [rendering-patterns.md](./references/rendering-patterns.md) when deciding between the two rendering primitives.

Default to `SolidWidget` when the Solid tree owns the widget body. `SolidWidget` already waits for Lumino attachment before rendering, which matches the current implementation in `packages/widgets/src/browser/solid-widget.ts`.

Use `SolidRenderer` when a Lumino widget or another browser object already owns the DOM node and you only need Solid to render inside a provided host. Treat it as a targeted rendering primitive. The repo currently defines this primitive, but it is not yet used by a business-facing example, so keep the usage explicit and narrow.

## Drive State Through Services

Use [communication-patterns.md](./references/communication-patterns.md) for the state flow.

Keep `inversify` container access outside Solid components. Inject services into the widget or renderer, mirror service state into Solid signals or stores, and send UI actions back through service methods. Let Lumino messages handle widget lifecycle, not business events.

## Register Through Browser Contributions

Use [registration-patterns.md](./references/registration-patterns.md) for container bindings.

Register the service, widget, and factory inside a browser `ContainerModule`. If the widget should appear in the default layout, implement an `ApplicationBrowserContribution` that requests the widget from `WidgetService` and adds it to `app.shell`.

## Example

Use this example as the default end-to-end pattern for a new view. It covers module binding, widget creation, Solid rendering, service-driven updates, and shell attachment.

Call chain:

1. The desktop browser bootstrap loads your browser module.
2. The module binds the state service, widget class, factory contribution, and browser contribution.
3. `ApplicationBrowser.start()` runs contributions and then calls `initializeLayout`.
4. The browser contribution asks `WidgetService` for the widget.
5. `WidgetService` resolves the factory, creates the widget, and caches it.
6. The contribution adds the widget to `app.shell`.
7. Lumino attaches the widget, `SolidWidget` renders the Solid tree, and service events keep the UI in sync.

### 1. Define a service as the data bridge

```ts
import { Emitter } from '@raykit/base'
import { injectable } from 'inversify'

export interface CounterSnapshot {
  readonly count: number
}

@injectable()
export class CounterStateService {
  protected snapshot: CounterSnapshot = { count: 0 }
  protected readonly onDidChangeSnapshotEmitter = new Emitter<CounterSnapshot>()

  readonly onDidChangeSnapshot = this.onDidChangeSnapshotEmitter.event

  getSnapshot(): CounterSnapshot {
    return this.snapshot
  }

  increment(): void {
    this.update({ count: this.snapshot.count + 1 })
  }

  protected update(snapshot: CounterSnapshot): void {
    this.snapshot = snapshot
    this.onDidChangeSnapshotEmitter.fire(this.snapshot)
  }
}
```

### 2. Mirror service state into a `SolidWidget`

```tsx
import type { JSX } from 'solid-js'
import { SolidWidget } from '@raykit/widgets/browser'
import { inject, injectable } from 'inversify'
import { createSignal } from 'solid-js'
import { CounterStateService } from './counter-state-service'

function CounterPanel(props: { count: number, onIncrement: () => void }): JSX.Element {
  return (
    <div class="flex flex-col gap-3 p-4">
      <strong>{props.count}</strong>
      <button type="button" onClick={props.onIncrement}>Increment</button>
    </div>
  )
}

@injectable()
export class CounterWidget extends SolidWidget {
  static readonly ID = 'example-counter-widget'

  protected readonly countState = createSignal(0)
  protected readonly count = this.countState[0]
  protected readonly setCount = this.countState[1]

  constructor(
    @inject(CounterStateService)
    protected readonly stateService: CounterStateService,
  ) {
    super()
    this.id = CounterWidget.ID
    this.title.label = 'Counter'

    this.setCount(this.stateService.getSnapshot().count)
    this._register(this.stateService.onDidChangeSnapshot((snapshot) => {
      this.setCount(snapshot.count)
    }))
  }

  protected render(): JSX.Element {
    return (
      <CounterPanel
        count={this.count()}
        onIncrement={() => this.stateService.increment()}
      />
    )
  }
}
```

### 3. Register the service, widget, and factory in a browser module

```ts
import type { ApplicationBrowserContribution, WidgetFactory } from '@raykit/core/browser'
import { ApplicationBrowserContribution, WidgetFactory } from '@raykit/core/browser'
import { ContainerModule } from 'inversify'
import { CounterBrowserContribution } from './counter-browser-contribution'
import { CounterStateService } from './counter-state-service'
import { CounterWidget } from './counter-widget'

export const counterBrowserModule = new ContainerModule((options) => {
  options.bind(CounterStateService).toSelf().inSingletonScope()
  options.bind(CounterWidget).toSelf()

  options.bind(CounterBrowserContribution).toSelf().inSingletonScope()

  options.bind<WidgetFactory>(WidgetFactory).toDynamicValue(ctx => ({
    id: CounterWidget.ID,
    createWidget: () => ctx.get(CounterWidget),
  })).inSingletonScope()

  options.bind<ApplicationBrowserContribution>(ApplicationBrowserContribution)
    .toDynamicValue(ctx => ctx.get(CounterBrowserContribution))
    .inSingletonScope()
})
```

### 4. Attach the widget from an application contribution

```ts
import type { ApplicationBrowser, ApplicationBrowserContribution } from '@raykit/core/browser'
import { WidgetService } from '@raykit/core/browser'
import { inject, injectable } from 'inversify'
import { CounterWidget } from './counter-widget'

@injectable()
export class CounterBrowserContribution implements ApplicationBrowserContribution {
  constructor(
    @inject(WidgetService)
    protected readonly widgetService: WidgetService,
  ) {}

  async initializeLayout(app: ApplicationBrowser): Promise<void> {
    const widget = await this.widgetService.getOrCreateWidget<CounterWidget>(CounterWidget.ID)
    await app.shell.addWidget(widget, { area: 'main' })
    widget.show()
  }
}
```

### 5. Load the module in the browser bootstrap

```ts
import { ApplicationBrowser, applicationBrowserModule } from '@raykit/core/browser'
import { Container } from 'inversify'
import { counterBrowserModule } from './counter-browser-module'

const container = new Container()
container.load(applicationBrowserModule, counterBrowserModule)

await container.get(ApplicationBrowser).start()
```

### 6. Switch the same pattern to `SolidRenderer` only when you already have a host node

Keep the service and factory patterns unchanged. Replace `CounterWidget extends SolidWidget` with a host-owning Lumino widget plus a `CounterRenderer` that extends `SolidRenderer`. Inject `RendererHost` with that host node, move the signal subscription into the renderer, and keep UI callbacks writing back into the same service.

## Avoid These Moves

- Do not call Solid `render` from a widget constructor.
- Do not let Solid components fetch dependencies from the `inversify` container.
- Do not use Lumino messages as a business event bus.
- Do not share mutable business state directly between widgets.
- Do not bypass `_register` or `dispose` for event subscriptions and cleanup.

## Validate

1. Run `pnpm lint:fix`.
2. Run `pnpm check`.
3. If you changed tests or added a new browser-side unit, run `pnpm exec vitest run <path>`.
