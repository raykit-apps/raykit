<script lang='ts'>
  import type { Commands } from './typing'
  import { cn } from '$lib/utils'
  import { Command as CommandPrimitive, useId } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    heading,
    value,
    commands,
    onCommandSelect,
    ...restProps
  }: Omit<CommandPrimitive.GroupProps, 'children'> & {
    heading?: string
    commands: Commands[]
    onCommandSelect?: (command: Commands) => void
  } = $props()
</script>

<CommandPrimitive.Group
  bind:ref
  data-slot='command-group'
  class={cn('overflow-hidden', className)}
  value={value ?? heading ?? `----${useId()}`}
  {...restProps}
>
  {#if heading}
    <CommandPrimitive.GroupHeading
      class='pt-4 pb-2 py-2 text-xs font-semibold'
    >
      {heading}
    </CommandPrimitive.GroupHeading>
  {/if}
  <CommandPrimitive.GroupItems class='flex flex-col gap-1'>
    {#each commands as command}
      <CommandPrimitive.Item
        class='h-10 w-full flex gap-2.5 px-2 outline-hidden select-none data-[disabled]:pointer-events-none text-xs font-medium justify-center items-center rounded-md aria-selected:bg-amber-200 hover:bg-amber-50'
        onSelect={() => onCommandSelect?.(command)}
      >
        <img
          loading='lazy'
          src='/favicon.png'
          alt='Command Icon'
          width={20}
          height={20}
        />
        <div class='flex-1 w-0 flex gap-2.5 items-center'>
          <span>{command.title}</span>
          <span>{command.subtitle}</span>
        </div>
        <div>{command.type}</div>
      </CommandPrimitive.Item>
    {/each}
  </CommandPrimitive.GroupItems>
</CommandPrimitive.Group>
