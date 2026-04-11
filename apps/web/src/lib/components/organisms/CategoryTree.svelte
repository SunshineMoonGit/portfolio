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

<ul class={level === 0 ? 'space-y-0.5' : 'mt-0.5 space-y-0.5 border-l border-border/20 pl-3'}>
  {#each nodes as node}
    {@const active = selected === node.path}
    {@const open = isOpen(node.path)}
    <li>
      <a
        href={withBase('/notes/' + node.path)}
        aria-current={active ? 'page' : undefined}
        class="flex items-center justify-between rounded px-1.5 py-1.5 text-[0.78rem] leading-5 transition-colors {active
          ? 'text-gold font-medium'
          : 'text-subtle hover:text-text'}"
        style="padding-left: {6 + level * 10}px"
      >
        <span class="truncate">{getCategoryLabel(node.path)}</span>
        <span class="ml-2 shrink-0 text-[0.62rem] tabular-nums {active ? 'text-gold/55' : 'text-subtle/50'}">
          {node.totalCount}
        </span>
      </a>

      {#if node.children.length && open}
        <Self nodes={node.children} {selected} level={level + 1} />
      {/if}
    </li>
  {/each}
</ul>
