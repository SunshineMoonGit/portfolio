<script lang="ts">
  import { base } from '$app/paths'
  import { SurfaceCard } from '$lib'

  type AdjacentNote = {
    slug: string
    title: string
  }

  let {
    prev,
    next
  }: {
    prev?: AdjacentNote
    next?: AdjacentNote
  } = $props()

  function withBase(path: string): string {
    return `${base}${path}`
  }
</script>

{#if prev || next}
  <nav class="flex justify-between gap-4 mt-12 pt-8 border-t border-border">
    {#if prev}
      <SurfaceCard href={withBase(`/notes/${prev.slug}`)} class="flex flex-col gap-1.5 max-w-[48%] p-4 px-5 group">
        <span class="text-[0.7rem] text-text-dark uppercase tracking-widest">이전</span>
        <span class="text-sm text-text-dim group-hover:text-text-bright transition-colors">{prev.title}</span>
      </SurfaceCard>
    {:else}
      <span></span>
    {/if}
    {#if next}
      <SurfaceCard href={withBase(`/notes/${next.slug}`)} class="flex flex-col gap-1.5 max-w-[48%] p-4 px-5 text-right ml-auto group">
        <span class="text-[0.7rem] text-text-dark uppercase tracking-widest">다음</span>
        <span class="text-sm text-text-dim group-hover:text-text-bright transition-colors">{next.title}</span>
      </SurfaceCard>
    {/if}
  </nav>
{/if}
