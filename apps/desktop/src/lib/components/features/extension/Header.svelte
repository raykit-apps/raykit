<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
  import { ArrowLeft } from '@lucide/svelte'

  type ExtensionHeaderProps = HTMLAttributes<HTMLElement> & {}

  const { class: className, ...restProps }: ExtensionHeaderProps = $props()

  const goAppPage = () => {
    goto('/app')
  }

</script>

<header data-slot='extension-header' class={cn('h-14 px-4 flex items-center gap-2 border-b', className)} {...restProps}>
  <Button variant='secondary' size='icon' class='size-6' onclick={goAppPage}>
    <ArrowLeft />
  </Button>
</header>
