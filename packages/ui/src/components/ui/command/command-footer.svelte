<script lang='ts'>
  import { Snippet } from 'svelte'
  import { cn } from '../../../lib/utils'

  const { class: className, prefix, suffix }: { class?: string, prefix?: Snippet, suffix?: Snippet } = $props()
</script>

<div class={cn('h-10 px-3 py-2 border-t flex justify-between', className)} data-slot='command-footer-wrapper'>
  {@render prefix?.()}
  {@render suffix?.()}
</div>
