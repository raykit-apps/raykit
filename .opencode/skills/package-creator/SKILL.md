---
name: package-creator
description: Create packages following the project's modular architecture with optional src subdirectories (common, browser, main, node). Use when users need to create new packages under packages/ directory with proper structure. Also use for Chinese requests about creating packages (创建包/软件包), submodules (子模块), or working within specific modules (在...模块下创建).
---

# raykit Package Creator

Create new raykit packages following the project's standardized modular architecture with optional module selection.

## Package Structure

When creating a package at `packages/<package-name>/`:

```
packages/<package-name>/
├── package.json          # Required, name: @raykit/<package-name>
├── tsconfig.json         # Required, extends root tsconfig.json
└── src/
    ├── common/           # Optional, shared code
    ├── browser/          # Optional, browser-specific code
    ├── main/             # Optional, main process code
    └── node/              # Optional, node-specific code
```

## Naming Conventions

1. **Package directory name**: lowercase with hyphens (e.g., `my-package`, `core-utils`)
2. **Package name in package.json**: `@raykit/` + directory name (e.g., `@raykit/my-package`)

## Usage

To create a new package, run the script with the package name and optional module flags:

```bash
node .opencode/skills/package-creator/scripts/create-package.ts [options] <package-name>
```

### Options

- `--common` - Include common module
- `--browser` - Include browser module
- `--main` - Include main module
- `--node` - Include node module
- `--all` - Include all modules (default if no modules specified)

### Examples

```bash
# Create a package with all modules (default)
node .opencode/skills/package-creator/scripts/create-package.ts storage

# Create a package with specific modules
node .opencode/skills/package-creator/scripts/create-package.ts storage --common --browser

# Create a package with main and node modules
node .opencode/skills/package-creator/scripts/create-package.ts file-utils --main --node

# Create a package with all modules explicitly
node .opencode/skills/package-creator/scripts/create-package.ts window-manager --all
```

## Package.json Exports

The script automatically generates `exports` field in `package.json` based on selected modules:

```json
{
  "exports": {
    ".": "./src/common/index.ts",
    "./common": "./src/common/index.ts",
    "./browser": "./src/browser/index.ts",
    "./main": "./src/main/index.ts"
  },
  "main": "./src/common/index.ts",
  "types": "./src/common/index.ts"
}
```

- The `"."` export uses the first available module (common if present, otherwise first selected module)
- Each selected module gets its own export path

## Validation

The package name must:

- Contain only lowercase letters, numbers, and hyphens
- Start with a lowercase letter
- Not contain underscores, spaces, or special characters

Examples of valid names:

- `core`
- `file-utils`
- `window-manager`

Examples of invalid names:

- `MyPackage` (contains uppercase)
- `my_package` (contains underscore)
- `my package` (contains space)
