## ADDED Requirements

### Requirement: Global API Exposure

The system SHALL expose all sandbox APIs through a `window.raykit` global object in renderer processes.

#### Scenario: Access through window.raykit

- **WHEN** renderer code accesses `window.raykit`
- **THEN** it SHALL return an object containing all exposed APIs
- **AND** the object SHALL NOT be undefined or null

#### Scenario: Consistent API availability

- **WHEN** renderer code accesses `window.raykit.ipcRenderer`
- **THEN** it SHALL return the same object on multiple accesses
- **AND** the object SHALL be frozen or sealed to prevent modifications

#### Scenario: No direct Electron access

- **WHEN** renderer code tries to access `require('electron')` directly
- **THEN** the system SHALL throw an error or return undefined
- **AND** the error SHALL indicate that direct Electron access is not allowed

### Requirement: TypeScript Support

The system SHALL provide complete TypeScript type definitions for all sandbox APIs.

#### Scenario: Type definitions available

- **WHEN** importing types from `@raykit/sandbox`
- **THEN** TypeScript SHALL be able to resolve all type definitions
- **AND** IDE SHALL provide autocomplete for all API methods

#### Scenario: Global type augmentation

- **WHEN** writing code that accesses `window.raykit`
- **THEN** TypeScript SHALL recognize the type of the global object
- **AND** the type SHALL include all exposed APIs with proper signatures

#### Scenario: ipcRenderer event typing

- **WHEN** using `window.raykit.ipcRenderer.on('raykit:event', handler)`
- **THEN** the handler parameter SHALL be typed as IpcRendererEvent
- **AND** TypeScript SHALL validate the event structure

### Requirement: Process API Abstraction

The system SHALL provide a restricted Process API that safely exposes limited process information to renderer.

#### Scenario: Read-only process properties

- **WHEN** accessing `window.raykit.process.platform`
- **THEN** it SHALL return the operating system platform string
- **AND** the property SHALL be read-only

#### Scenario: Restricted environment access

- **WHEN** accessing `window.raykit.process.env`
- **THEN** it SHALL return a copy of environment variables
- **AND** modifications to the returned object SHALL NOT affect actual process.env

#### Scenario: Shell environment resolution

- **WHEN** calling `window.raykit.process.shellEnv()`
- **THEN** it SHALL return a Promise resolving to environment variables
- **AND** the result SHALL include shell-specific environment variables
