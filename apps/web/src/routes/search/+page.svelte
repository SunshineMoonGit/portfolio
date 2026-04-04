<script lang="ts">
  import { base } from '$app/paths'
  import { Badge, Button, SectionHeader, SurfaceCard, getSearchIndex, searchDocuments } from '$lib'
  import type { SearchDocument } from '@portfolio/content-types'

  const allDocuments = getSearchIndex()

  let query = $state('')
  let activeKind = $state<'all' | 'note' | 'project'>('all')

  let results = $derived.by(() => {
    const matches = searchDocuments(query)
    return activeKind === 'all' ? matches : matches.filter((document) => document.kind === activeKind)
  })

  function withBase(path: string): string {
    return `${base}${path}`
  }

  function getDocumentHref(document: SearchDocument): string {
    const prefix = document.kind === 'project' ? '/projects/' : '/notes/'
    return withBase(`${prefix}${document.slug}`)
  }
</script>

<svelte:head>
  <title>Search · sunshinemoon</title>
</svelte:head>

<div class="pt-14 pb-8">
  <SectionHeader title="Search" meta={`${results.length}개 결과`} />
  <p class="text-sm text-muted leading-relaxed max-w-[60ch]">
    정적으로 생성된 인덱스를 브라우저에서 바로 검색합니다. 노트와 프로젝트를 함께 찾을 수 있습니다.
  </p>
</div>

<div class="flex flex-wrap gap-2 mb-4">
  <Button variant={activeKind === 'all' ? 'primary' : 'ghost'} class="rounded-full" onclick={() => (activeKind = 'all')}>all</Button>
  <Button variant={activeKind === 'note' ? 'primary' : 'ghost'} class="rounded-full" onclick={() => (activeKind = 'note')}>notes</Button>
  <Button variant={activeKind === 'project' ? 'primary' : 'ghost'} class="rounded-full" onclick={() => (activeKind = 'project')}>projects</Button>
</div>

<div class="mb-8">
  <input
    type="search"
    bind:value={query}
    placeholder="제목, 요약, 태그, 본문에서 검색..."
    class="w-full bg-dark border border-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-subtle focus:border-gold focus:outline-none transition-colors"
  />
</div>

{#if results.length}
  <div class="grid gap-4">
    {#each results as document}
      <SurfaceCard href={getDocumentHref(document)} class="p-6 group">
        <div class="flex items-center justify-between gap-4 mb-2">
          <div class="flex items-center gap-2">
            <Badge tone={document.kind === 'project' ? 'muted' : 'gold'} uppercase>{document.kind ?? 'note'}</Badge>
            <Badge uppercase>{document.category}</Badge>
          </div>
          <span class="text-xs text-subtle">{document.sourcePath}</span>
        </div>
        <h2 class="text-lg font-semibold text-text mb-2 group-hover:text-text-bright transition-colors">{document.title}</h2>
        {#if document.summary}
          <p class="text-sm text-muted leading-relaxed mb-3">{document.summary}</p>
        {/if}
        {#if document.tags.length}
          <div class="flex flex-wrap gap-1.5">
            {#each document.tags as tag}
              <Badge>{tag}</Badge>
            {/each}
          </div>
        {/if}
      </SurfaceCard>
    {/each}
  </div>
{:else if query.trim()}
  <p class="text-sm text-subtle py-8">검색 결과가 없습니다.</p>
{:else}
  <div class="grid gap-4">
    {#each allDocuments.slice(0, 8) as document}
      <SurfaceCard href={getDocumentHref(document)} class="p-5 group">
        <div class="flex items-center gap-2 mb-2">
          <Badge tone={document.kind === 'project' ? 'muted' : 'gold'} uppercase>{document.kind ?? 'note'}</Badge>
          <Badge uppercase>{document.category}</Badge>
        </div>
        <h2 class="text-base font-semibold text-text mb-1 group-hover:text-text-bright transition-colors">{document.title}</h2>
        <p class="text-sm text-muted leading-relaxed">{document.summary}</p>
      </SurfaceCard>
    {/each}
  </div>
{/if}
