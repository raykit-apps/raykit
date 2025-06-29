<script lang='ts'>
  import { ArrowLeft } from '@lucide/svelte'
  import { cn } from '@raykit/ui'
  import { Command as CommandPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(''),
    ...restProps
  }: CommandPrimitive.InputProps = $props()
</script>

<div class='h-14 flex items-center border-b gap-2 px-4' data-slot='command-search-wrapper'>
  <div class='size-6 rounded-md bg-border flex justify-center items-center'>
    <ArrowLeft class='size-4' />
  </div>
  <CommandPrimitive.Input
    data-slot='command-input'
    class={cn(
      'placeholder:text-muted-foreground focus:outline-none flex h-5 w-full bg-transparent text-base disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    bind:ref
    {...restProps}
    bind:value
  />
  <div></div>
</div>
