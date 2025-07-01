<script lang='ts'>
  import { Avatar, Button, Command, ScrollArea } from '@raykit/ui'

  const { children } = $props()
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
        <Button variant='ghost' class='h-7 p-1 pl-2'>
          菜单
          <div class='flex gap-[2px]'>
            <div class='h-5 w-6 flex items-center justify-center p-1 rounded-sm bg-border text-xs'>⌘</div>
            <div class='h-5 w-6 flex items-center justify-center p-1 rounded-sm bg-border text-xs'>K</div>
          </div>
        </Button>
      </div>
    {/snippet}
  </Command.Footer>
</Command.Root>
