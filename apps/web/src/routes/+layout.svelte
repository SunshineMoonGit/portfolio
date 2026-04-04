<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import { onMount } from 'svelte'
  import { onNavigate } from '$app/navigation'
  import { AppFooter, AppHeader } from '$lib'

  let { children } = $props()
  let navEl: HTMLElement | undefined = $state()

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

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="pt-16">
  <AppHeader bind:navEl />

  <main class="mx-auto max-w-[680px] px-6 pb-24">
    {@render children()}
  </main>

  <AppFooter />
</div>
