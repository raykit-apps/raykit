# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project Overview

Raykit is a `pnpm` monorepo for an Electron desktop application and its build tooling. The primary runnable app lives in `apps/desktop`, while `apps/cli` provides the `rkc` CLI that builds and serves Electron main, preload, node, and renderer targets from `raykit.config.*`.

### Core Features

- DI-driven desktop bootstrap built on `inversify`, contribution providers, and runtime-specific modules.
- A custom Electron + Vite workflow via `rkc dev`, `rkc build`, and `rkc preview`.
- Source-first workspace packages for windows, commands, widgets, sandbox APIs, shared base utilities, and UI helpers.

## Essential Commands

### Development

```bash
pnpm dev                              # Run the desktop app in development mode
pnpm build                            # Build the desktop app from the repo root
pnpm --filter @raykit/desktop preview # Preview the production desktop build
pnpm --filter @raykit/cli build       # Rebuild the rkc CLI package
```

### Validation

```bash
pnpm lint:fix                         # ESLint autofix across the workspace
pnpm check                            # TypeScript noEmit check from the repo root
```

### Testing

```bash
pnpm exec vitest run <path>           # Run a targeted test file
pnpm exec vitest run packages/base/test/event.spec.ts
```

There is currently no root `pnpm test` script. Run targeted `vitest` commands when you add or change tests.

## Architecture

```text
pnpm dev / pnpm build
  -> @raykit/desktop
  -> @raykit/cli (rkc)
  -> build graph from raykit.config.*
     -> main runtime
        -> @raykit/core/main
        -> @raykit/windows/main
     -> preload runtime
        -> @raykit/sandbox
     -> renderer runtime
        -> @raykit/core/browser
        -> @raykit/commands/browser
        -> @raykit/widgets
        -> @raykit/ui
```

### Package Design

```text
apps/desktop
  -> runnable Electron application
  -> delegates build/dev orchestration to @raykit/cli

apps/cli (@raykit/cli)
  -> resolves raykit.config.*
  -> coordinates Vite builds/servers for main, preload, node, renderer

packages/base
  -> shared primitives: events, disposables, contribution providers, lifecycle utilities

packages/core
  -> application lifecycle in main/browser runtimes
  -> shell composition, view hosting, widget orchestration

packages/windows
  -> BrowserWindow abstractions and main-side window services

packages/commands
  -> command contracts, registry, browser command contribution

packages/widgets
  -> Lumino-based widget abstractions and Solid rendering bridge

packages/sandbox
  -> preload bridge and renderer-safe Electron surface

packages/ui
  -> shared UI utilities and component-level helpers

packages/logger
  -> logging symbols/contracts

packages/actions
  -> shared action package, currently minimal
```

### Runtime Flow

```text
Developer command
  -> @raykit/desktop
  -> @raykit/cli resolves build config
  -> main runtime starts through @raykit/core + @raykit/windows
  -> preload bridge comes from @raykit/sandbox
  -> renderer starts through @raykit/core/browser
  -> browser features compose with @raykit/commands, @raykit/widgets, and @raykit/ui
```

## Directory Structure

```text
apps/
  desktop/               Main Electron app and Raykit config
    src/browser/         Renderer entrypoint, HTML, and styles
    src/main/            Electron main entrypoint
    src/preload/         Preload entrypoint
    raykit.config.ts     Build and dev orchestration for rkc
  cli/                   rkc CLI source and Rollup build
packages/
  base/                  Shared primitives: events, disposables, contribution providers
  core/                  Application lifecycle, shell, and browser/main composition
  commands/              Command registry and browser command contribution
  widgets/               Lumino widgets and Solid rendering bridge
  windows/               Electron window abstractions and main-side services
  sandbox/               Preload globals and renderer-safe Electron surface
  ui/                    UI utility exports and shared component helpers
  logger/                Logger symbols and interfaces
  actions/               Shared action placeholder package
extensions/
  .gitkeep               Workspace is present but no extension architecture exists yet
docs/                    Project documentation
```

## Key Modules

