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

<div class='h-14 flex items-center border-b px-4' data-slot='command-search'>
  <CommandInput bind:ref={inputRef} {placeholder} />
</div>
