<script lang="ts">
  import { base } from '$app/paths'
  import type { NoteIndex } from '@portfolio/content-types'
  import { Badge, getNotes } from '$lib'
  import { getCategoryStyle } from '$lib/content-style'

  const notes = getNotes()

  let categories = $derived([...new Set(notes.map((n: NoteIndex) => n.category))].sort())
  let selected = $state<string | null>(null)

  let filtered = $derived(selected ? notes.filter((n: NoteIndex) => n.category === selected) : notes)

  function withBase(path: string): string {
    return `${base}${path}`
  }

  function getCategoryCount(cat: string): number {
    return notes.filter((n: NoteIndex) => n.category === cat).length
  }
</script>

<svelte:head>
  <title>Notes · sunshinemoon</title>
</svelte:head>

<div class="pt-14 pb-6">
  <div class="flex items-baseline justify-between">
    <h1 class="text-2xl font-bold text-text">Notes</h1>
    <span class="text-sm text-subtle">{filtered.length}개</span>
  </div>
</div>

<div class="flex gap-8 max-sm:flex-col">
  <!-- Left sidebar -->
  <aside class="w-48 shrink-0 max-sm:w-full">
    <div class="sticky top-20 space-y-1">
      <button
        onclick={() => (selected = null)}
        class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors {selected === null ? 'bg-gold/10 text-gold' : 'text-muted hover:text-text hover:bg-dark-card/50'}"
      >
        <span>All</span>
        <span class="text-xs {selected === null ? 'text-gold/60' : 'text-subtle'}">{notes.length}</span>
      </button>
      {#each categories as category}
        {@const style = getCategoryStyle(category)}
        <button
          onclick={() => (selected = selected === category ? null : category)}
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors {selected === category ? 'bg-gold/10 text-gold' : 'text-muted hover:text-text hover:bg-dark-card/50'}"
        >
          <span class="flex items-center gap-2">
            <span class="text-xs">{style.label}</span>
            {category}
          </span>
          <span class="text-xs {selected === category ? 'text-gold/60' : 'text-subtle'}">{getCategoryCount(category)}</span>
        </button>
      {/each}
    </div>
  </aside>

  <!-- Right content -->
  <div class="flex-1 min-w-0">
    {#if filtered.length}
      <div class="space-y-0.5">
        {#each filtered as note}
          <a href={withBase(`/notes/${note.slug}`)} class="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-card/50 transition-all">
            <div class="w-8 h-8 rounded-md flex items-center justify-center shrink-0 overflow-hidden" style="background: {note.thumbnail ? 'none' : getCategoryStyle(note.category).bg}">
              {#if note.thumbnail}
                <img src={note.thumbnail} alt="" class="w-full h-full object-cover rounded-md" />
              {:else}
                <span class="text-[0.6rem] font-semibold text-subtle">{getCategoryStyle(note.category).label}</span>
              {/if}
            </div>

            <div class="flex-1 min-w-0">
              <h2 class="text-sm text-text truncate group-hover:text-gold transition-colors">{note.title}</h2>
            </div>

            <div class="flex items-center gap-2 shrink-0 max-sm:hidden">
              {#each note.tags.slice(0, 2) as tag}
                <Badge>{tag}</Badge>
              {/each}
            </div>

            <span class="text-xs text-subtle shrink-0 w-20 text-right max-sm:hidden">{note.date}</span>
          </a>
        {/each}
      </div>
    {:else}
      <p class="text-subtle text-sm py-8 text-center">검색 결과가 없습니다.</p>
    {/if}
  </div>
</div>
