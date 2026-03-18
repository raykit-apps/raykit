# Communication Patterns

## Use a service as the single source of truth

Keep external data flow centered on an injectable service.

The service should usually provide:

- A synchronous snapshot getter such as `getSnapshot()`.
- One or more write methods such as `setValue(...)`, `increment()`, or `updateFilter(...)`.
- An `Emitter`-backed event such as `onDidChangeSnapshot`.

This pattern lets non-UI code update state without depending on Solid or Lumino directly.

## Sync external container data into Solid

Do not let the Solid component query the container by itself.

Use this flow:

1. Inject the service into the widget or renderer.
2. Read the initial snapshot before the first render.
3. Mirror that snapshot into `createSignal(...)` or `createStore(...)`.
4. Subscribe to the service event.
5. Update the signal or store inside the event callback.
6. Register the subscription with `_register(...)` or the renderer's disposable store.

This keeps the UI reactive while preserving a clear boundary:

- The service owns durable state.
- The widget or renderer owns UI synchronization.
- The Solid component stays dumb enough to test and move.

## Send UI actions back out through service methods

When a button, input, or menu item changes data, call a service method from the widget or component props. Do not mutate another widget or container binding directly.

Good direction:

- Solid UI event
- widget or renderer callback
- service method
- service event
- signal or store update
- UI refresh

## Use Lumino lifecycle only for widget lifecycle

Use Lumino messages and hooks for:

- attach
- detach
- update requests
- layout-specific behavior

Do not use Lumino messages as a replacement for:

- service events
- command execution
- application-level coordination

## Choose the Solid state holder

Use `createSignal` for a small number of scalar fields.

Use `createStore` when the service snapshot is a nested object and updates should remain field-oriented.

Either way, keep the subscription bridge outside the presentational component unless there is a strong local reason to colocate it.
