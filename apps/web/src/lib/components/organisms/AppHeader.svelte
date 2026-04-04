<script lang="ts">
  import { base } from '$app/paths'
  import { page } from '$app/state'

  let { navEl = $bindable() }: { navEl?: HTMLElement } = $props()

  let mobileOpen = $state(false)
  let pathname = $derived(page.url.pathname)
  let activePath = $derived(base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname)

  function withBase(path: string): string {
    return `${base}${path}`
  }

  function toggleMobile() {
    mobileOpen = !mobileOpen
  }

  function closeMobile() {
    mobileOpen = false
  }
</script>

<nav
  bind:this={navEl}
  class="fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-[clamp(1.5rem,4vw,3rem)] py-5 bg-transparent transition-[background] duration-300"
>
  <a href={base || '/'} class="brand-mark text-sm font-semibold tracking-tight hover:text-gold">sunshinemoon</a>

  <!-- Mobile hamburger button -->
  <button
    onclick={toggleMobile}
    class="sm:hidden flex flex-col gap-[5px] cursor-pointer p-1"
    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
  >
    <span class="hamburger-line {mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}"></span>
    <span class="hamburger-line {mobileOpen ? 'opacity-0' : ''}"></span>
    <span class="hamburger-line {mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}"></span>
  </button>

  <!-- Desktop nav -->
  <div class="hidden sm:flex items-center gap-6 text-[0.85rem] text-muted">
    <a href={withBase('/projects')} class="hover:text-text {activePath.startsWith('/projects') ? 'text-gold' : ''}">Projects</a>
    <a href={withBase('/notes')} class="hover:text-text {activePath.startsWith('/notes') ? 'text-gold' : ''}">Notes</a>
    <a href="https://github.com/SunshineMoonGit" target="_blank" rel="noopener noreferrer" class="hover:text-text">GitHub ↗</a>
  </div>
</nav>

<!-- Mobile overlay menu -->
{#if mobileOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="mobile-overlay" onclick={closeMobile} onkeydown={(e) => e.key === 'Escape' && closeMobile()}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="mobile-menu" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <a href={withBase('/projects')} class="mobile-link {activePath.startsWith('/projects') ? 'text-gold!' : ''}" onclick={closeMobile}>Projects</a>
      <a href={withBase('/notes')} class="mobile-link {activePath.startsWith('/notes') ? 'text-gold!' : ''}" onclick={closeMobile}>Notes</a>
      <a href="https://github.com/SunshineMoonGit" target="_blank" rel="noopener noreferrer" class="mobile-link" onclick={closeMobile}>GitHub ↗</a>
    </div>
  </div>
{/if}

<style>
  .brand-mark {
    color: var(--color-text-bright);
    text-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
  }

  :global(nav.scrolled) {
    background: rgba(22, 26, 31, 0.88) !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .hamburger-line {
    display: block;
    width: 20px;
    height: 2px;
    background: var(--color-text);
    border-radius: 1px;
    transition: all 0.3s ease;
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }

  .mobile-menu {
    position: absolute;
    top: 60px;
    right: 16px;
    left: 16px;
    background: var(--color-dark-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 8px 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .mobile-link {
    display: block;
    padding: 12px 20px;
    font-size: 0.9rem;
    color: var(--color-text);
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }

  .mobile-link:hover {
    color: var(--color-gold);
    background: rgba(255, 255, 255, 0.04);
  }
</style>
