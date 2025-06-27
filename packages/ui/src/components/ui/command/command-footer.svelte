<script lang='ts'>
  import { cn } from '../../../lib/utils'

  const { class: className }: { class?: string } = $props()
</script>

<div class={cn('h-10 px-3 py-2 border-t', className)} data-slot='command-footer-wrapper'></div>
