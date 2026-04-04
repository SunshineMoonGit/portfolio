<script lang="ts">
  let {
    children,
    href,
    target,
    rel,
    class: className = ''
  }: {
    children?: import('svelte').Snippet
    href?: string
    target?: string
    rel?: string
    class?: string
  } = $props()

  const classes = $derived(`block border border-border rounded-xl bg-dark-card/72 transition-all duration-250 hover:border-border-hover hover:bg-dark-card ${className}`.trim())
</script>

{#if href}
  <a {href} {target} {rel} class={classes}>
    {@render children?.()}
  </a>
{:else}
  <div class={classes}>
    {@render children?.()}
  </div>
{/if}
