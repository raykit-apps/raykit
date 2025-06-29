<script lang='ts'>
  import * as Avatar from '@raykit/ui/avatar'
  import { Button } from '@raykit/ui/button'
  import * as Command from '@raykit/ui/command'

  interface CoustomFooterProps {
    info?: {
      logo: string
      name: string
    }
  }

  const { info }: CoustomFooterProps = $props()
</script>

<Command.Footer class='h-10 border px-3'>
  {#snippet prefix()}
    <div class='h-5 flex justify-center items-center gap-2'>
      <Avatar.Root class='size-5 rounded-sm'>
        <Avatar.AvatarImage src={info?.logo ?? '/favicon.png'} alt={`${info?.name} Logo`} />
        <Avatar.AvatarFallback>R</Avatar.AvatarFallback>
      </Avatar.Root>
      <span class='text-xs'>{info?.name ?? 'Raykit'}</span>
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
