## ADDED Requirements

### Requirement: Auxiliary Preload Script

The system SHALL provide a lightweight preload script for auxiliary windows that only require basic IPC and webFrame functionality.

#### Scenario: Auxiliary window initialization

- **WHEN** a BrowserWindow is created with `@raykit/sandbox/preload-aux` as preload
- **THEN** the window SHALL have access to `window.raykit` object containing limited ipcRenderer and webFrame only

#### Scenario: No process API in aux preload

- **WHEN** renderer accesses `window.raykit.process` in aux window
- **THEN** the system SHALL return undefined or throw Error indicating the API is not available

#### Scenario: No webUtils in aux preload

- **WHEN** renderer accesses `window.raykit.webUtils` in aux window
- **THEN** the system SHALL return undefined as this API is excluded from auxiliary preload

### Requirement: Minimal IPC in Aux Mode

The system SHALL only expose essential IPC methods in auxiliary preload.

#### Scenario: Limited ipcRenderer methods

- **WHEN** examining `window.raykit.ipcRenderer` in aux window
- **THEN** it SHALL only contain `send` and `invoke` methods
- **AND** it SHALL NOT contain `on`, `once`, `removeListener` methods

#### Scenario: Aux window can send messages

- **WHEN** aux window calls `window.raykit.ipcRenderer.send('raykit:action', data)`
- **THEN** the main process SHALL receive the IPC message

#### Scenario: Aux window can invoke methods

- **WHEN** aux window calls `window.raykit.ipcRenderer.invoke('raykit:method', args)`
- **THEN** the system SHALL return a Promise with the result
