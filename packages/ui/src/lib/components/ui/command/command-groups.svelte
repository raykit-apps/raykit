<script lang='ts' module>

  import { Command as CommandPrimitive, useId } from 'bits-ui'

  export interface CommandGroupItem {
    command: string
    icon?: string
    title: string
    subtitle: string
    shortcut?: string
  }

  export interface CommandGroupOption {
    heading?: string
    itemClass?: string
    options: CommandGroupItem[]
  }

  export interface CommandGroupsProps {
    layout?: 'list' | 'grid'
    groups: CommandGroupOption[]
    class?: string
    onclick?: () => {}
  }
</script>

<script lang='ts'>
  import * as Avatar from '$lib/components/ui/avatar/index.js'
  import { cn } from '$lib/utils.js'

  const { layout = 'list', groups, onclick, class: className }: CommandGroupsProps = $props()
</script>

{#each groups as group (group)}
  <CommandPrimitive.Group
    data-slot='command-group'
    class={cn('text-foreground overflow-hidden', className)}
    value={group.heading ?? `----${useId()}`}
  >
    {#if group.heading}
      <CommandPrimitive.GroupHeading
        class='text-muted-foreground p-2 pt-4 text-xs font-medium'
      >
        {group.heading}
      </CommandPrimitive.GroupHeading>
    {/if}
    {#if layout === 'list'}
      <CommandPrimitive.GroupItems>
        {#each group.options as option (option.command)}
          <CommandPrimitive.Item class={cn('h-10 rounded-lg gap-3 aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center px-2 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0', group.itemClass)} {onclick}>
            <Avatar.Root class='size-5 rounded-sm'>
              <Avatar.AvatarImage src={option.icon ?? '/favicon.png'} alt={`${option.title} Logo`} />
              <Avatar.AvatarFallback>Logo</Avatar.AvatarFallback>
            </Avatar.Root>
            <div class='flex-auto flex items-center gap-3 text-sm'>
              <span>{option.title}</span>
              <span class='text-muted-foreground'>{option.subtitle}</span>
            </div>
            <div class='text-sm text-muted-foreground'>{option.shortcut}</div>
          </CommandPrimitive.Item>
        {/each}
      </CommandPrimitive.GroupItems>
    {:else if layout === 'grid'}
      <CommandPrimitive.GroupItems class='flex flex-wrap gap-2'>
        {#each group.options as option (option.command)}
          <CommandPrimitive.Item class={cn('size-20 rounded-lg aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0', group.itemClass)} {onclick}>{option.title}</CommandPrimitive.Item>
        {/each}
      </CommandPrimitive.GroupItems>
    {/if}
  </CommandPrimitive.Group>
{/each}
