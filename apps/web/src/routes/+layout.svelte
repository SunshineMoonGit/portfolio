<script lang="ts">
  import { base } from '$app/paths'
  import '../app.css'
  import { onMount } from 'svelte'
  import { onNavigate } from '$app/navigation'
  import { page } from '$app/state'
  import { AppFooter, AppHeader, SearchModal } from '$lib'
  import { withBase } from '$lib/utils'

  let { children } = $props()
  let searchOpen = $state(false)
  let navEl: HTMLElement | undefined = $state()
  let isHome = $derived((page.url.pathname === base || page.url.pathname === base + '/') || page.url.pathname === '/')
  let activePath = $derived(base && page.url.pathname.startsWith(base) ? page.url.pathname.slice(base.length) || '/' : page.url.pathname)
  let isWide = $derived(
    activePath === '/projects' || activePath === '/projects/' ||
    activePath === '/notes' || activePath === '/notes/'
  )

  onMount(() => {
    const onScroll = () => {
      if (!navEl) return
      navEl.classList.toggle('scrolled', window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  })

  onNavigate((navigation) => {
    if (!document.startViewTransition) return
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })

</script>

<svelte:window onkeydown={(e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchOpen = !searchOpen
  }
}} />

<SearchModal bind:open={searchOpen} />

<svelte:head>
  <link rel="icon" type="image/png" href={withBase('/favicon.png')} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class={isHome ? '' : 'pt-16'}>
  <AppHeader bind:navEl onsearch={() => (searchOpen = true)} />

  <main class={isHome ? '' : isWide ? 'mx-auto max-w-[960px] px-6 pb-24' : 'mx-auto max-w-[680px] px-6 pb-24'}>
    {@render children()}
  </main>

  {#if !isHome}
    <AppFooter />
  {/if}
</div>
