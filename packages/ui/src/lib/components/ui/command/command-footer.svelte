<script lang='ts' module>
  export interface CommandFooterProps {
    class?: string
    prefix?: Snippet
    suffix?: Snippet
  }
</script>

<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils.js'

  const { class: className, prefix, suffix }: CommandFooterProps = $props()
</script>

<div class={cn('h-9 border-t flex items-center justify-between', className)} data-slot='command-footer-wrapper'>
  {@render prefix?.()}
  {@render suffix?.()}
</div>
