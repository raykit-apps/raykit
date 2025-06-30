<script lang='ts'>
  import type { CustomGroupOptions } from '$lib/components/command'
  import { CustomGroup } from '$lib/components/command'
  import * as Command from '@raykit/ui/command'

  const suggestionsOptions: CustomGroupOptions[] = [
    {
      command: 'raykit.settings',
      title: '设置',
      subtitle: 'Raykit',
      icon: '/favicon.png',
      shortcut: 'Command',
    },
    {
      command: 'raykit.clipboard',
      title: '剪切板',
      subtitle: 'Raykit',
      icon: '/favicon.png',
      shortcut: 'Command',
    },
    {
      command: 'raykit.calendar',
      title: '计算器',
      subtitle: 'Raykit',
      icon: '/favicon.png',
      shortcut: 'Command',
    },
  ]

  const commandsOptions = [
    {
      command: 'raykit.open',
      title: '百度搜索',
      subtitle: 'Raykit',
      icon: '/favicon.png',
      shortcut: 'Command',
    },
    {
      command: 'raykit.bing',
      title: '谷歌搜索',
      subtitle: 'Raykit',
      icon: '/favicon.png',
      shortcut: 'Command',
    },
    {
      command: 'raykit.vscode',
      title: '打开vscode',
      subtitle: 'Raykit',
      icon: '/favicon.png',
      shortcut: 'Command',
    },
  ]
</script>

<Command.List class='max-h-full'>
  <Command.Empty>No results found.</Command.Empty>
  <CustomGroup heading='最佳匹配' options={suggestionsOptions} />
  <CustomGroup heading='命令' options={commandsOptions} />
</Command.List>
