<script lang="ts">
  import { onMount } from 'svelte'

  let {
    html,
    proseEl = $bindable()
  }: {
    html: string
    proseEl?: HTMLElement
  } = $props()

  let lightboxSrc = $state('')
  let lightboxAlt = $state('')

  onMount(() => {
    if (!proseEl) return

    function handleImageClick(e: Event) {
      const img = e.currentTarget as HTMLImageElement
      lightboxSrc = img.src
      lightboxAlt = img.alt || ''
    }

    proseEl.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('table-wrapper')) return
      const wrapper = document.createElement('div')
      wrapper.className = 'table-wrapper'
      table.parentNode?.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    })

    const images = proseEl.querySelectorAll('img')
    images.forEach((img) => {
      img.style.cursor = 'zoom-in'
      img.addEventListener('click', handleImageClick)
    })

    return () => {
      images.forEach((img) => {
        img.removeEventListener('click', handleImageClick)
      })
    }
  })

  function closeLightbox() {
    lightboxSrc = ''
  }
</script>

<div class="prose" bind:this={proseEl}>
  {@html html}
</div>

{#if lightboxSrc}
  <div
    class="lightbox-overlay"
    onclick={closeLightbox}
    onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="button"
    tabindex="0"
    aria-label="Close image"
  >
    <img src={lightboxSrc} alt={lightboxAlt} class="lightbox-image" />
  </div>
{/if}

<style>
  .lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    cursor: zoom-out;
    padding: 2rem;
  }

  .lightbox-image {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    border: none !important;
    margin: 0 !important;
  }

  .prose :global(h1) { font-size: 1.4rem; font-weight: 700; color: #f7f9fb; margin: 2.5rem 0 0.75rem; padding-top: 1rem; border-top: 1px solid #36414d; }
  .prose :global(h2) { font-size: 1.2rem; font-weight: 600; color: #eef2f6; margin: 2.5rem 0 0.75rem; }
  .prose :global(h3) { font-size: 1rem; font-weight: 600; color: #d9e1e9; margin: 2rem 0 0.5rem; }
  .prose :global(p) { font-size: 0.95rem; color: #bac5d0; line-height: 1.8; margin-bottom: 1.25rem; }
  .prose :global(strong) { color: #eef2f6; font-weight: 600; }
  .prose :global(em) { color: #bac5d0; }
  .prose :global(a) { color: #f59e0b; text-decoration: underline; text-underline-offset: 3px; }
  .prose :global(a:hover) { color: #fbbf24; }
  .prose :global(ul) { margin: 0.5rem 0 1.25rem 1.5rem; list-style-type: disc; }
  .prose :global(ol) { margin: 0.5rem 0 1.25rem 1.5rem; list-style-type: decimal; }
  .prose :global(li) { font-size: 0.95rem; color: #bac5d0; line-height: 1.8; margin-bottom: 0.3rem; }
  .prose :global(li::marker) { color: #6d7a88; }
  .prose :global(code) { font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace; font-size: 0.82em; color: #f5bf63; background: #273241; padding: 0.15em 0.4em; border-radius: 4px; }
  .prose :global(pre) { position: relative; background: #1c232c; border: 1px solid #36414d; padding: 1.25rem; padding-top: 3rem; border-radius: 8px; overflow-x: auto; margin: 1.25rem 0; }
  .prose :global(pre code) { display: block; background: none; padding: 0; color: #e8edf2; font-size: 0.85rem; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; }
  .prose :global(.code-block-meta) { position: absolute; top: 0.8rem; left: 0.8rem; display: flex; align-items: center; gap: 0.5rem; }
  .prose :global(.code-language-label) { border: 1px solid #465262; border-radius: 999px; background: rgba(28, 35, 44, 0.94); color: #b2bcc6; padding: 0.35rem 0.75rem; font-size: 0.7rem; line-height: 1; text-transform: lowercase; }
  .prose :global(.table-wrapper) { overflow-x: auto; margin: 1.25rem 0; }
  .prose :global(table) { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .prose :global(thead) { border-bottom: 2px solid #465262; }
  .prose :global(th) { color: #eef2f6; font-weight: 600; text-align: left; padding: 0.6rem 1rem; background: #1c232c; }
  .prose :global(td) { color: #bac5d0; padding: 0.6rem 1rem; border-bottom: 1px solid #36414d; }
  .prose :global(tr:hover td) { background: rgba(52, 61, 71, 0.32); }
  .prose :global(th:first-child), .prose :global(td:first-child) { border-radius: 6px 0 0 6px; }
  .prose :global(th:last-child), .prose :global(td:last-child) { border-radius: 0 6px 6px 0; }
  .prose :global(blockquote) { border-left: 2px solid #f59e0b; padding-left: 1.25rem; color: #8f9aa7; margin: 1.25rem 0; font-style: italic; }
  .prose :global(blockquote p) { margin-bottom: 0.5rem; }
  .prose :global(hr) { border: none; border-top: 1px solid #36414d; margin: 2rem 0; }
  .prose :global(img) { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #36414d; margin: 1.5rem 0; }
  .prose :global(input[type="checkbox"]) { appearance: none; width: 1rem; height: 1rem; border: 1.5px solid #6d7a88; border-radius: 3px; background: transparent; vertical-align: middle; margin-right: 0.5rem; position: relative; top: -1px; }
  .prose :global(input[type="checkbox"]:checked) { background: #f59e0b; border-color: #f59e0b; }
  .prose :global(input[type="checkbox"]:checked::after) { content: '✓'; color: #0a0e17; font-size: 0.7rem; position: absolute; top: -1px; left: 2px; }
  .prose :global(.code-copy-button) { position: absolute; top: 0.8rem; right: 0.8rem; border: 1px solid #465262; border-radius: 999px; background: rgba(28, 35, 44, 0.94); color: #d2dae2; padding: 0.35rem 0.75rem; font-size: 0.7rem; line-height: 1; cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease; }
  .prose :global(.code-copy-button:hover) { border-color: #f59e0b; color: #f8fafc; background: rgba(52, 61, 71, 0.96); }
</style>
