<script lang='ts'>
  import { CustomFooter, CustomHeading } from '$lib/components/command'
  import * as Command from '@raykit/ui/command'
  import { ScrollArea } from '@raykit/ui/scroll-area'

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
