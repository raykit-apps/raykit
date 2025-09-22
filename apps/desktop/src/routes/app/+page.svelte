<script lang='ts'>
  import type { Commands } from '$lib/components/features/app'
  import { goto } from '$app/navigation'
  import { CommandPalette, CommandSearch, CommandSection } from '$lib/components/features/app'
  import { Command, CommandEmpty } from '$lib/components/ui/command'

  const commands: Commands[] = [
    {
      command: 'raykit.clipboard',
      title: 'Clipboard History',
      subtitle: 'Raykit',
      type: 'Command',
    },
    {
      command: 'raykit.openApplication',
      title: 'VSCode',
      subtitle: 'Raykit',
      type: 'Application',
    },
    {
      command: 'raykit.JsonFormat',
      title: 'JSON Format',
      subtitle: 'Raykit',
      type: 'View',
    },
  ]

  const onCommandSelect = () => {
    goto('/app/extension', { state: { command: '' } })
  }
</script>

<Command class='flex-1' shouldFilter={false} loop disablePointerSelection>
  <CommandSearch placeholder='Type a command or search...' />
  <CommandPalette>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandSection
      heading='Suggestion'
      commands={commands}
      onCommandSelect={onCommandSelect}
    />
  </CommandPalette>
</Command>
