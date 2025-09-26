<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { CommandList, CommandViewport } from '$lib/components/ui/command'
  import { ScrollArea } from '$lib/components/ui/scroll-area'

  interface CommandPaletteProps {
    children: Snippet
  }

  const { children }: CommandPaletteProps = $props()
</script>

<ScrollArea type='scroll' class='h-0 flex-1 bg-commands-background' scrollHideDelay={1800}>
  <CommandList class='px-2 outline-hidden'>
    <CommandViewport>
      {@render children()}
    </CommandViewport>
  </CommandList>
</ScrollArea>
