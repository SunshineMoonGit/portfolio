<script lang="ts">
  import { base } from '$app/paths'
  import { marked } from 'marked'
  import type { PageData } from './$types'
  import { Button, MarkdownProse, TableOfContents } from '$lib'

  let { data }: { data: PageData } = $props()
  let { project } = $derived(data)
  let html = $derived(marked.parse(project.content) as string)
  let proseEl: HTMLElement | undefined = $state()

  function withBase(path: string): string {
    return `${base}${path}`
  }
</script>

<svelte:head>
  <title>{project.name} · Projects · sunshinemoon</title>
</svelte:head>

<article>
  <header class="pt-12 pb-10">
    <Button href={withBase('/projects')} class="mb-6 rounded-full">← Projects</Button>
    <div class="flex items-start justify-between gap-6 max-sm:flex-col">
      <div class="min-w-0">
        <h1 class="text-[clamp(1.7rem,5vw,2.5rem)] font-bold leading-tight text-text-bright tracking-tight mb-3">{project.name}</h1>
        {#if project.subtitle}
          <p class="text-base text-muted leading-relaxed mb-4 max-w-[56ch]">{project.subtitle}</p>
        {/if}
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-subtle">
          {#if project.period}
            <span>{project.period}</span>
          {/if}
          {#if project.techs.length}
            <span>{project.techs.join(' · ')}</span>
          {/if}
        </div>
      </div>

      {#if project.url}
        <Button href={project.url} target="_blank" rel="noopener noreferrer" variant="primary" size="md">GitHub ↗</Button>
      {/if}
    </div>

    {#if project.image}
      <div class="mt-8 overflow-hidden rounded-2xl border border-border bg-dark-card/70">
        <img src={project.image} alt={project.name} class="block w-full object-cover" />
      </div>
    {/if}
  </header>

  <MarkdownProse {html} bind:proseEl />

  <TableOfContents {proseEl} />
</article>
