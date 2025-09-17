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
<div class='h-14 items-center border-b px-4' data-slot='command-input-wrapper'>
  <CommandPrimitive.Input
    data-slot='command-input'
    class={cn(
      'placeholder:text-muted-foreground outline-hidden flex h-10 w-full rounded-md bg-transparent py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    bind:ref
    {...restProps}
    bind:value
  />
</div>
