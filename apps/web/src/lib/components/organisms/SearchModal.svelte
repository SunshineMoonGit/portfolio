<script lang="ts">
  import { goto } from '$app/navigation'
  import { withBase } from '$lib/utils'
  import { getCategoryStyle } from '$lib/content-style'
  import { searchDocuments, getAllCategories, getAllTags, highlightByIndices, getSnippet } from '$lib/search'
  import type { SearchResult, SearchFilters } from '$lib/search'
  import type { SearchDocument } from '@portfolio/content-types'

  let { open = $bindable(false) }: { open: boolean } = $props()

  let query = $state('')
  let activeKind = $state<'all' | 'note' | 'project'>('all')
  let activeCategory = $state<string | null>(null)
  let activeTags = $state<string[]>([])
  let selectedIndex = $state(0)
  let inputEl: HTMLInputElement | undefined = $state()
  let listEl: HTMLElement | undefined = $state()
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  let debouncedQuery = $state('')

  $effect(() => {
    clearTimeout(debounceTimer)
    const q = query
    debounceTimer = setTimeout(() => { debouncedQuery = q }, 150)
  })

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => inputEl?.focus())
    } else {
      query = ''
      debouncedQuery = ''
      activeKind = 'all'
      activeCategory = null
      activeTags = []
      selectedIndex = 0
    }
  })

  const allCategories = getAllCategories()
  const allTags = getAllTags().slice(0, 12)

  let filters = $derived<SearchFilters>({
    kind: activeKind === 'all' ? undefined : activeKind,
    category: activeCategory ?? undefined,
    tags: activeTags.length ? activeTags : undefined
  })

  let results = $derived(searchDocuments(debouncedQuery, filters))

  $effect(() => {
    results
    selectedIndex = 0
  })

  function getDocumentHref(doc: SearchDocument): string {
    const prefix = doc.kind === 'project' ? '/projects/' : '/note/'
    return withBase(`${prefix}${doc.slug}`)
  }

  function navigate(doc: SearchDocument) {
    open = false
    goto(getDocumentHref(doc))
  }

  function toggleTag(tag: string) {
    if (activeTags.includes(tag)) {
      activeTags = activeTags.filter((t) => t !== tag)
    } else {
      activeTags = [...activeTags, tag]
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      open = false
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1)
      scrollToSelected()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      scrollToSelected()
      return
    }

    if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      navigate(results[selectedIndex].document)
    }
  }

  function scrollToSelected() {
    if (!listEl) return
    const el = listEl.children[selectedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }

  function getTitleHtml(result: SearchResult): string {
    const match = result.matches.find((m) => m.key === 'title')
    if (!match) return escapeHtml(result.document.title)
    return highlightByIndices(result.document.title, match.indices)
  }

  function getSummaryHtml(result: SearchResult): string {
    const match = result.matches.find((m) => m.key === 'summary')
    if (!match) return escapeHtml(result.document.summary)
    return highlightByIndices(result.document.summary, match.indices)
  }

  function getSnippetHtml(result: SearchResult): string | null {
    const snippet = getSnippet(result.matches)
    if (!snippet) return null
    return highlightByIndices(snippet.text, snippet.indices)
  }

  function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
    onkeydown={handleKeydown}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" role="button" tabindex="-1" onclick={() => (open = false)}></div>

    <div class="relative w-full max-w-[640px] bg-dark-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
      <!-- Search input -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-border">
        <svg class="w-4 h-4 text-subtle shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          bind:this={inputEl}
          bind:value={query}
          type="text"
          placeholder="Search..."
          class="flex-1 bg-transparent text-sm text-text placeholder:text-subtle/40 outline-none"
        />
        <kbd class="hidden sm:inline text-[0.6rem] text-subtle border border-border rounded px-1.5 py-0.5">ESC</kbd>
      </div>

      <!-- Filters -->
      <div class="px-5 py-3 border-b border-border space-y-2">
        <!-- Kind + Category -->
        <div class="flex flex-wrap items-center gap-1.5">
          {#each ['all', 'notes', 'projects'] as kind}
            {@const value = kind === 'all' ? 'all' : kind === 'notes' ? 'note' : 'project'}
            <button
              onclick={() => (activeKind = value as typeof activeKind)}
              class="px-2.5 py-1 text-xs rounded-full transition-colors {activeKind === value ? 'bg-gold/15 text-gold' : 'text-subtle hover:text-text hover:bg-white/5'}"
            >
              {kind}
            </button>
          {/each}

          <span class="w-px h-4 bg-border mx-1"></span>

          {#each allCategories as category}
            {@const style = getCategoryStyle(category)}
            <button
              onclick={() => (activeCategory = activeCategory === category ? null : category)}
              class="px-2.5 py-1 text-xs rounded-full transition-colors {activeCategory === category ? 'bg-gold/15 text-gold' : 'text-subtle hover:text-text hover:bg-white/5'}"
            >
              {style.label}
            </button>
          {/each}
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1.5">
          {#each allTags as { tag }}
            <button
              onclick={() => toggleTag(tag)}
              class="px-2 py-0.5 text-[0.65rem] rounded-full border transition-colors {activeTags.includes(tag) ? 'border-gold/40 text-gold bg-gold/10' : 'border-border text-subtle hover:text-text hover:border-border-hover'}"
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>

      <!-- Results -->
      <div bind:this={listEl} class="overflow-y-auto flex-1">
        {#if results.length}
          {#each results as result, i}
            {@const doc = result.document}
            {@const snippetHtml = debouncedQuery ? getSnippetHtml(result) : null}
            <button
              class="w-full text-left px-5 py-3 transition-colors {i === selectedIndex ? 'bg-white/5' : 'hover:bg-white/[0.03]'}"
              onclick={() => navigate(doc)}
              onmouseenter={() => (selectedIndex = i)}
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[0.6rem] font-medium uppercase tracking-wider {doc.kind === 'project' ? 'text-subtle' : 'text-gold/60'}">
                  {doc.kind ?? 'note'}
                </span>
                <span class="text-[0.6rem] text-subtle">
                  {getCategoryStyle(doc.category).label}
                </span>
              </div>
              <h3 class="text-sm font-medium text-text">
                {#if debouncedQuery}
                  {@html getTitleHtml(result)}
                {:else}
                  {doc.title}
                {/if}
              </h3>
              {#if doc.summary}
                <p class="text-xs text-muted mt-0.5 line-clamp-1">
                  {#if debouncedQuery}
                    {@html getSummaryHtml(result)}
                  {:else}
                    {doc.summary}
                  {/if}
                </p>
              {/if}
              {#if snippetHtml}
                <p class="text-[0.65rem] text-subtle mt-1 line-clamp-2 font-mono">
                  {@html snippetHtml}
                </p>
              {/if}
            </button>
          {/each}
        {:else if debouncedQuery.trim()}
          <div class="px-5 py-8 text-center text-sm text-subtle">검색 결과가 없습니다.</div>
        {/if}
      </div>

      <!-- Footer hint -->
      <div class="px-5 py-2 border-t border-border flex items-center gap-4 text-[0.6rem] text-subtle">
        <span><kbd class="border border-border rounded px-1 py-0.5 mr-0.5">↑↓</kbd> ���동</span>
        <span><kbd class="border border-border rounded px-1 py-0.5 mr-0.5">↵</kbd> 열기</span>
        <span><kbd class="border border-border rounded px-1 py-0.5 mr-0.5">esc</kbd> 닫기</span>
      </div>
    </div>
  </div>
{/if}
