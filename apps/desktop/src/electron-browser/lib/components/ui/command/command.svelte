<script lang='ts'>
  import { cn } from '$lib/utils'
  import { Command as CommandPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    value = $bindable(''),
    class: className,
    ...restProps
  }: CommandPrimitive.RootProps = $props()
</script>

<CommandPrimitive.Root
  bind:value
  bind:ref
  data-slot='command'
  class={cn(
    'flex h-full w-full flex-col overflow-hidden',
    className,
  )}
  {...restProps}
/>
