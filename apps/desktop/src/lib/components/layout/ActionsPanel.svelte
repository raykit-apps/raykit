<script lang='ts' module>
  import type { Snippet } from 'svelte'

  export interface Action {
    title: string
    icon?: string
    shortcut?: string
  }

  export interface Section {
    heading?: string
    actions: Action[]
  }

  export interface ActionsProps {
    child?: Snippet<[{ props: Record<string, unknown> }]>
    children?: Snippet
    align?: 'start' | 'center' | 'end'
    sections: Section[]
  }
</script>

<script lang='ts'>
  import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandViewport } from '$lib/components/ui/command'
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover'
  import { ScrollArea } from '$lib/components/ui/scroll-area'

  const { align = 'end', sections, ...restProps }: ActionsProps = $props()
</script>

<Popover>
  <PopoverTrigger {...restProps} />
  <PopoverContent {align} sideOffset={12} class='p-0 w-96 h-60 bg-actionsPanel-background electron-smooth'>
    <Command>
      <ScrollArea type='scroll' class='h-0 flex-1' scrollHideDelay={1800}>
        <CommandList>
          <CommandViewport>
            <CommandEmpty>No results found.</CommandEmpty>
            {#each sections as section, i}
              <CommandGroup class='p-2' heading={section.heading}>
                {#each section.actions as action}
                  <CommandItem class='h-9 p-2'>{action.title}</CommandItem>
                {/each}
              </CommandGroup>
              {#if i < sections.length - 1}
                <CommandSeparator class='bg-border' />
              {/if}
            {/each}
          </CommandViewport>
        </CommandList>
      </ScrollArea>
      <div class='h-10 px-4 box-content border-t flex items-center'>
        <CommandInput placeholder='Search...' />
      </div>
    </Command>
  </PopoverContent>
</Popover>
