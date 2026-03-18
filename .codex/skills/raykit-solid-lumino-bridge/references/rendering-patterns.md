# Rendering Patterns

## Use `SolidWidget` for full widget content

Choose `SolidWidget` when Solid should own the widget body.

Use this when:

- Creating a new view, panel, or dockable widget body.
- Rendering the entire Lumino node with one Solid tree.
- Letting the widget own the service subscriptions that feed the UI.

Implement it this way:

1. Extend `SolidWidget`.
2. Inject the service in the constructor.
3. Mirror service state into Solid signals or stores.
4. Register event subscriptions with `_register(...)`.
5. Return the Solid tree from `render()`.

Why this works:

- Lumino still owns widget lifecycle and layout.
- Solid only mounts after `onAfterAttach`.
- Disposal stays inside the widget's existing `_store`.

## Use `SolidRenderer` for a specific host node

Choose `SolidRenderer` when another object already owns the DOM and you only need Solid inside a target element.

Use this when:

- Rendering a toolbar fragment, status area, slot, or nested DOM region.
- Keeping the outer Lumino widget separate from the inner Solid tree.
- Reusing one renderer implementation across multiple host nodes.

Implement it this way:

1. Extend `SolidRenderer`.
2. Inject `RendererHost` or let the renderer create its own host if the parent will append it.
3. Inject the same service you would use with `SolidWidget`.
4. Mirror service state into Solid signals or stores.
5. Call `renderer.render()` only after the host node is ready.

## Choose Between Them

Pick `SolidWidget` by default.

Only switch to `SolidRenderer` when at least one of these is true:

- The outer Lumino widget already has non-Solid structure that must stay in control.
- You need multiple isolated Solid subtrees inside a larger widget.
- You need to inject or replace a host node independently of the widget class.

## Avoid These Rendering Mistakes

- Do not render in the constructor.
- Do not create a second unmanaged DOM lifecycle beside Lumino.
- Do not put all business logic inside a presentational Solid component.
- Do not use `SolidRenderer` just because it sounds more generic. If the widget body is fully Solid, `SolidWidget` is the simpler path.
