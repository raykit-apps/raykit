<script lang='ts'>
  import { CustomFooter, CustomHeading } from '$lib/components/command'
  import * as Command from '@raykit/ui/command'

  const { children } = $props()
</script>

<Command.Root class='h-screen rounded-xl' shouldFilter={false} loop>
  <CustomHeading placeholder='欢迎使用Raykit' />
  <div class='flex-auto max-h-screen h-0'>
    {@render children()}
  </div>
  <CustomFooter />
</Command.Root>
