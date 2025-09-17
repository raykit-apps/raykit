<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  type CommandFooterProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: CommandFooterProps = $props()

</script>

<header data-slot='extension-header' class={cn('h-14 px-4 flex border-b', className)} {...restProps}>
  <div></div>
</header>
