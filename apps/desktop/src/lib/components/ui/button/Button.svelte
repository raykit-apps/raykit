<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils'
  import { Button } from 'bits-ui'

  let { ref = $bindable(null), class: className, children, kbdSlot, ...restProps }: Button.RootProps & {
    kbdSlot?: Snippet
  } = $props()
</script>

<Button.Root
  bind:ref
  data-slot='button'
  class={cn('h-7 py-1 pl-2 flex items-center justify-center gap-2.5 rounded-md hover:bg-gray-300 text-sm active:scale-[0.98] active:transition-all', kbdSlot ? 'pr-1' : 'pr-2', className)}
  {...restProps}
>
  {@render children?.()}
  {@render kbdSlot?.()}
</Button.Root>
