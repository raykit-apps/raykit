<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'
  import { Command, CornerDownLeft } from '@lucide/svelte'
  import { Avatar } from 'bits-ui'
  import { Button } from '../ui/button'
  import { KbdGroup, KbdItem } from '../ui/kbd'

  type CommandFooterProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: CommandFooterProps = $props()
</script>

<footer data-slot='layout-footer' class={cn('h-10 px-2 flex border-t justify-between items-center', className)} {...restProps}>
  <Button>
    <Avatar.Root class='rounded-xl'>
      <Avatar.Image
        width={18}
        height={18}
        src='/favicon.png'
        alt='Raykit Logo'
      />
    </Avatar.Root>
    Raykit
  </Button>
  <div class='flex gap-3 items-center'>
    <Button>
      Open Command
      {#snippet kbdSlot()}
        <KbdItem>
          <CornerDownLeft />
        </KbdItem>
      {/snippet}
    </Button>
    <div class='h-3 w-0.5 rounded-xs bg-gray-300'></div>
    <Button>
      Actions
      {#snippet kbdSlot()}
        <KbdGroup>
          <KbdItem>
            <Command />
          </KbdItem>
          <KbdItem>K</KbdItem>
        </KbdGroup>
      {/snippet}
    </Button>
  </div>
</footer>
