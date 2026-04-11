<script lang="ts">
  import Self from './CategoryTree.svelte'
  import { withBase } from '$lib/utils'
  import { getCategoryLabel } from '$lib/content-style'
  import type { CategoryNode } from '@portfolio/content-types'

  let {
    nodes,
    selected = null,
    level = 0
  }: {
    nodes: CategoryNode[]
    selected?: string | null
    level?: number
  } = $props()

  function isOpen(path: string): boolean {
    return !!selected && (selected === path || selected.startsWith(path + '/'))
  }
</script>

{#each nodes as node}
  {@const active = selected === node.path}
  {@const open = isOpen(node.path)}
  <a
    href={withBase('/notes/' + node.path)}
    class="flex items-center justify-between rounded-lg py-2 pr-3 text-sm transition-colors {active
      ? 'bg-gold/10 text-gold'
      : 'text-muted hover:text-text hover:bg-dark-card/50'}"
    style="padding-left: {12 + level * 14}px"
  >
    <span class="truncate">{getCategoryLabel(node.path)}</span>
    <span class="ml-2 shrink-0 text-xs {active ? 'text-gold/60' : 'text-subtle'}">
      {node.totalCount}
    </span>
  </a>

  {#if node.children.length && open}
    <Self nodes={node.children} {selected} level={level + 1} />
  {/if}
{/each}
