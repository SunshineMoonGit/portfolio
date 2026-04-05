<script lang="ts">
  import { Badge, SectionHeader, SurfaceCard } from '$lib'
  import { withBase } from '$lib/utils'
  import { getCategoryStyle } from '$lib/content-style'

  type Note = {
    slug: string
    title: string
    summary?: string
    category: string
    thumbnail?: string
    date: string
  }

  let { notes }: { notes: Note[] } = $props()


</script>

<section class="reveal border-t border-border py-14">
  <SectionHeader title="Notes" href={withBase('/notes')} actionLabel="View all →" />

  <div class="grid gap-3">
    {#each notes.slice(0, 4) as note, index}
      <div class="reveal-child" style="--delay: {index * 0.08}s">
        <SurfaceCard
          href={withBase(`/notes/${note.slug}`)}
          class="flex items-start gap-4 p-5 no-underline hover:translate-x-1 max-sm:flex-col max-sm:gap-2 group"
        >
          <div class="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden" style="background: {note.thumbnail ? 'none' : getCategoryStyle(note.category).bg}">
            {#if note.thumbnail}
              <img src={note.thumbnail} alt="" class="w-full h-full object-cover rounded-[10px]" />
            {:else}
              <span class="text-xs font-semibold text-subtle">{getCategoryStyle(note.category).label}</span>
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <Badge tone="gold" uppercase>{note.category}</Badge>
            <h3 class="text-[0.95rem] font-semibold text-text mt-1 group-hover:text-text-bright transition-colors">{note.title}</h3>
            {#if note.summary}
              <p class="text-xs text-muted mt-1 leading-relaxed">{note.summary}</p>
            {/if}
          </div>
          <span class="text-[0.72rem] text-subtle whitespace-nowrap pt-0.5 max-sm:pt-0">{note.date}</span>
        </SurfaceCard>
      </div>
    {/each}
  </div>
</section>
