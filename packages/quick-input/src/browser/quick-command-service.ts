import { CommandRegistry } from '@raykit/commands'
import { inject, injectable } from 'inversify'

@injectable()
export class QuickCommandService {
  constructor(
    @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry,
  ) {}
}
