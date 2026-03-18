# Registration Patterns

## Bind browser features through a `ContainerModule`

Keep bridge registrations in a browser module owned by the feature package.

Bind at least these pieces:

- state or coordination service
- widget class or renderer host owner
- `WidgetFactory` contribution
- `ApplicationBrowserContribution` if the feature should attach itself during layout initialization

Typical pattern:

```ts
options.bind(MyStateService).toSelf().inSingletonScope()
options.bind(MyWidget).toSelf()
options.bind(MyBrowserContribution).toSelf().inSingletonScope()

options.bind<WidgetFactory>(WidgetFactory).toDynamicValue(ctx => ({
  id: MyWidget.ID,
  createWidget: () => ctx.get(MyWidget),
})).inSingletonScope()

options.bind<ApplicationBrowserContribution>(ApplicationBrowserContribution)
  .toDynamicValue(ctx => ctx.get(MyBrowserContribution))
  .inSingletonScope()
```

## Let `WidgetService` own widget creation and reuse

Ask `WidgetService` for widgets instead of instantiating them directly when the widget should participate in the shared widget lifecycle.

Why:

- The service caches by factory id and options.
- The service exposes `onWillCreateWidget` and `onDidCreateWidget`.
- The service disposes cached entries when widgets emit `disposed`.

## Attach widgets from a browser contribution

If a widget should appear in the default layout, implement `initializeLayout(app)` on an `ApplicationBrowserContribution`.

Inside that method:

1. Request the widget from `WidgetService`.
2. Add it to `app.shell`.
3. Call `widget.show()` if the layout should make it visible immediately.

This path lines up with the current exported API of `@raykit/core/browser`.

## Treat view contributions as optional and local

`AbstractViewContribution` exists in the repo, but it is not exported from `@raykit/core/browser` today.

Because of that:

- Prefer `ApplicationBrowserContribution` for exported-package examples.
- Use `AbstractViewContribution` only when working inside `packages/core` or after exporting it intentionally.
- Remember that `AbstractViewContribution.openView()` only retrieves the widget through `WidgetService`; it does not attach the widget to the shell by itself.

## Confirm the command startup path before relying on commands

The repo has command primitives and a `CommandBrowserContribution`, but command-driven opening should only be part of the implementation if the current startup path actually invokes command registration for the target app.

If command wiring is already present in the feature you are editing, you can layer commands on top of the service and widget patterns above. Do not make commands the primary bridge between Solid state and the container.
