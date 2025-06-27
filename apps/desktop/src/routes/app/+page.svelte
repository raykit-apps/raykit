<script lang='ts'>
  import { goto } from '$app/navigation'
  import * as Command from '@raykit/ui/command'
</script>

<Command.List class='max-h-full'>
  <Command.Empty>No results found.</Command.Empty>
  <Command.Group heading='最佳匹配' class='p-2'>
    <Command.Item class='h-10 rounded-lg' onclick={() => goto('app/extension/grid')}>Grid模版</Command.Item>
    <Command.Item class='h-10 rounded-lg' onclick={() => goto('app/extension/list')}>List模版</Command.Item>
    <Command.Item class='h-10 rounded-lg' onclick={() => goto('app/extension/black')}>空白模版</Command.Item>
  </Command.Group>
  <Command.Group heading='推荐搜索' class='p-2'>
    <Command.Item class='h-10 rounded-lg'>Test4</Command.Item>
    <Command.Item class='h-10 rounded-lg'>Test5</Command.Item>
    <Command.Item class='h-10 rounded-lg'>Test6</Command.Item>
    <Command.Item class='h-10 rounded-lg'>Test7</Command.Item>
    <Command.Item class='h-10 rounded-lg'>Test8</Command.Item>
    <Command.Item class='h-10 rounded-lg'>Test9</Command.Item>
  </Command.Group>
</Command.List>
