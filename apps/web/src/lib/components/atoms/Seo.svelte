<script lang="ts">
  import { page } from '$app/state'
  import { base } from '$app/paths'

  let {
    title = 'sunshinemoon',
    description = 'Backend, Security, Infra에 관심 있는 개발자 sunshinemoon의 포트폴리오.',
    image = '',
    type = 'website' as 'website' | 'article',
  }: {
    title?: string
    description?: string
    image?: string
    type?: 'website' | 'article'
  } = $props()

  const SITE_NAME = 'sunshinemoon'
  const SITE_URL = 'https://sunshinemoon.cloud'

  let canonicalUrl = $derived(`${SITE_URL}${page.url.pathname}`)
  let ogImage = $derived(image || `${SITE_URL}${base}/favicon.png`)
  let fullTitle = $derived(title === SITE_NAME ? title : `${title} · ${SITE_NAME}`)
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
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:locale" content="ko_KR" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>
