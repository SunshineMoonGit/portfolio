<script lang="ts">
  import { getCategoryTree, getNotes } from '$lib/content'
  import { withBase } from '$lib/utils'
  import CategoryTree from './CategoryTree.svelte'

  let {
    selectedPath = null
  }: {
    selectedPath?: string | null
  } = $props()

  const tree = getCategoryTree()
  const notes = getNotes()
</script>

<nav aria-label="Notes categories" class="space-y-4">
  <div class="space-y-4">
    <p class="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-subtle/80">
      Browse topics
    </p>

    <div class="space-y-0.5">
      <a
        href={withBase('/notes')}
        aria-current={selectedPath === null ? 'page' : undefined}
        class="flex items-center justify-between rounded px-1.5 py-1.5 text-[0.8rem] leading-5 transition-colors {selectedPath === null
          ? 'text-gold'
          : 'text-muted hover:text-text'}"
      >
        <span class={selectedPath === null ? 'font-medium' : ''}>All posts</span>
        <span class="text-[0.63rem] tabular-nums {selectedPath === null ? 'text-gold/60' : 'text-subtle/60'}">
          {notes.length}
        </span>
      </a>

      <CategoryTree nodes={tree} selected={selectedPath} />
    </div>
  </div>
</nav>
