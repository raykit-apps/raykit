<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { goto } from '$app/navigation'
  import { cn } from '$lib/utils'
  import { ArrowLeft } from '@lucide/svelte'
  import { Button } from '../ui/button'

  type CommandFooterProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: CommandFooterProps = $props()

  const goAppPage = () => {
    goto('/app')
  }

</script>

<header data-slot='extension-header' class={cn('h-14 px-4 flex items-center gap-2 border-b', className)} {...restProps}>
  <Button variant='secondary' size='icon' class='size-6' onclick={goAppPage}>
    <ArrowLeft />
  </Button>
</header>
