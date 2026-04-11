<script lang="ts">
  import { withBase } from "$lib/utils";
  import {
    Badge,
    CategoryBreadcrumb,
    GiscusComments,
    MarkdownProse,
    NotePager,
    Seo,
    TableOfContents,
    getBacklinks,
    getRelatedNotes,
  } from "$lib";
  import type { Backlink, RelatedLink } from "@portfolio/content-types";
  import { marked } from "marked";
  import { onMount, tick } from "svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { note } = $derived(data);

  let html = $derived(marked.parse(note.content) as string);
  let relatedNotes = $derived(getRelatedNotes(note.slug));
  let backlinks = $derived(getBacklinks(note.slug));
  let proseEl: HTMLElement | undefined = $state();

  onMount(async () => {
    await tick();
    enhanceCodeBlocks();
  });

  function enhanceCodeBlocks() {
    if (!proseEl) return;

    proseEl.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.enhanced === "true") return;
      pre.dataset.enhanced = "true";

      const code = pre.querySelector("code");
      const codeText = code?.textContent ?? "";
      const languageClass = Array.from(code?.classList ?? []).find(
        (className) => className.startsWith("language-"),
      );
      const language = languageClass?.replace("language-", "") ?? "text";

      const meta = document.createElement("div");
      meta.className = "code-block-meta";

      const label = document.createElement("span");
      label.className = "code-language-label";
      label.textContent = language;
      meta.appendChild(label);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code");
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          button.textContent = "Copied";
          setTimeout(() => {
            if (button.isConnected) {
              button.textContent = "Copy";
            }
          }, 1600);
        } catch {
          button.textContent = "Failed";
          setTimeout(() => {
            button.textContent = "Copy";
          }, 1600);
        }
      });

      pre.appendChild(meta);
      pre.appendChild(button);
    });
  }

  function getRelatedHref(link: RelatedLink): string {
    return withBase(`/note/${link.slug}`);
  }

  function getBacklinkHref(link: Backlink): string {
    return withBase(`/note/${link.fromSlug}`);
  }
</script>

<Seo
  title={note.title}
  description={note.summary ?? `${note.title} — ${note.category} 노트`}
  type="article"
/>

<article>
  <header class="pt-12 pb-10">
    <div class="mb-6">
      <CategoryBreadcrumb path={note.category} />
    </div>
    <h1
      class="text-[clamp(1.5rem,5vw,2rem)] font-bold leading-tight text-text-bright tracking-tight mb-3"
    >
      {note.title}
    </h1>
    <div class="flex items-center gap-3 text-xs text-subtle">
      <span>{note.created}</span>
    </div>
    {#if note.tags.length}
      <div class="mt-4 flex flex-wrap gap-1.5">
        {#each note.tags as tag}
          <a
            href={withBase(`/tags/${encodeURIComponent(tag)}`)}
            class="inline-flex"
          >
            <Badge>{tag}</Badge>
          </a>
        {/each}
      </div>
    {/if}
  </header>

  <MarkdownProse {html} bind:proseEl />
</article>

<!-- Fixed right sidebar -->
<nav class="note-sidebar" aria-label="Note sidebar">
  <!-- TOC -->
  <TableOfContents {proseEl} />

  <!-- Related Notes -->
  {#if relatedNotes.length}
    <div class="mt-6">
      <p
        class="text-[0.65rem] font-semibold text-subtle uppercase tracking-wider mb-3"
      >
        Related
      </p>
      <ul class="flex flex-col gap-1">
        {#each relatedNotes.slice(0, 5) as related}
          <li>
            <a
              href={getRelatedHref(related)}
              class="block text-[0.7rem] text-subtle hover:text-gold transition-colors truncate py-0.5 px-2"
              >{related.title}</a
            >
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Backlinks -->
  {#if backlinks.length}
    <div class="mt-6">
      <p
        class="text-[0.65rem] font-semibold text-subtle uppercase tracking-wider mb-3"
      >
        Backlinks
      </p>
      <ul class="flex flex-col gap-1">
        {#each backlinks.slice(0, 5) as backlink}
          <li>
            <a
              href={getBacklinkHref(backlink)}
              class="block text-[0.7rem] text-subtle hover:text-gold transition-colors truncate py-0.5 px-2"
              >{backlink.fromTitle}</a
            >
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</nav>

{#if relatedNotes.length || backlinks.length}
  <section class="pt-10 border-t border-border mt-10 xl:hidden">
    {#if relatedNotes.length}
      <div class="mb-6">
        <p class="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">Related Notes</p>
        <div class="flex flex-wrap gap-2">
          {#each relatedNotes as related}
            <a href={getRelatedHref(related)} class="text-sm text-muted hover:text-gold transition-colors">
              {related.title}
            </a>
            {#if relatedNotes.indexOf(related) < relatedNotes.length - 1}
              <span class="text-border">·</span>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
    {#if backlinks.length}
      <div>
        <p class="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">Backlinks</p>
        <div class="flex flex-wrap gap-2">
          {#each backlinks as backlink}
            <a href={getBacklinkHref(backlink)} class="text-sm text-muted hover:text-gold transition-colors">
              {backlink.fromTitle}
            </a>
            {#if backlinks.indexOf(backlink) < backlinks.length - 1}
              <span class="text-border">·</span>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </section>
{/if}

<GiscusComments term={note.slug} />

<NotePager prev={note.prev ?? undefined} next={note.next ?? undefined} />

<style>
  .note-sidebar {
    position: fixed;
    top: 100px;
    right: calc((100vw - 680px) / 2 - 260px);
    width: 220px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .note-sidebar::-webkit-scrollbar {
    display: none;
  }

  .note-sidebar :global(.toc) {
    position: static !important;
    right: auto !important;
    top: auto !important;
    width: 100% !important;
    max-height: none !important;
  }

  @media (max-width: 1280px) {
    .note-sidebar {
      display: none;
    }
  }
</style>
