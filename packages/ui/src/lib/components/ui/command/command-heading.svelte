<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { cn } from '@raykit/ui'
  import { Command as CommandPrimitive } from 'bits-ui'

  type CommandHeadingProps = CommandPrimitive.InputProps & {
    prefix?: Snippet
    suffix?: Snippet
  }

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(''),
    prefix,
    suffix,
    ...restProps
  }: CommandHeadingProps = $props()
</script>

<div class='h-14 flex items-center border-b gap-2 px-4' data-slot='command-search-wrapper'>
  {@render prefix?.()}
  <CommandPrimitive.Input
    data-slot='command-input'
    class={cn(
      'placeholder:text-muted-foreground focus:outline-none flex h-5 w-0 flex-auto bg-transparent text-base disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    bind:ref
    {...restProps}
    bind:value
  />
  {@render suffix?.()}
</div>
