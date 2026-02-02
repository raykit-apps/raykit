# @raykit/commands

Command system for Raykit applications. Provides a unified command registration, discovery, and execution system that supports modular architecture.

## Features

- **Command Registration**: Register commands with metadata (label, category, icon)
- **Command Handlers**: Support for multiple handlers per command with lifecycle methods
- **Command Registry**: Central registry for command lookup and execution
- **Browser Integration**: Seamless integration with `@raykit/core` browser application lifecycle
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

The package is part of the workspace and should be added as a dependency:

```json
{
  "dependencies": {
    "@raykit/commands": "workspace:*"
  }
}
```

## Quick Start

### 1. Import the Module

```typescript
import { browserCommandModule } from '@raykit/commands'
```

### 2. Add to Your Container

```typescript
import { Container } from 'inversify'

const container = new Container()
container.load(browserCommandModule)
```

### 3. Create a Command Contribution

```typescript
import { Command, CommandContribution, ICommandRegistry } from '@raykit/commands'
import { injectable } from 'inversify'

@injectable()
export class MyCommandContribution implements CommandContribution {
  registerCommands(registry: ICommandRegistry): void {
    // Register a command
    const openFileCommand: Command = {
      id: 'file.open',
      label: 'Open File',
      category: 'File',
    }

    registry.registerCommand(openFileCommand, {
      execute: (filePath: string) => {
        console.log(`Opening file: ${filePath}`)
        // Your implementation here
      },
      isEnabled: () => true,
    })
  }
}
```

### 4. Execute Commands

```typescript
import { CommandRegistry, ICommandRegistry } from '@raykit/commands'

// Get the registry from the container
const registry = container.get<ICommandRegistry>(CommandRegistry)

// Execute a command
const result = await registry.executeCommand('file.open', '/path/to/file.txt')
```

## API Reference

### Command Interface

```typescript
interface Command {
  id: string // Unique identifier
  label?: string // Human-readable label
  category?: string // Category for grouping
  iconClass?: string // CSS class for icon
}
```

### CommandHandler Interface

```typescript
interface CommandHandler<T = unknown> {
  execute: (...args: unknown[]) => MaybePromise<T>
  isEnabled?: () => boolean
  isVisible?: () => boolean
  isToggled?: () => boolean
}
```

### CommandRegistry Methods

- `registerCommand(command, handler)` - Register a command with its handler
- `registerHandler(commandId, handler)` - Add an additional handler to an existing command
- `executeCommand(commandId, ...args)` - Execute a command by ID
- `getCommand(commandId)` - Get a command definition by ID
- `getAllCommands()` - Get all registered commands
- `isEnabled(commandId)` - Check if a command is enabled
- `isVisible(commandId)` - Check if a command is visible

### Events

- `onWillExecuteCommand` - Fired before a command is executed
- `onDidExecuteCommand` - Fired after a command is executed (success or failure)

## Integration with @raykit/core

The command system integrates with the `@raykit/core` browser application lifecycle through `BrowserCommandContribution`. This contribution:

1. Loads during the `configure()` phase of the browser application
2. Collects all `CommandContribution` implementations
3. Invokes `registerCommands()` on each contribution

## License

MIT
