<script lang="ts">
  import { page } from '$app/state'
  import { base } from '$app/paths'
  import { site } from '$lib/config'

  let {
    title = site.name,
    description = 'Backend, Security, Infra에 관심 있는 개발자 sunshinemoon의 포트폴리오.',
    image = '',
    type = 'website' as 'website' | 'article',
  }: {
    title?: string
    description?: string
    image?: string
    type?: 'website' | 'article'
  } = $props()

  let canonicalUrl = $derived(`${site.url}${page.url.pathname}`)
  let ogImage = $derived(image || `${site.url}${base}/favicon.png`)
  let fullTitle = $derived(title === site.name ? title : `${title} · ${site.name}`)
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph -->
  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:locale" content="ko_KR" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>
