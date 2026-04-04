<script lang="ts">
  import { browser } from '$app/environment'
  import { env } from '$env/dynamic/public'
  import { onMount } from 'svelte'

  let { term }: { term?: string } = $props()

  let container: HTMLDivElement | undefined = $state()

  const config = {
    repo: env.PUBLIC_GISCUS_REPO,
    repoId: env.PUBLIC_GISCUS_REPO_ID,
    category: env.PUBLIC_GISCUS_CATEGORY,
    categoryId: env.PUBLIC_GISCUS_CATEGORY_ID,
    mapping: env.PUBLIC_GISCUS_MAPPING || 'pathname',
    strict: env.PUBLIC_GISCUS_STRICT || '0',
    reactionsEnabled: env.PUBLIC_GISCUS_REACTIONS_ENABLED || '1',
    inputPosition: env.PUBLIC_GISCUS_INPUT_POSITION || 'bottom',
    lang: env.PUBLIC_GISCUS_LANG || 'ko',
    theme: env.PUBLIC_GISCUS_THEME || 'dark'
  }

  const enabled = Boolean(config.repo && config.repoId && config.category && config.categoryId)

  onMount(() => {
    if (!browser || !enabled || !container) return
    if (!config.repo || !config.repoId || !config.category || !config.categoryId) return

    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', config.repo)
    script.setAttribute('data-repo-id', config.repoId)
    script.setAttribute('data-category', config.category)
    script.setAttribute('data-category-id', config.categoryId)
    script.setAttribute('data-mapping', term ? 'specific' : config.mapping)
    script.setAttribute('data-term', term ?? '')
    script.setAttribute('data-strict', config.strict)
    script.setAttribute('data-reactions-enabled', config.reactionsEnabled)
    script.setAttribute('data-input-position', config.inputPosition)
    script.setAttribute('data-lang', config.lang)
    script.setAttribute('data-theme', config.theme)
    container.appendChild(script)
  })
</script>

{#if enabled}
  <div bind:this={container} class="mt-12"></div>
{/if}
