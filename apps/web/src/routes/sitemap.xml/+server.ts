import { getProjectDetails, getNoteDetails } from '$lib'
import { site } from '$lib/config'

export const prerender = true

export function GET() {
  const projects = getProjectDetails()
  const notes = getNoteDetails()

  const staticPages = ['', '/projects', '/notes']

  const urls = [
    ...staticPages.map((path) => `
    <url>
      <loc>${site.url}${path}/</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : '0.8'}</priority>
    </url>`),
    ...projects.map((p) => `
    <url>
      <loc>${site.url}/projects/${p.slug}/</loc>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`),
    ...notes.map((n) => `
    <url>
      <loc>${site.url}/note/${n.slug}/</loc>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`

  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600',
    },
  })
}
