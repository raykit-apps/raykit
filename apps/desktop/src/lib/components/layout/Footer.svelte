<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  type CommandFooterProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: CommandFooterProps = $props()
</script>

<footer data-slot='layout-footer' class={cn('h-10 px-3 flex border-t justify-between', className)} {...restProps}>
  <div></div>
  <div></div>
</footer>
