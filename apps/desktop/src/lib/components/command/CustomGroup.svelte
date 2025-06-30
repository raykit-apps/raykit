<script lang='ts'>
  import { goto } from '$app/navigation'
  import { Avatar, Command } from '@raykit/ui'

  export interface CustomGroupOptions {
    command: string
    title: string
    subtitle: string
    icon: string
    shortcut: string
  }

  export interface CustomGroupProps {
    heading: string
    options: CustomGroupOptions[]
  }

  const { heading, options }: CustomGroupProps = $props()

</script>

{#if options.length > 0}
  <Command.Group heading={heading} class='p-0 pt-2'>
    {#each options as option (option.command)}
      <Command.Item class='h-10 rounded-lg py-0 gap-3' onclick={() => goto('app/extension/grid')}>
        <Avatar.Root class='size-5 rounded-sm'>
          <Avatar.AvatarImage src={option.icon ?? '/favicon.png'} alt={`${option.title} Logo`} />
          <Avatar.AvatarFallback>Logo</Avatar.AvatarFallback>
        </Avatar.Root>
        <div class='flex-auto flex items-center gap-3 text-sm'>
          <span>{option.title}</span>
          <span class='text-muted-foreground'>{option.subtitle}</span>
        </div>
        <Command.Shortcut class='m-0 text-sm tracking-normal'>{option.shortcut}</Command.Shortcut>
      </Command.Item>
    {/each}
  </Command.Group>
{/if}
