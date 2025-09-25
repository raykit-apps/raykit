<script lang='ts'>
  import { CommandInput } from '$lib/components/ui/command'
  import { onMount } from 'svelte'

  interface CommandSearchProps {
    placeholder?: string
  }

  const { placeholder }: CommandSearchProps = $props()

  let inputRef = $state<HTMLButtonElement | null>(null)

  onMount(() => {
    inputRef?.focus()
  })
</script>

<header
  style='app-region: drag;'
  class='h-14 bg-search-background flex items-center border-b border-search-border px-4'
  data-slot='command-search'
>
  <div class='flex-1 w-0 flex' style='app-region: no-drag;'>
    <CommandInput
      bind:ref={inputRef}
      class='text-base text-search-foreground placeholder:text-search-placeholderForeground'
      {placeholder}
    />
  </div>
</header>
