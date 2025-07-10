<script lang='ts'>
  import type { Snippet } from 'svelte'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'

  interface ActionPanelProps {
    children: Snippet<[]>
  }

  const { children }: ActionPanelProps = $props()
</script>

<Popover.Root>
  <Popover.Trigger>
    {@render children()}
  </Popover.Trigger>
  <Popover.Content>
    <Command.Root class='rounded-lg border shadow-md md:min-w-[450px]'>
      <Command.Input placeholder='Type a command or search...' />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading='Suggestions'>
          <Command.Item>
            <span>Calendar</span>
          </Command.Item>
          <Command.Item>
            <span>Search Emoji</span>
          </Command.Item>
          <Command.Item disabled>
            <span>Calculator</span>
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading='Settings'>
          <Command.Item>
            <span>Profile</span>
            <Command.Shortcut>⌘P</Command.Shortcut>
          </Command.Item>
          <Command.Item>
            <span>Billing</span>
            <Command.Shortcut>⌘B</Command.Shortcut>
          </Command.Item>
          <Command.Item>
            <span>Settings</span>
            <Command.Shortcut>⌘S</Command.Shortcut>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
