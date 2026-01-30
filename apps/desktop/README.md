# Raykit Desktop Demo

This is a demo application to showcase the Raykit CLI functionality.

## Features

- **build**: Production build with support for main, preload, and renderer processes
- **dev**: Development server with hot reload and multi-renderer support
- **preview**: Preview production build with static server

## Commands

```bash
# Development mode
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
apps/desktop/
├── src/
│   ├── main/           # Main process
│   │   └── index.ts
│   ├── preload/        # Preload scripts
│   │   └── index.ts
│   └── browser/        # Renderer process
│       └── index.html
├── out/                # Build output
│   ├── main/
│   ├── preload/
│   └── renderer/
├── package.json
└── raykit.config.ts
```

## Configuration

See `raykit.config.ts` for the CLI configuration.
