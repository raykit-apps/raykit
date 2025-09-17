<script lang='ts'>
  import ExtensionHeader from '$lib/components/layout/ExtensionHeader.svelte'
</script>

<ExtensionHeader />
<main class='flex-1 h-0 w-full'>
  <iframe
    title='extension-iframe'
    class='size-full'
    src='https://www.shadcn-svelte.com/docs/components/command'
  >
  </iframe>
</main>
