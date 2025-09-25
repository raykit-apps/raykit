<script lang='ts'>
  import { cn } from '$lib/utils'
  import { Command as CommandPrimitive, useId } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    children,
    heading,
    classHeading,
    classItems,
    value,
    ...restProps
  }: CommandPrimitive.GroupProps & {
    heading?: string
    classHeading?: string
    classItems?: string
  } = $props()
</script>

<CommandPrimitive.Group
  bind:ref
  data-slot='command-group'
  class={cn('p-1', className)}
  value={value ?? heading ?? `----${useId()}`}
  {...restProps}
>
  {#if heading}
    <CommandPrimitive.GroupHeading
      class={cn('px-2 py-1.5 text-xs font-medium', classHeading)}
    >
      {heading}
    </CommandPrimitive.GroupHeading>
  {/if}
  <CommandPrimitive.GroupItems class={classItems} {children} />
</CommandPrimitive.Group>
