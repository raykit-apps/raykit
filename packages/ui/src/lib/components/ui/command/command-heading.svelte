<script lang='ts' module>
  import { Command as CommandPrimitive } from 'bits-ui'

  export interface CommandHeadingProps extends CommandPrimitive.InputProps {
    showBackBtn?: boolean
  }
</script>

<script lang='ts'>
  import ArrowLeft from '@lucide/svelte/icons/arrow-left'
  import { cn } from '@raykit/ui'

  let {
    ref = $bindable(null),
    showBackBtn = false,
    class: className,
    value = $bindable(''),
    ...restProps
  }: CommandHeadingProps = $props()
</script>

<div class='h-14 flex items-center border-b gap-2 px-4' data-slot='command-search-wrapper'>
  {#if showBackBtn}
    <div class='size-6 rounded-md bg-border flex justify-center items-center'>
      <ArrowLeft class='size-4' />
    </div>
  {/if}
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
  <div></div>
</div>
