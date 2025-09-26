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
  import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandViewport } from '$lib/components/ui/command'
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover'
  import { ScrollArea } from '$lib/components/ui/scroll-area'

  const { align = 'end', ...restProps }: ActionsProps = $props()
</script>

<Popover>
  <PopoverTrigger {...restProps} />
  <PopoverContent {align} sideOffset={12} class='p-0 w-96 h-60 bg-actionsPanel-background electron-smooth'>
    <Command>
      <ScrollArea type='scroll' class='h-0 flex-1' scrollHideDelay={1800}>
        <CommandList>
          <CommandViewport>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup class='p-2'>
              <CommandItem class='h-9 p-2'>文字1</CommandItem>
              <CommandItem>文字2</CommandItem>
              <CommandItem>文字3</CommandItem>
              <CommandItem>文字4</CommandItem>
            </CommandGroup>
            <CommandSeparator class='bg-border' />
            <CommandGroup class='p-2'>
              <CommandItem>文字1</CommandItem>
              <CommandItem>文字2</CommandItem>
            </CommandGroup>
          </CommandViewport>
        </CommandList>
      </ScrollArea>
      <div class='h-10 px-4 box-content border-t flex items-center'>
        <CommandInput placeholder='Search...' />
      </div>
    </Command>
  </PopoverContent>
</Popover>
