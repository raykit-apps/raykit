<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'
  import { Command, CornerDownLeft } from '@lucide/svelte'
  import { Avatar } from 'bits-ui'
  import { Button } from '../ui/button'
  import { KbdGroup, KbdItem } from '../ui/kbd'
  import ActionsPanel from './ActionsPanel.svelte'

  type ActionsBarProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: ActionsBarProps = $props()

  const sections = [
    {
      actions: [
        { title: '执行命令' },
      ],
    },
    {
      actions: [
        { title: '分离窗口' },
      ],
    },
  ]
</script>

<footer data-slot='cations-bar' class={cn('h-10 bg-actionsBar-background px-2 flex border-t border-actionsBar-border box-content justify-between items-center', className)} {...restProps}>
  <ActionsPanel align='start' sections={sections}>
    {#snippet child({ props })}
      <Button variant='ghost' {...props} class='h-7 p-2 text-[13px]/4'>
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
    {/snippet}
  </ActionsPanel>
  <div class='flex gap-3 items-center'>
    <Button variant='ghost' class='h-7 py-1 pl-2 pr-1 text-[13px]/4'>
      Open Command
      <KbdItem>
        <CornerDownLeft />
      </KbdItem>
    </Button>
    <div class='h-3 w-0.5 rounded-xs bg-actionsBar-border'></div>
    <ActionsPanel sections={sections}>
      {#snippet child({ props })}
        <Button variant='ghost' {...props} class='h-7 py-1 pl-2 pr-1 text-[13px]/4'>
          Actions
          <KbdGroup>
            <KbdItem>
              <Command />
            </KbdItem>
            <KbdItem>K</KbdItem>
          </KbdGroup>
        </Button>
      {/snippet}
    </ActionsPanel>
  </div>
</footer>
