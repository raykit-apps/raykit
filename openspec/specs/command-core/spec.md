## ADDED Requirements

### Requirement: Command definition structure

The system SHALL define a `Command` interface with required `id` field and optional metadata fields including `label`, `category`, and `iconClass`.

#### Scenario: Creating a basic command

- **WHEN** a developer defines a command with id "file.open"
- **THEN** the system SHALL accept the command definition
- **AND** the command SHALL be identifiable by its id

#### Scenario: Creating a command with metadata

- **WHEN** a developer defines a command with label "Open File", category "File", and iconClass "fa-folder-open"
- **THEN** the system SHALL store all metadata
- **AND** the command SHALL be queryable by any metadata field

### Requirement: Command handler interface

The system SHALL define a `CommandHandler` interface with `execute()` method and optional lifecycle methods including `isEnabled()`, `isVisible()`, and `isToggled()`.

#### Scenario: Handler with basic execution

- **WHEN** a command handler implements only `execute()` method
- **THEN** the system SHALL execute the handler when command is invoked
- **AND** the handler SHALL receive any arguments passed to the command

#### Scenario: Handler with enablement check

- **WHEN** a command handler implements `isEnabled()` returning false
- **THEN** the system SHALL report the command as disabled
- **AND** the system SHALL prevent execution of the command

#### Scenario: Handler with visibility check

- **WHEN** a command handler implements `isVisible()` returning false
- **THEN** the system SHALL report the command as not visible
- **AND** consuming UI systems MAY hide the command from menus

### Requirement: Command registration and lookup

The system SHALL provide a `CommandRegistry` that allows registration of commands with handlers and lookup of commands by id.

#### Scenario: Registering a command with handler

- **WHEN** a developer calls `registry.registerCommand(command, handler)`
- **THEN** the system SHALL store the command and its handler
- **AND** subsequent lookups by command id SHALL return the command

#### Scenario: Multiple handlers for same command

- **WHEN** multiple handlers are registered for the same command id
- **THEN** the system SHALL maintain all handlers in priority order
- **AND** the first enabled handler SHALL be used for execution

#### Scenario: Command lookup by id

- **GIVEN** a command with id "editor.save" is registered
- **WHEN** calling `registry.getCommand("editor.save")`
- **THEN** the system SHALL return the command definition
- **AND** calling `registry.getCommand("nonexistent")` SHALL return undefined

### Requirement: Command execution

The system SHALL provide command execution through `executeCommand(id, ...args)` which finds the active handler and invokes it.

#### Scenario: Successful command execution

- **GIVEN** a command "file.save" is registered with a handler that returns Promise.resolve("saved")
- **WHEN** calling `registry.executeCommand("file.save")`
- **THEN** the system SHALL invoke the handler
- **AND** the returned promise SHALL resolve with "saved"

#### Scenario: Command execution with arguments

- **GIVEN** a command "editor.openFile" is registered
- **WHEN** calling `registry.executeCommand("editor.openFile", "/path/to/file.txt")`
- **THEN** the system SHALL pass "/path/to/file.txt" as argument to the handler

#### Scenario: Execution of disabled command

- **GIVEN** a command with handler that returns `isEnabled() = false`
- **WHEN** calling `registry.executeCommand("disabled.cmd")`
- **THEN** the system SHALL reject with error indicating no active handler

#### Scenario: Execution of nonexistent command

- **WHEN** calling `registry.executeCommand("nonexistent")`
- **THEN** the system SHALL reject with error indicating command not found

### Requirement: Command lifecycle events

The system SHALL emit events for command lifecycle including will-execute and did-execute events.

#### Scenario: Pre-execution event

- **GIVEN** a listener is registered for onWillExecuteCommand
- **WHEN** any command is about to execute
- **THEN** the system SHALL emit will-execute event with command id and arguments
- **AND** listeners MAY perform setup or validation before execution proceeds

#### Scenario: Post-execution event

- **GIVEN** a listener is registered for onDidExecuteCommand
- **WHEN** any command completes execution (success or failure)
- **THEN** the system SHALL emit did-execute event with command id and arguments
- **AND** listeners MAY perform cleanup or logging after execution completes

### Requirement: Command contribution extension point

The system SHALL define a `CommandContribution` interface that allows modules to register commands during application initialization.

#### Scenario: Basic contribution

- **GIVEN** a module implements `CommandContribution` with `registerCommands(registry)` method
- **WHEN** the application initializes contributions
- **THEN** the system SHALL call `registerCommands` with the `CommandRegistry` instance
- **AND** the contribution MAY register any number of commands and handlers

#### Scenario: Multiple contributions

- **GIVEN** multiple modules implement `CommandContribution`
- **WHEN** the application initializes
- **THEN** the system SHALL invoke each contribution's `registerCommands` method
- **AND** all registered commands SHALL be available through the registry
