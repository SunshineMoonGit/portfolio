<script lang="ts">
  import { base } from '$app/paths'
  import type { NoteIndex } from '@portfolio/content-types'
  import { Badge, Button, SectionHeader, SurfaceCard, getNotes } from '$lib'
  import { getCategoryStyle } from '$lib/content-style'

  const notes = getNotes()

  let categories = $derived([...new Set(notes.map((n: NoteIndex) => n.category))].sort())
  let selected = $state<string | null>(null)
  let search = $state('')

  let categoryFiltered = $derived(selected ? notes.filter((n: NoteIndex) => n.category === selected) : notes)
  let filtered = $derived(
    search.trim()
      ? categoryFiltered.filter((n: NoteIndex) => {
          const q = search.trim().toLowerCase()
          return (
            n.title.toLowerCase().includes(q) ||
            n.summary?.toLowerCase().includes(q) ||
            n.tags.some((t: string) => t.toLowerCase().includes(q))
          )
        })
      : categoryFiltered
  )

  function withBase(path: string): string {
    return `${base}${path}`
  }

</script>

<svelte:head>
  <title>Notes · sunshinemoon</title>
</svelte:head>

<div class="pt-14 pb-8">
  <SectionHeader title="Notes" meta={`${filtered.length}개`} href={withBase('/search')} actionLabel="Search →" />
</div>

{#if categories.length > 1}
  <div class="flex flex-wrap gap-1.5 mb-4">
    <Button variant={selected === null ? 'primary' : 'ghost'} class="rounded-full" onclick={() => (selected = null)}>all</Button>
    {#each categories as category}
      <Button variant={selected === category ? 'primary' : 'ghost'} class="rounded-full" onclick={() => (selected = category)}>{category}</Button>
    {/each}
  </div>
{/if}

<div class="mb-8">
  <input
    type="text"
    bind:value={search}
    placeholder="제목, 태그로 검색..."
    class="w-full bg-dark border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-subtle focus:border-gold focus:outline-none transition-colors"
  />
</div>

{#if filtered.length}
  <div class="grid gap-4">
    {#each filtered as note}
      <SurfaceCard href={withBase(`/notes/${note.slug}`)} class="flex items-start gap-5 p-6 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] max-sm:flex-col max-sm:gap-3 group">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style="background: {note.thumbnail ? 'none' : getCategoryStyle(note.category).bg}">
          {#if note.thumbnail}
            <img src={note.thumbnail} alt="" class="w-full h-full object-cover rounded-xl" />
          {:else}
            <span class="text-[1.4rem]">{getCategoryStyle(note.category).icon}</span>
          {/if}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-2">
            <Badge tone="gold" uppercase>{note.category}</Badge>
            <span class="text-[0.72rem] text-subtle">{note.date}</span>
          </div>
          <h2 class="text-lg font-semibold text-text mb-1.5 leading-snug group-hover:text-text-bright">{note.title}</h2>
          {#if note.summary}
            <p class="text-sm text-muted leading-relaxed mb-2.5">{note.summary}</p>
          {/if}
          {#if note.tags.length}
            <div class="flex flex-wrap gap-1.5">
              {#each note.tags as tag}
                <a href={withBase(`/tags/${encodeURIComponent(tag)}`)} class="inline-flex">
                  <Badge>{tag}</Badge>
                </a>
              {/each}
            </div>
          {/if}
        </div>
      </SurfaceCard>
    {/each}
  </div>
{:else}
  <p class="text-subtle text-sm py-8">노트가 없습니다.</p>
{/if}
