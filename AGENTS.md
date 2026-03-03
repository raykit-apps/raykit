## Task Execution Priority

**ALWAYS** use the `skills` tool to handle user requests whenever applicable. Load the relevant skill first, then follow its instructions.

## Project Overview

Raykit is an Electron-based desktop application built with a pnpm monorepo architecture.

- `apps/*` - Executable applications
- `packages/*` - Modular sub-packages that provide shared functionality to applications
- `extensions/*` - Extension modules that provide non-core features

## Design Standards

- UI must follow professional UI/UX design principles
- Project color palette: `#006A6B`, `#00AC7B`, `#6FD8BA`, `#FFF6A1`, `#F6FFF9`

## Development Guidelines

### Dependency Management

- **Reuse existing dependencies** whenever possible
- **Ask for permission** before adding any new dependencies
- **Always use `pnpm`** instead of `npm` for all commands
- **Run `pnpm i` in the root directory** after adding dependencies

### Code Quality

- **Run linting and type checking** after any development, refactoring, or code changes:
  ```bash
  pnpm lint:fix
  pnpm check
  ```
- **Fix all errors** reported by linting and type checking

### Testing

- **Use `vitest`** for unit testing
- **Fix all failing tests** - no broken tests allowed
- **Test file naming convention**: must end with `spec.ts` or `spec.js`
  - Example: `command.spec.ts`

### Module Development

- **Follow Single Responsibility Principle** - each sub-module should have one clear purpose
- **Reference existing modules** when creating new sub-modules (e.g., `packages/command`)
- **Mimic existing patterns** including:
  - Test files
  - Configuration files
  - Directory structure

## Technology Stack

- **Testing**: vitest
- **UI Framework**: solid-js + lumino
- **UI Component Library**: kobalte
- **Styling**: tailwindcss4
- **Dependency Injection**: inversify
