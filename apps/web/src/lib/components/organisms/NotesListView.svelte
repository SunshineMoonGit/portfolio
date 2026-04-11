<script lang="ts">
  import type { NoteIndex } from '@portfolio/content-types'
  import { Seo, getNotes } from '$lib'
  import { withBase } from '$lib/utils'
  import { getCategoryLabel, isInCategory } from '$lib/content-style'

  let { selectedPath = null }: { selectedPath?: string | null } = $props()

  const notes = getNotes()

  let filtered = $derived(
    notes.filter((note: NoteIndex) => isInCategory(note.category, selectedPath))
  )
  let heading = $derived(selectedPath ? getCategoryLabel(selectedPath) : 'Notes')
  let seoTitle = $derived(selectedPath ? `${heading} — Notes` : 'Notes')
  let seoDescription = $derived(
    selectedPath
      ? `${heading} 카테고리의 개발 노트 아카이브.`
      : '개발 노트 아카이브. AI, Backend, Network, Infra 등 다양한 주제의 학습 기록.'
  )
</script>

<Seo title={seoTitle} description={seoDescription} />

<div class="min-w-0">
  {#if filtered.length}
    <ul>
      {#each filtered as note}
        <li class="border-b border-border/40 last:border-b-0">
          <a
            href={withBase(`/note/${note.slug}`)}
            class="group block py-7 sm:py-8"
          >
            <h2 class="text-[1.08rem] font-semibold leading-snug text-text-bright transition-colors group-hover:text-gold sm:text-[1.18rem]">
              {note.title}
            </h2>

            {#if note.subtitle}
              <p class="mt-1.5 text-[0.9rem] leading-snug text-muted">
                {note.subtitle}
              </p>
            {/if}

            <div class="mt-5 flex items-center justify-between gap-4">
              <div class="flex items-center gap-x-2 text-[0.7rem] text-subtle">
                <time>{note.created}</time>
                <span class="text-border/60" aria-hidden="true">·</span>
                <span>{getCategoryLabel(note.category)}</span>
              </div>

              {#if note.tags.length}
                <div class="flex flex-wrap justify-end gap-1.5">
                  {#each note.tags.slice(0, 4) as tag}
                    <span class="rounded-full border border-border/40 px-2 py-0.5 text-[0.65rem] text-subtle/70">
                      {tag}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="rounded-2xl border border-border/50 bg-white/[0.02] px-5 py-14 text-center">
      <p class="text-sm text-subtle">
        {selectedPath ? '이 카테고리에는 아직 노트가 없습니다.' : '검색 결과가 없습니다.'}
      </p>
    </div>
  {/if}
</div>
