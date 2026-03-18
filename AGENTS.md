## Task Execution Priority

- Start from the repository, not assumptions. Check the existing package, runtime boundary, and nearby files before changing anything.
- If a project-specific detail is not clear from the codebase, ask the user instead of guessing. This applies to tech-stack choices, code style edge cases, naming, folder placement, UI behavior, dependency choices, and architectural direction.
- Prefer the smallest change that matches existing patterns. Do not invent new abstractions, runtime layers, folder conventions, or scripts unless the repo already uses them or the user explicitly asks for them.

## Project Overview

Raykit is a `pnpm` monorepo for an Electron desktop application.

- `apps/desktop` is the main Electron app.
- `apps/cli` provides the `rkc` CLI used by the desktop app build/dev flow.
- `packages/*` contains reusable source-first workspace packages that usually export directly from `src`.
- `extensions/*` exists in the workspace, but is currently empty. Do not assume extension architecture or conventions without user confirmation.

## Architecture Conventions

- Follow the existing runtime split when adding code: `browser`, `main`, `common`, `node`, and `preload`.
- Reuse the established dependency injection pattern built on `inversify`, decorators, symbols, `ContainerModule`, and contribution providers from `@raykit/base`.
- Keep package responsibilities narrow. Extend existing packages such as `base`, `commands`, `core`, `widgets`, `windows`, `sandbox`, `logger`, `actions`, and `ui` before creating parallel modules.
- Respect the existing source-first package pattern. Most workspace packages export TypeScript entrypoints from `src`; `apps/cli` is the notable package that builds to `dist`.

## UI and Frontend

- The current desktop UI stack is primarily `solid-js` + `tailwindcss v4` + `lumino`.
- `@kobalte/core` is available in `packages/ui`, but do not assume it is the default choice everywhere unless the surrounding package already uses it.
- For UI work, inspect existing browser entrypoints and shell/widget implementations first, especially under `apps/desktop/src/browser`, `packages/core/src/browser`, and `packages/widgets/src/browser`.
- Follow professional desktop UI/UX standards and prefer the project palette: `#006A6B`, `#00AC7B`, `#6FD8BA`, `#FFF6A1`, `#F6FFF9`.

## Dependency Management

- Reuse existing dependencies whenever possible.
- Ask for permission before adding any new dependency.
- Use `workspace:*` for local packages and `catalog:` for shared third-party versions when that pattern already applies.
- Always use `pnpm` instead of `npm`.
- Run `pnpm i` in the repository root after adding dependencies.

## Code Style

- Follow the existing ESLint + `@antfu/eslint-config` setup instead of inventing new style rules.
- Match the current codebase conventions: ESM, strict TypeScript, decorators enabled, 2-space indentation, LF line endings, single quotes, and no semicolons.
- Mimic nearby file structure, naming, exports, and comments before introducing a new local pattern.
- Follow single responsibility principle for modules and services.

## Validation

- After code changes, run the relevant validation commands and fix all reported issues:
  ```bash
  pnpm lint:fix
  pnpm check
  ```
- Use `vitest` for unit tests.
- Test files should live under `test` directories and end with `spec.ts` or `spec.js`.
- There is currently no root `pnpm test` script, so run targeted tests with `pnpm exec vitest run <path>` when you add or modify tests.

## When To Ask The User

Ask before proceeding when any of the following is unclear or not already established in the repo:

- the preferred implementation package or runtime layer
- whether to introduce a new dependency, package, or root script
- whether a new UI pattern, component library usage, or styling approach is acceptable
- naming and public API design when multiple valid patterns exist
- architectural changes that affect more than one package
