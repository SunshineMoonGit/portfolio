<script lang="ts">
  import { withBase } from '$lib/utils'
  import {
    CategoryBreadcrumb,
    GiscusComments,
    MarkdownProse,
    NotePager,
    NotesRailPortal,
    Seo,
    TableOfContents,
    getBacklinks,
    getRelatedNotes
  } from '$lib'
  import { getCategoryLabel } from '$lib/content-style'
  import type { Backlink, RelatedLink } from '@portfolio/content-types'
  import { marked } from 'marked'
  import { tick } from 'svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  let { note } = $derived(data)

  function resolveWikiLinks(content: string): string {
    return content.replace(/\[\[([^\]]+?)\]\]/g, (_, inner) => {
      // Obsidian-style table escape: `[[Target\|Alias]]` inside a markdown table
      // uses `\|` so the pipe survives the table parser. Unescape first, then
      // split on `|` as the alias separator.
      const [rawTarget, rawAlias] = inner.replace(/\\\|/g, '|').split('|', 2)
      const target = rawTarget.trim()
      const alias = rawAlias?.trim()
      const slug = target.toLowerCase()
      const label = alias ?? target
      return `[${label}](${withBase('/note/' + encodeURIComponent(slug))})`
    })
  }

  let html = $derived(marked.parse(resolveWikiLinks(note.content)) as string)
  let relatedNotes = $derived(getRelatedNotes(note.slug))
  let backlinks = $derived(getBacklinks(note.slug))
  let proseEl: HTMLElement | undefined = $state()

  const railTitleClass = 'text-[0.67rem] font-semibold uppercase tracking-[0.2em] text-text-dim/70'
  const secondaryRailClass = 'mt-6 border-t border-border/30 pt-6'
  const secondaryLinkClass =
    'block truncate text-[0.78rem] leading-6 text-subtle transition-colors hover:text-text'

  $effect(() => {
    html
    if (!proseEl) return

    tick().then(() => {
      enhanceCodeBlocks()
    })
  })

  function enhanceCodeBlocks() {
    if (!proseEl) return

    proseEl.querySelectorAll('pre').forEach((pre) => {
      if (pre.dataset.enhanced === 'true') return
      pre.dataset.enhanced = 'true'

      const code = pre.querySelector('code')
      const codeText = code?.textContent ?? ''
      const languageClass = Array.from(code?.classList ?? []).find(
        (className) => className.startsWith('language-')
      )
      const language = languageClass?.replace('language-', '') ?? 'text'

      const meta = document.createElement('div')
      meta.className = 'code-block-meta'

      const label = document.createElement('span')
      label.className = 'code-language-label'
      label.textContent = language
      meta.appendChild(label)

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy-button'
      button.textContent = 'Copy'
      button.setAttribute('aria-label', 'Copy code')
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeText)
          button.textContent = 'Copied'
          setTimeout(() => {
            if (button.isConnected) {
              button.textContent = 'Copy'
            }
          }, 1600)
        } catch {
          button.textContent = 'Failed'
          setTimeout(() => {
            button.textContent = 'Copy'
          }, 1600)
        }
      })

      pre.appendChild(meta)
      pre.appendChild(button)
    })
  }

  function getRelatedHref(link: RelatedLink): string {
    return withBase(`/note/${link.slug}`)
  }

  function getBacklinkHref(link: Backlink): string {
    return withBase(`/note/${link.fromSlug}`)
  }
</script>

{#snippet railSections()}
  <TableOfContents {proseEl} contentKey={note.slug} />

  {#if relatedNotes.length}
    <section class={secondaryRailClass}>
      <p class={railTitleClass}>Related</p>
      <ul class="mt-3 flex flex-col gap-1.5">
        {#each relatedNotes.slice(0, 5) as related}
          <li>
            <a href={getRelatedHref(related)} class={secondaryLinkClass}>
              {related.title}
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

{/snippet}

<NotesRailPortal content={railSections} />

<Seo
  title={note.title}
  description={note.summary ?? `${note.title} — ${note.category} 노트`}
  type="article"
/>

<div class="min-w-0 space-y-10">
    <article class="min-w-0 space-y-8">
      <header class="space-y-4 border-b border-border/50 pb-7 pt-5 lg:pt-8">
        <CategoryBreadcrumb path={note.category} />

        <h1 class="text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.06] tracking-tight text-text-bright">
          {note.title}
        </h1>

        {#if note.subtitle}
          <p class="text-[1rem] leading-relaxed text-muted/80 lg:text-[1.05rem]">
            {note.subtitle}
          </p>
        {/if}

        {#if note.summary}
          <p class="text-[0.9rem] leading-7 text-muted/70">
            {note.summary}
          </p>
        {/if}

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-subtle">
          <time>{note.created}</time>
          <span class="text-border/60" aria-hidden="true">·</span>
          <span>{getCategoryLabel(note.category)}</span>
        </div>

        {#if note.tags.length}
          <div class="flex flex-wrap gap-1.5">
            {#each note.tags as tag}
              <a
                href={withBase(`/tags/${encodeURIComponent(tag)}`)}
                class="rounded-full border border-border/50 px-2.5 py-0.5 text-[0.68rem] text-subtle/80 transition-colors hover:border-gold/30 hover:text-gold"
              >
                {tag}
              </a>
            {/each}
          </div>
        {/if}
      </header>

      <MarkdownProse {html} bind:proseEl />
    </article>

    <div class="space-y-6 lg:hidden">
      {@render railSections()}
    </div>

    <div class="space-y-10">
      <NotePager prev={note.prev ?? undefined} next={note.next ?? undefined} />
      <GiscusComments term={note.slug} />
    </div>
</div>
