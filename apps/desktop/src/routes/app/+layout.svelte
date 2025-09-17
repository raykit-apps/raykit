<script lang='ts'>
  import Footer from '$lib/components/layout/Footer.svelte'

  const { children } = $props()
</script>

<div class='size-full bg-background flex flex-col'>
  {@render children()}
  <Footer />
</div>
