<script lang='ts'>
  import { cn } from '$lib/utils'
  import { Command as CommandPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CommandPrimitive.ListProps = $props()
</script>

<CommandPrimitive.List
  bind:ref
  data-slot='command-list'
  class={cn('flex-1 h-0 scroll-py-1 px-2 overflow-hidden', className)}
  {...restProps}
/>
