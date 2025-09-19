<script lang='ts'>
  import type { Commands } from '$lib/components/ui/command'
  import { goto } from '$app/navigation'
  import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '$lib/components/ui/command'
  import { onMount } from 'svelte'

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

  const input = $state<HTMLInputElement>()

  onMount(() => {
    input?.focus()
  })

  const onCommandSelect = () => {
    goto('/app/extension', { state: { command: '' } })
  }
</script>

<Command class='flex-1' shouldFilter={false} loop disablePointerSelection>
  <CommandInput ref={input} placeholder='Type a command or search...' />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading='Suggestion' commands={commands} onCommandSelect={onCommandSelect} />
  </CommandList>
</Command>
