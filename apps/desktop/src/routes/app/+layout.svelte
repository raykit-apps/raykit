<script lang='ts'>
  import type { ActionPanelGroupOption } from '@raykit/ui'
  import { ActionPanel, Avatar, Button, Command, ScrollArea } from '@raykit/ui'

  const { children } = $props()

  const groups: ActionPanelGroupOption[] = [
    {
      options: [
        {
          command: 'raykit.settings',
          title: '设置',
          icon: '/favicon.png',
          shortcut: 'Command',
        },
      ],
    },
    {
      options: [
        {
          command: 'raykit.share',
          title: '共享',
          icon: '/favicon.png',
          shortcut: 'Command',
        },
        {
          command: 'raykit.clipboard',
          title: '复制',
          icon: '/favicon.png',
          shortcut: 'Command',
        },
      ],
    },
  ]
</script>

<Command.Root class='h-screen rounded-xl' shouldFilter={false} loop>
  <Command.Heading placeholder='欢迎使用Raykit' />
  <ScrollArea class='h-0 flex-auto max-h-screen'>
    <div class='px-2'>
      {@render children()}
    </div>
  </ScrollArea>
  <Command.Footer>
    {#snippet prefix()}
      <div class='h-5 flex justify-center items-center gap-2'>
        <Avatar.Root class='size-5 rounded-sm'>
          <Avatar.AvatarImage src='/favicon.png' alt='Raykit Logo' />
          <Avatar.AvatarFallback>R</Avatar.AvatarFallback>
        </Avatar.Root>
        <span class='text-xs'>Raykit</span>
      </div>
    {/snippet}
    {#snippet suffix()}
      <div class='h-7 flex gap-3 items-center'>
        <Button variant='ghost' class='h-7 p-1 pl-2'>
          进入功能
          <div class='flex gap-[2px]'>
            <div class='h-5 w-6 flex items-center justify-center p-1 rounded-sm bg-border text-xs'>↵</div>
          </div>
        </Button>
        <div class='w-[2px] h-3 rounded-sm bg-border'></div>
        <ActionPanel groups={groups}>
          <Button variant='ghost' class='h-7 p-1 pl-2'>
            菜单
            <div class='flex gap-[2px]'>
              <div class='h-5 w-6 flex items-center justify-center p-1 rounded-sm bg-border text-xs'>⌘</div>
              <div class='h-5 w-6 flex items-center justify-center p-1 rounded-sm bg-border text-xs'>K</div>
            </div>
          </Button>
        </ActionPanel>
      </div>
    {/snippet}
  </Command.Footer>
</Command.Root>
