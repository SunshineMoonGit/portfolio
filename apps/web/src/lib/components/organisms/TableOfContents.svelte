<script lang="ts">
  import { onMount } from 'svelte'

  let {
    proseEl,
    contentKey = '',
    className = ''
  }: {
    proseEl?: HTMLElement
    contentKey?: string
    className?: string
  } = $props()

  type TocItem = { id: string; text: string; level: number }

  let items: TocItem[] = $state([])
  let activeId = $state('')

  $effect(() => {
    contentKey
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
    activeId = result[0]?.id ?? ''
  })

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))

        if (visible.length) {
          activeId = visible[0].target.id
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    $effect(() => {
      contentKey
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
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
    }
  }
</script>

{#if items.length > 2}
  <nav aria-label="Table of contents" class={`space-y-2.5 ${className}`.trim()}>
    <p class="text-[0.67rem] font-semibold uppercase tracking-[0.2em] text-text-dim/70">On this page</p>
    <ul class="flex flex-col">
      {#each items as item}
        <li>
          <button
            type="button"
            onclick={() => scrollTo(item.id)}
            aria-current={activeId === item.id ? 'location' : undefined}
            class="toc-item w-full cursor-pointer truncate text-left transition-colors duration-150"
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
  .toc-item {
    font-size: 0.72rem;
    line-height: 1.6;
    padding-top: 3px;
    padding-bottom: 3px;
    padding-right: 6px;
    padding-left: 8px;
    color: var(--color-subtle);
    border-left: 1.5px solid transparent;
    border-radius: 0 3px 3px 0;
  }

  .toc-item:hover {
    color: var(--color-text);
  }

  .toc-item.active {
    color: var(--color-gold);
    border-left-color: var(--color-gold);
    background: rgba(215, 164, 73, 0.05);
  }
</style>
