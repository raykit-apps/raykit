<script lang='ts' module>
  import { Command as CommandPrimitive } from 'bits-ui'

  export interface ActionPanelGroupItem {
    command: string
    icon?: string
    title: string
    shortcut?: string
  }

  export interface ActionPanelGroupOption {
    itemClass?: string
    options: ActionPanelGroupItem[]
  }

  export type ActionPanelProps = CommandPrimitive.InputProps & {
    groups: ActionPanelGroupOption[]
    children: Snippet<[]>
  }
</script>

<script lang='ts'>
  import type { Snippet } from 'svelte'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { cn } from '$lib/utils.js'

  const { children, groups, ...restProps }: ActionPanelProps = $props()
</script>

<Popover.Root>
  <Popover.Trigger>
    {@render children()}
  </Popover.Trigger>
  <Popover.Content align='end' sideOffset={12}>
    <Command.Root class='rounded-lg border md:min-w-[450px]'>
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {#each groups as group (group)}
          <Command.Group class='p-2'>
            {#each group.options as option (option.command)}
              <Command.Item class={cn('h-9', group.itemClass)}>
                <div class='flex-auto flex items-center gap-3 text-sm'>
                  <span>{option.title}</span>
                </div>
                <div class='text-sm text-muted-foreground'>{option.shortcut}</div>
              </Command.Item>
            {/each}
          </Command.Group>
          <Command.Separator />
        {/each}
      </Command.List>
      <Command.Input placeholder='Search...' {...restProps} />
    </Command.Root>
  </Popover.Content>
</Popover.Root>
