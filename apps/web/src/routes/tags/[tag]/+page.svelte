<script lang="ts">
  import { base } from '$app/paths'
  import type { PageData } from './$types'
  import { Badge, Button, SectionHeader, SurfaceCard } from '$lib'
  import { getCategoryStyle } from '$lib/content-style'

  let { data }: { data: PageData } = $props()
  let { tag, notes } = $derived(data)

  function withBase(path: string): string {
    return `${base}${path}`
  }
</script>

<svelte:head>
  <title>#{tag} · Tags · sunshinemoon</title>
</svelte:head>

<div class="pt-14 pb-8">
  <Button href={withBase('/notes')} class="mb-6 rounded-full">← Notes</Button>
  <SectionHeader title={`#${tag}`} meta={`${notes.length}개 노트`} />
</div>

<div class="grid gap-4">
  {#each notes as note}
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
        <p class="text-sm text-muted leading-relaxed mb-2.5">{note.summary}</p>
        <div class="flex flex-wrap gap-1.5">
          {#each note.tags as noteTag}
            <Badge>{noteTag}</Badge>
          {/each}
        </div>
      </div>
    </SurfaceCard>
  {/each}
</div>
