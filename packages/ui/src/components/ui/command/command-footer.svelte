<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { cn } from '../../../lib/utils'

  const { class: className, prefix, suffix }: { class?: string, prefix?: Snippet, suffix?: Snippet } = $props()
</script>

<div class={cn('h-9 border-t flex items-center justify-between', className)} data-slot='command-footer-wrapper'>
  {@render prefix?.()}
  {@render suffix?.()}
</div>
