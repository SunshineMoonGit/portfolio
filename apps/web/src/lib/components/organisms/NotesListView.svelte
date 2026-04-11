<script lang="ts">
  import type { NoteIndex } from '@portfolio/content-types'
  import { Badge, CategoryTree, Seo, getCategoryTree, getNotes } from '$lib'
  import { withBase } from '$lib/utils'
  import { getCategoryLabel, getCategoryStyle, isInCategory } from '$lib/content-style'

  let { selectedPath = null }: { selectedPath?: string | null } = $props()

  const notes = getNotes()
  const tree = getCategoryTree()

  let filtered = $derived(
    notes.filter((note: NoteIndex) => isInCategory(note.category, selectedPath))
  )
  let heading = $derived(selectedPath ? getCategoryLabel(selectedPath) : 'Notes')
  let seoTitle = $derived(selectedPath ? `${heading} — Notes` : 'Notes')
  let seoDescription = $derived(
    selectedPath
      ? `${heading} 카테고리의 개발 노트 모음.`
      : '개발 노트 모음. AI, Backend, Network, Infra 등 다양한 주제의 학습 기록.'
  )
</script>

<Seo title={seoTitle} description={seoDescription} />

<div class="pt-14 pb-6">
  <div class="flex items-baseline justify-between">
    <h1 class="text-2xl font-bold text-text">{heading}</h1>
    <span class="text-sm text-subtle">{filtered.length}개</span>
  </div>
</div>

<div class="flex gap-8 max-sm:flex-col">
  <aside class="w-48 shrink-0 max-sm:w-full">
    <div class="sticky top-20 space-y-1">
      <a
        href={withBase('/notes')}
        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors {selectedPath ===
        null
          ? 'bg-gold/10 text-gold'
          : 'text-muted hover:text-text hover:bg-dark-card/50'}"
      >
        <span>All</span>
        <span class="text-xs {selectedPath === null ? 'text-gold/60' : 'text-subtle'}">
          {notes.length}
        </span>
      </a>
      <CategoryTree nodes={tree} selected={selectedPath} />
    </div>
  </aside>

  <div class="min-w-0 flex-1">
    {#if filtered.length}
      <div class="space-y-0.5">
        {#each filtered as note}
          <a
            href={withBase(`/note/${note.slug}`)}
            class="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-dark-card/50"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md"
              style="background: {note.thumbnail ? 'none' : getCategoryStyle(note.category).bg}"
            >
              {#if note.thumbnail}
                <img src={note.thumbnail} alt="" class="h-full w-full rounded-md object-cover" />
              {:else}
                <span class="text-[0.6rem] font-semibold text-subtle">
                  {getCategoryStyle(note.category).label}
                </span>
              {/if}
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-sm text-text transition-colors group-hover:text-gold">
                {note.title}
              </h2>
            </div>

            <div class="flex shrink-0 items-center gap-2 max-sm:hidden">
              {#each note.tags.slice(0, 2) as tag}
                <Badge>{tag}</Badge>
              {/each}
            </div>

            <span class="w-20 shrink-0 text-right text-xs text-subtle max-sm:hidden">
              {note.created}
            </span>
          </a>
        {/each}
      </div>
    {:else}
      <p class="py-8 text-center text-sm text-subtle">
        {selectedPath
          ? '이 카테고리에는 아직 노트가 없습니다.'
          : '검색 결과가 없습니다.'}
      </p>
    {/if}
  </div>
</div>
