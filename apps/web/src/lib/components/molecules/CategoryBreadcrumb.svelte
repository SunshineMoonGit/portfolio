<script lang="ts">
  import { withBase } from '$lib/utils'
  import { getCategoryBreadcrumbs } from '$lib/content-style'

  let { path }: { path: string } = $props()

  let crumbs = $derived(getCategoryBreadcrumbs(path))
</script>

<nav
  class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-subtle"
  aria-label="Category breadcrumb"
>
  <a href={withBase('/notes')} class="transition-colors hover:text-gold">Notes</a>
  {#each crumbs as crumb, index}
    <span class="text-border" aria-hidden="true">›</span>
    {#if index === crumbs.length - 1}
      <span class="text-muted">{crumb.label}</span>
    {:else}
      <a href={withBase('/notes/' + crumb.path)} class="transition-colors hover:text-gold">
        {crumb.label}
      </a>
    {/if}
  {/each}
</nav>
