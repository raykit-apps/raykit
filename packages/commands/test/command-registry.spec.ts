import type { Command } from '../src/common/command'
import type { CommandHandler } from '../src/common/command-handler'
import { describe, expect, it, vi } from 'vitest'
import { CommandRegistryImpl } from '../src/common/command-registry'

describe('commandRegistry', () => {
  describe('command Registration', () => {
    it('should register a command with a handler', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = { execute: () => 'result' }

      registry.registerCommand(command, handler)

      const retrieved = registry.getCommand('test.command')
      expect(retrieved).toEqual(command)
    })

    it('should register a handler by command ID', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler1: CommandHandler = { execute: () => 'result1' }
      const handler2: CommandHandler = { execute: () => 'result2' }

      registry.registerCommand(command, handler1)
      registry.registerHandler('test.command', handler2)

      // Should not throw and be able to execute
      expect(registry.isEnabled('test.command')).toBe(true)
    })

    it('should not allow duplicate command registration', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = { execute: () => 'result' }

      registry.registerCommand(command, handler)

      // Second registration should warn but not throw
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      registry.registerCommand(command, handler)
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('command Lookup', () => {
    it('should get a command by ID', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command', label: 'Test Command' }

      registry.registerCommand(command, { execute: () => {} })

      const retrieved = registry.getCommand('test.command')
      expect(retrieved).toEqual(command)
    })

    it('should return undefined for non-existent command', () => {
      const registry = new CommandRegistryImpl()

      const retrieved = registry.getCommand('nonexistent.command')
      expect(retrieved).toBeUndefined()
    })

    it('should get all registered commands', () => {
      const registry = new CommandRegistryImpl()
      const command1: Command = { id: 'test.command1' }
      const command2: Command = { id: 'test.command2' }

      registry.registerCommand(command1, { execute: () => {} })
      registry.registerCommand(command2, { execute: () => {} })

      const allCommands = registry.getAllCommands()
      expect(allCommands).toHaveLength(2)
      expect(allCommands).toContainEqual(command1)
      expect(allCommands).toContainEqual(command2)
    })
  })

  describe('command Execution', () => {
    it('should execute a command successfully', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler<string> = {
        execute: () => 'success',
      }

      registry.registerCommand(command, handler)

      const result = await registry.executeCommand<string>('test.command')
      expect(result).toBe('success')
    })

    it('should execute a command with arguments', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler<string> = {
        execute: (arg1: unknown, arg2: unknown) => `${arg1}-${arg2}`,
      }

      registry.registerCommand(command, handler)

      const result = await registry.executeCommand<string>('test.command', 'hello', 'world')
      expect(result).toBe('hello-world')
    })

    it('should throw error for non-existent command', async () => {
      const registry = new CommandRegistryImpl()

      await expect(registry.executeCommand('nonexistent.command'))
        .rejects
        .toThrow('Command nonexistent.command not found.')
    })

    it('should throw error when no active handler is available', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
        isEnabled: () => false,
      }

      registry.registerCommand(command, handler)

      await expect(registry.executeCommand('test.command'))
        .rejects
        .toThrow('No active handler found for command test.command.')
    })

    it('should use first enabled handler when multiple handlers exist', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler1: CommandHandler = {
        execute: () => 'first',
        isEnabled: () => false,
      }
      const handler2: CommandHandler = {
        execute: () => 'second',
        isEnabled: () => true,
      }
      const handler3: CommandHandler = {
        execute: () => 'third',
        isEnabled: () => true,
      }

      registry.registerCommand(command, handler1)
      registry.registerHandler('test.command', handler2)
      registry.registerHandler('test.command', handler3)

      const result = await registry.executeCommand<string>('test.command')
      expect(result).toBe('second')
    })
  })

  describe('command Lifecycle', () => {
    it('should emit will-execute event', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = { execute: () => 'result' }

      registry.registerCommand(command, handler)

      const eventPromise = new Promise<unknown>((resolve) => {
        registry.onWillExecuteCommand((event) => {
          resolve(event)
        })
      })

      await registry.executeCommand('test.command', 'arg1', 'arg2')

      const event = await eventPromise
      expect(event).toEqual({
        commandId: 'test.command',
        args: ['arg1', 'arg2'],
      })
    })

    it('should emit did-execute event on success', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = { execute: () => 'success-result' }

      registry.registerCommand(command, handler)

      const eventPromise = new Promise<unknown>((resolve) => {
        registry.onDidExecuteCommand((event) => {
          resolve(event)
        })
      })

      await registry.executeCommand('test.command')

      const event = await eventPromise
      expect(event).toEqual({
        commandId: 'test.command',
        args: [],
        result: 'success-result',
      })
    })

    it('should emit did-execute event on failure', async () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const error = new Error('execution failed')
      const handler: CommandHandler = {
        execute: () => {
          throw error
        },
      }

      registry.registerCommand(command, handler)

      const eventPromise = new Promise<unknown>((resolve) => {
        registry.onDidExecuteCommand((event) => {
          resolve(event)
        })
      })

      await expect(registry.executeCommand('test.command')).rejects.toThrow('execution failed')

      const event = await eventPromise
      expect(event).toEqual({
        commandId: 'test.command',
        args: [],
        result: error,
      })
    })
  })

  describe('command State', () => {
    it('should report enabled when handler is enabled', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
        isEnabled: () => true,
      }

      registry.registerCommand(command, handler)

      expect(registry.isEnabled('test.command')).toBe(true)
    })

    it('should report disabled when handler is disabled', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
        isEnabled: () => false,
      }

      registry.registerCommand(command, handler)

      expect(registry.isEnabled('test.command')).toBe(false)
    })

    it('should report enabled when no isEnabled method exists', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
      }

      registry.registerCommand(command, handler)

      expect(registry.isEnabled('test.command')).toBe(true)
    })

    it('should report visible when handler is visible', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
        isVisible: () => true,
      }

      registry.registerCommand(command, handler)

      expect(registry.isVisible('test.command')).toBe(true)
    })

    it('should report not visible when handler is not visible', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
        isVisible: () => false,
      }

      registry.registerCommand(command, handler)

      expect(registry.isVisible('test.command')).toBe(false)
    })

    it('should report visible when no isVisible method exists', () => {
      const registry = new CommandRegistryImpl()
      const command: Command = { id: 'test.command' }
      const handler: CommandHandler = {
        execute: () => 'result',
      }

      registry.registerCommand(command, handler)

      expect(registry.isVisible('test.command')).toBe(true)
    })
  })
})
