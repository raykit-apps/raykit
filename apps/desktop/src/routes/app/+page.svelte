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
    {
      command: 'raykit.store',
      title: 'Store',
      subtitle: 'Raykit',
      type: 'View',
    },
  ]

  const commands1: Commands[] = [
    {
      command: 'raykit.clipboard.copy',
      title: 'Clipboard History Copy',
      subtitle: 'Raykit',
      type: 'Command',
    },
    {
      command: 'raykit.openApplication.copy',
      title: 'VSCode Copy',
      subtitle: 'Raykit',
      type: 'Application',
    },
    {
      command: 'raykit.JsonFormat.copy',
      title: 'JSON Format Copy',
      subtitle: 'Raykit',
      type: 'View',
    },
    {
      command: 'raykit.store.copy',
      title: 'Store',
      subtitle: 'Raykit',
      type: 'View',
    },
  ]

  const onCommandSelect = () => {
    goto('/app/extension', { state: { command: '' } })
  }
</script>

<Command class='flex-1 outline-hidden' shouldFilter={false} loop disablePointerSelection>
  <CommandSearch placeholder='Type a command or search...' />
  <CommandPalette>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandSection
      heading='Suggestion'
      commands={commands}
      onCommandSelect={onCommandSelect}
    />
    <CommandSection
      heading='Commands'
      commands={commands1}
      onCommandSelect={onCommandSelect}
    />
  </CommandPalette>
</Command>
