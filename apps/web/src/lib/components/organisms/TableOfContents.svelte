<script lang="ts">
  import { onMount } from 'svelte'

  let {
    proseEl
  }: {
    proseEl?: HTMLElement
  } = $props()

  type TocItem = { id: string; text: string; level: number }

  let items: TocItem[] = $state([])
  let activeId = $state('')

  $effect(() => {
    if (!proseEl) return
    const headings = proseEl.querySelectorAll('h1, h2, h3')
    const result: TocItem[] = []
    headings.forEach((el, i) => {
      const id = el.id || `heading-${i}`
      if (!el.id) el.id = id
      result.push({
        id,
        text: el.textContent?.trim() || '',
        level: parseInt(el.tagName[1])
      })
    })
    items = result
  })

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeId = entry.target.id
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    $effect(() => {
      if (!proseEl) return
      const headings = proseEl.querySelectorAll('h1, h2, h3')
      headings.forEach((el) => observer.observe(el))
      return () => headings.forEach((el) => observer.unobserve(el))
    })

    return () => observer.disconnect()
  })

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
</script>

{#if items.length > 2}
  <nav class="toc" aria-label="Table of contents">
    <p class="text-[0.65rem] font-semibold text-subtle uppercase tracking-wider mb-3">On this page</p>
    <ul class="flex flex-col gap-1">
      {#each items as item}
        <li>
          <button
            onclick={() => scrollTo(item.id)}
            class="toc-item cursor-pointer text-left w-full truncate transition-colors duration-200"
            class:active={activeId === item.id}
            style:padding-left="{(item.level - 1) * 12}px"
          >
            {item.text}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    position: fixed;
    top: 100px;
    right: calc((100vw - 680px) / 2 - 260px);
    width: 220px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .toc::-webkit-scrollbar {
    display: none;
  }

  .toc-item {
    font-size: 0.7rem;
    line-height: 1.5;
    padding: 3px 8px;
    color: var(--color-subtle);
    border-left: 2px solid transparent;
    border-radius: 0 4px 4px 0;
  }

  .toc-item:hover {
    color: var(--color-text);
  }

  .toc-item.active {
    color: var(--color-gold);
    border-left-color: var(--color-gold);
    background: rgba(215, 164, 73, 0.06);
  }

  @media (max-width: 1280px) {
    .toc {
      display: none;
    }
  }
</style>
