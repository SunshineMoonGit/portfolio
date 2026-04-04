<script lang="ts">
  let {
    title,
    meta,
    href,
    actionLabel
  }: {
    title: string
    meta?: string
    href?: string
    actionLabel?: string
  } = $props()
</script>

<div class="flex justify-between items-baseline gap-4 mb-6">
  <div class="flex items-baseline gap-4">
    <h2 class="text-xl font-bold text-text-bright tracking-tight">{title}</h2>
    {#if meta}
      <p class="text-xs text-subtle">{meta}</p>
    {/if}
  </div>
  {#if href && actionLabel}
    <a href={href} class="text-xs text-text-dark hover:text-gold transition-colors">{actionLabel}</a>
  {/if}
</div>
