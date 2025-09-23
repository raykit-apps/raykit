<script lang='ts'>
  import ActionsBar from '$lib/components/layout/ActionsBar.svelte'

  const { children } = $props()
</script>

<div class='size-full bg-background flex flex-col'>
  {@render children()}
  <ActionsBar />
</div>
