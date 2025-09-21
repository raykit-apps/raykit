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
  class={cn('h-full scroll-py-1 overflow-hidden', className)}
  {...restProps}
/>
