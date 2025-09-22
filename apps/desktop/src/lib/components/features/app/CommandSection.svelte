<script lang='ts' module>
  export interface Commands {
    command: string
    title: string
    subtitle?: string
    icon?: string
    type: string
  }
</script>

<script lang='ts'>
  import { CommandGroup, CommandItem } from '$lib/components/ui/command'
  import { Icon } from '$lib/components/ui/icon'

  interface CommandSectionProps {
    heading?: string
    commands: Commands[]
    onCommandSelect?: (command: Commands) => void
  }

  const {
    heading,
    commands,
    onCommandSelect,
  }: CommandSectionProps = $props()
</script>

<CommandGroup {heading} class='p-0' classHeading='p-2 pt-4'>
  {#each commands as command}
    <CommandItem class='px-2 py-0 h-10 gap-2.5' onSelect={() => onCommandSelect?.(command)}>
      <Icon />
      <div class='flex-1 w-0 flex gap-2.5 items-center'>
        <span>{command.title}</span>
        <span>{command.subtitle}</span>
      </div>
      <div>{command.type}</div>
    </CommandItem>
  {/each}
</CommandGroup>
