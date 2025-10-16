<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  type CommandFooterProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, children, ...restProps }: CommandFooterProps = $props()
</script>

<kbd class={cn('h-5 w-6 flex items-center justify-center rounded-sm electron-smooth bg-kdb-background text-kdb-foreground text-xs [&_svg:not([class*="size-"])]:size-3', className)} {...restProps}>
  {@render children?.()}
</kbd>
