## ADDED Requirements

### Requirement: Browser module structure

The browser command module SHALL follow the `@raykit/core` package structure with module, contribution, and index files.

#### Scenario: Module file organization

- **GIVEN** the browser command implementation
- **WHEN** examining the source structure
- **THEN** `browser-command-module.ts` SHALL contain inversify bindings
- **AND** `browser-command-contribution.ts` SHALL implement `BrowserApplicationContribution`
- **AND** `index.ts` SHALL export public browser APIs

### Requirement: Browser command module bindings

The `browser-command-module.ts` SHALL bind `CommandRegistry` as singleton and bind `BrowserCommandContribution` to `BrowserApplicationContribution`.

#### Scenario: Registry binding

- **WHEN** the browser module loads
- **THEN** `CommandRegistry` SHALL be bound as singleton in inversify container
- **AND** all injections of `CommandRegistry` SHALL receive the same instance

#### Scenario: Contribution binding

- **WHEN** the browser module loads
- **THEN** `BrowserCommandContribution` SHALL be bound to `BrowserApplicationContribution` symbol
- **AND** the contribution SHALL be discoverable by `BrowserApplication` lifecycle

### Requirement: Browser command contribution lifecycle

The `BrowserCommandContribution` SHALL implement `BrowserApplicationContribution` and register command contributions during the `configure()` lifecycle phase.

#### Scenario: Lifecycle integration

- **GIVEN** `BrowserCommandContribution` implements `BrowserApplicationContribution`
- **WHEN** `BrowserApplication` invokes `configure()` during startup
- **THEN** `BrowserCommandContribution.configure()` SHALL execute
- **AND** it SHALL collect all `CommandContribution` implementations
- **AND** it SHALL invoke `registerCommands(registry)` for each contribution

#### Scenario: Configuration ordering

- **GIVEN** multiple contributions implement `CommandContribution`
- **WHEN** `configure()` executes
- **THEN** contributions SHALL be invoked in dependency-resolved order
- **AND** each contribution SHALL receive the same `CommandRegistry` instance

### Requirement: Browser exports structure

The `index.ts` SHALL export browser-specific APIs following the same export pattern as `@raykit/core`.

#### Scenario: Public API exports

- **WHEN** importing from `@raykit/commands`
- **THEN** default export SHALL provide browser-appropriate APIs
- **AND** `browser` subpath SHALL explicitly export browser APIs
- **AND** `common` subpath SHALL export platform-agnostic types

#### Scenario: Export consistency

- **GIVEN** `@raykit/core` export patterns
- **WHEN** `@raykit/commands` defines exports
- **THEN** it SHALL follow the same `package.json` exports structure
- **AND** subpath exports SHALL resolve to appropriate `index.ts` files
