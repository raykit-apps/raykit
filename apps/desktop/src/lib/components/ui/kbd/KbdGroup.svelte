<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  type CommandFooterProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, children, ...restProps }: CommandFooterProps = $props()
</script>

<div class={cn('flex gap-0.5', className)} {...restProps}>
  {@render children?.()}
</div>
