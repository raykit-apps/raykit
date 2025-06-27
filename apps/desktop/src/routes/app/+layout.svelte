<script lang='ts'>
  import * as Command from '@raykit/ui/command'

  const { children } = $props()
</script>

<Command.Root class='h-screen bg-none' shouldFilter={false} loop>
  <!-- <Command.Search placeholder='欢迎使用 Raykit ！' /> -->
  <div class='flex-auto max-h-screen'>
    {@render children()}
  </div>
  <!-- <Command.Footer /> -->
</Command.Root>
