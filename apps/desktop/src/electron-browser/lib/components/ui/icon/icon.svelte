<script lang='ts' module>
  export interface Props {
    icon?: string
  }
</script>

<script lang='ts'>
  const { icon = '/favicon.png' }: Props = $props()
</script>

{#if icon}
  <img
    loading='lazy'
    src={icon}
    alt='Icon'
    width={20}
    height={20}
  />
{/if}
