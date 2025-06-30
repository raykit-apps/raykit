<script lang='ts'>
  import { CustomFooter, CustomHeading } from '$lib/components/command'
  import { Command, ScrollArea } from '@raykit/ui'

  const { children } = $props()
</script>

<Command.Root class='h-screen rounded-xl' shouldFilter={false} loop>
  <CustomHeading placeholder='欢迎使用Raykit' />
  <ScrollArea class='h-0 flex-auto max-h-screen'>
    <div class='px-2'>
      {@render children()}
    </div>
  </ScrollArea>
  <CustomFooter />
</Command.Root>
