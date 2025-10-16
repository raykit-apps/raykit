<script lang='ts'>
  import { cn } from '$lib/utils'
  import { Command as CommandPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(''),
    ...restProps
  }: CommandPrimitive.InputProps = $props()
</script>

<CommandPrimitive.Input
  data-slot='command-input'
  class={cn(
    'outline-hidden flex w-full bg-transparent text-sm disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )}
  bind:ref
  {...restProps}
  bind:value
/>
