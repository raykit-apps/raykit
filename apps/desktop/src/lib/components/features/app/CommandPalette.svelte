<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { CommandList } from '$lib/components/ui/command'

  interface CommandPaletteProps {
    children: Snippet
  }

  const { children }: CommandPaletteProps = $props()
</script>

<CommandList class='px-2 bg-commands-background outline-hidden'>
  {@render children()}
</CommandList>
