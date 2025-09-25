<script lang='ts' module>
  import type { Snippet } from 'svelte'

  export interface ActionsCommands {

  }

  export interface ActionsProps {
    child?: Snippet<[{ props: Record<string, unknown> }]>
    children?: Snippet
    align?: 'start' | 'center' | 'end'
  // actionsCommands: ActionsCommands[]
  }
</script>

<script lang='ts'>
  import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '$lib/components/ui/command'
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover'

  const { align = 'end', ...restProps }: ActionsProps = $props()
</script>

<Popover>
  <PopoverTrigger {...restProps} />
  <PopoverContent {align} sideOffset={12} class='p-0 w-96 h-60 bg-actionsPanel-background electron-smooth'>
    <Command>
      <CommandList>
        <CommandGroup class='p-2'>
          <CommandItem class='h-9 p-2'>文字1</CommandItem>
          <CommandItem>文字2</CommandItem>
        </CommandGroup>
        <CommandSeparator class='bg-border' />
        <CommandGroup class='p-2'>
          <CommandItem>文字1</CommandItem>
          <CommandItem>文字2</CommandItem>
        </CommandGroup>
      </CommandList>
      <div class='h-10 px-4 box-content border-t flex items-center'>
        <CommandInput placeholder='Search...' />
      </div>
    </Command>
  </PopoverContent>
</Popover>