| Package            | Purpose                       | Notes                                                                           |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------- |
| `@raykit/desktop`  | Runnable Electron app package | Owns the app-facing build config and runtime entrypoints                        |
| `@raykit/cli`      | Raykit build/dev CLI          | Orchestrates main, preload, node, and renderer workflows from `raykit.config.*` |
| `@raykit/base`     | Foundational shared utilities | Defines core primitives such as events, disposables, and contribution providers |
| `@raykit/core`     | Application composition layer | Owns main/browser lifecycle, shell, and view/widget coordination                |
| `@raykit/windows`  | Electron window layer         | Encapsulates BrowserWindow creation and main-side window services               |
| `@raykit/commands` | Command system                | Provides command contracts, registry behavior, and browser contributions        |
| `@raykit/widgets`  | Widget infrastructure         | Bridges Lumino widgets with Solid-based rendering patterns                      |
| `@raykit/sandbox`  | Preload and bridge layer      | Exposes renderer-safe Electron capabilities when preload is wired               |
| `@raykit/ui`       | UI helper package             | Holds shared UI utilities and optional component primitives                     |
| `@raykit/logger`   | Logging contract package      | Currently defines logger symbols/interfaces more than concrete implementations  |
| `@raykit/actions`  | Shared action package         | Present in the workspace but currently very small                               |

## Task Execution Priority

- Start from the repository, not assumptions. Check the existing package, runtime boundary, and nearby files before changing anything.
- If a project-specific detail is not clear from the codebase, ask the user instead of guessing.
- Prefer the smallest change that matches existing patterns. Do not invent new abstractions, runtime layers, folder conventions, or scripts unless the repo already uses them or the user explicitly asks for them.

## Change Placement Rules

- Follow the existing runtime split when adding code: `browser`, `main`, `common`, `node`, and `preload`.
- Reuse the established dependency injection pattern built on `inversify`, decorators, symbols, `ContainerModule`, and contribution providers from `@raykit/base`.
- Keep package responsibilities narrow. Extend existing packages such as `base`, `commands`, `core`, `widgets`, `windows`, `sandbox`, `logger`, `actions`, and `ui` before creating a parallel module.
- Respect the source-first workspace pattern. Most workspace packages export directly from `src`; `apps/cli` is the notable package that builds to `dist`.

## UI and Frontend

- The current desktop UI stack is primarily `solid-js` + `tailwindcss v4` + `lumino`.
- `@kobalte/core` is available in `packages/ui`, but do not assume it is the default choice everywhere unless surrounding code already uses it.
- For UI work, inspect existing browser entrypoints and shell/widget implementations first, especially under `apps/desktop/src/browser`, `packages/core/src/browser`, and `packages/widgets/src/browser`.
- Prefer the established project palette when introducing new UI: `#006A6B`, `#00AC7B`, `#6FD8BA`, `#FFF6A1`, `#F6FFF9`.

## Dependencies and Tooling

- Reuse existing dependencies whenever possible.
- Ask for permission before adding a new dependency, package, or root script.
- Use `workspace:*` for local packages and `catalog:` for shared third-party versions when that pattern already applies.
- Always use `pnpm` instead of `npm`.
- If you add or change dependencies, run `pnpm i` from the repository root.

## Language Standards

- Node `>=22` and `pnpm >=10` are required by the root package.
- Follow the existing ESLint setup built on `@antfu/eslint-config` with TypeScript and Solid support.
- Match the current codebase conventions: ESM, strict TypeScript, decorator metadata enabled, 2-space indentation, LF line endings, single quotes, and no semicolons.
- Use `vitest` for unit tests. Test files live under `test/` directories and end with `spec.ts` or `spec.js`.

## Validation Expectations

- After code changes, run `pnpm lint:fix` and `pnpm check` unless the user explicitly says not to.
- Run targeted `vitest` coverage for the code you changed when tests exist or when you add new tests.
- Fix reported issues instead of leaving known lint or type failures behind.

## Critical Gotchas

- `rkc` resolves `raykit.config.*`, not `vite.config.*`. `apps/cli/src/config.ts` explicitly rejects `vite.config.*` naming for Raykit app configs.
- The root scripts cover `dev`, `build`, `lint`, `lint:fix`, and `check`. There is no root `preview` or `test` script.
- `apps/desktop/src/preload/index.ts` imports `@raykit/sandbox/preload`, but `packages/windows/src/main/window-impl.ts` currently does not set `webPreferences.preload`. Do not assume `window.raykit` is available in the renderer unless you wire preload into the `BrowserWindow`.
- `packages/logger` currently provides logger contracts and symbols, not a fully wired logger implementation. Existing startup code still uses `console.*`.
- `extensions/*` is part of the workspace but is currently empty. Do not invent an extension runtime or package layout without user confirmation.
- The root `README.md` is still marked work in progress. For implementation details, inspect package entrypoints and source modules directly.

## When To Ask The User

Ask before proceeding when any of the following is unclear or not already established in the repo:

- the preferred implementation package or runtime layer
- whether to introduce a new dependency, package, or root script
- whether a new UI pattern, component library usage, or styling approach is acceptable
- naming and public API design when multiple valid patterns exist
- architectural changes that affect more than one package
