<script lang='ts'>
  import type { GroupItem } from '@raykit/ui'
  import { Command } from '@raykit/ui'

  const groups: GroupItem[] = [
    {
      heading: '最佳匹配',
      options: [
        {
          // command: 'raykit.settings',
          title: '设置',
          subtitle: 'Raykit',
          icon: '/favicon.png',
          shortcut: 'Command',
        },
        {
          // command: 'raykit.clipboard',
          title: '剪切板',
          subtitle: 'Raykit',
          icon: '/favicon.png',
          shortcut: 'Command',
        },
        {
          // command: 'raykit.calendar',
          title: '计算器',
          subtitle: 'Raykit',
          icon: '/favicon.png',
          shortcut: 'Command',
        },
      ],
    },
  ]
</script>

<Command.List class='max-h-full'>
  <Command.Empty>No results found.</Command.Empty>
  <Command.Groups groups={groups} />
</Command.List>
