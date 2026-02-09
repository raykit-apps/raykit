## ADDED Requirements

### Requirement: Sandbox Preload Script

The system SHALL provide a main preload script that safely exposes Electron APIs to renderer processes through contextBridge.

#### Scenario: Main window initialization

- **WHEN** a BrowserWindow is created with `@raykit/sandbox/preload` as preload
- **THEN** the window SHALL have access to `window.raykit` object containing ipcRenderer, webFrame, webUtils, process, and context

#### Scenario: IPC Channel Validation

- **WHEN** renderer calls `window.raykit.ipcRenderer.send('invalid:channel')`
- **THEN** the system SHALL throw an Error with message containing "Unsupported event IPC channel"

#### Scenario: Configuration Resolution

- **WHEN** preload script executes with `--raykit-window-config=<channel>` argument
- **THEN** the system SHALL invoke that channel to fetch ISandboxConfiguration
- **AND** apply userEnv to process.env
- **AND** set webFrame zoom level from configuration

### Requirement: IPC Renderer API

The system SHALL expose a minimal but complete IpcRenderer API through contextBridge.

#### Scenario: Send message to main

- **WHEN** renderer calls `window.raykit.ipcRenderer.send('raykit:action', data)`
- **THEN** the main process SHALL receive the IPC message with the data

#### Scenario: Invoke method on main

- **WHEN** renderer calls `window.raykit.ipcRenderer.invoke('raykit:method', args)`
- **THEN** the system SHALL return a Promise that resolves with the result from main

#### Scenario: Listen to events from main

- **WHEN** renderer calls `window.raykit.ipcRenderer.on('raykit:event', handler)`
- **THEN** the handler SHALL be called whenever main sends that event
