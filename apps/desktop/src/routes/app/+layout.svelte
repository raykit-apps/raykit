<script lang='ts'>
  import { Command } from '$lib/components/command'

  const { children } = $props()
</script>

<div>
  <Command>
    {@render children()}
  </Command>
</div>
