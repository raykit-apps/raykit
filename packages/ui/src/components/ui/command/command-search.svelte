<script lang='ts'>
  import { Command as CommandPrimitive } from 'bits-ui'
  import { cn } from '../../../lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(''),
    ...restProps
  }: CommandPrimitive.InputProps = $props()
</script>

<div class='flex items-center gap-2 border-b px-4 py-4' data-slot='command-search-wrapper'>
  <CommandPrimitive.Input
    data-slot='command-input'
    class={cn(
      'placeholder:text-muted-foreground focus:outline-none flex h-6 w-full bg-transparent text-xl disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    bind:ref
    {...restProps}
    bind:value
  />
</div>
