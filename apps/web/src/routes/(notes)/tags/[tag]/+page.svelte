<script lang="ts">
  import type { PageData } from './$types'
  import { Seo } from '$lib'
  import { withBase } from '$lib/utils'
  import { getCategoryLabel } from '$lib/content-style'

  let { data }: { data: PageData } = $props()
  let { tag, notes } = $derived(data)
</script>

<Seo
  title={`#${tag} · Tags`}
  description={`#${tag} 태그가 달린 노트 ${notes.length}개`}
/>

<div class="pt-10">
  <a
    href={withBase('/notes')}
    class="text-[0.72rem] text-subtle transition-colors hover:text-text"
  >
    ← All notes
  </a>

  <div class="mt-6 border-b border-border/40 pb-7">
    <h1 class="text-[1.6rem] font-semibold tracking-tight text-text-bright">
      #{tag}
    </h1>
    <p class="mt-1.5 text-[0.78rem] text-subtle">{notes.length} notes</p>
  </div>

  <ul>
    {#each notes as note}
      <li class="border-b border-border/40 last:border-b-0">
        <a
          href={withBase(`/note/${note.slug}`)}
          class="group block py-7"
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
                {#each note.tags.slice(0, 4) as noteTag}
                  <span class="rounded-full border border-border/40 px-2 py-0.5 text-[0.65rem] {noteTag === tag ? 'border-gold/40 text-gold/80' : 'text-subtle/70'}">
                    {noteTag}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        </a>
      </li>
    {/each}
  </ul>
</div>
