<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'
  import { Command, CornerDownLeft } from '@lucide/svelte'
  import { Avatar } from 'bits-ui'
  import { Button } from '../ui/button'
  import { KbdGroup, KbdItem } from '../ui/kbd'

  type ActionsBarProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: ActionsBarProps = $props()
</script>

<footer data-slot='cations-bar' class={cn('h-10 px-2 flex border-t box-content justify-between items-center', className)} {...restProps}>
  <Button variant='ghost' class='h-7 p-2 text-[13px]/4'>
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
    <Button variant='ghost' class='h-7 py-1 pl-2 pr-1 text-[13px]/4'>
      Open Command
      <KbdItem>
        <CornerDownLeft />
      </KbdItem>
    </Button>
    <div class='h-3 w-0.5 rounded-xs bg-gray-300'></div>
    <Button variant='ghost' class='h-7 py-1 pl-2 pr-1 text-[13px]/4'>
      Actions
      <KbdGroup>
        <KbdItem>
          <Command />
        </KbdItem>
        <KbdItem>K</KbdItem>
      </KbdGroup>
    </Button>
  </div>
</footer>
