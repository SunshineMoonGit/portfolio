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
  <!-- Desktop: always expanded -->
  <div class="hidden lg:block space-y-4">
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

  <!-- Mobile: collapsible -->
  <details class="lg:hidden group">
    <summary class="flex cursor-pointer list-none items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-subtle/80 [&::-webkit-details-marker]:hidden">
      Browse topics
      <svg class="size-3 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"/>
      </svg>
    </summary>

    <div class="mt-3 space-y-0.5">
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
  </details>
</nav>
