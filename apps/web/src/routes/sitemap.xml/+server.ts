import { getProjectDetails, getNoteDetails } from '$lib'

const SITE_URL = 'https://sunshinemoon.cloud'

export const prerender = true

export function GET() {
  const projects = getProjectDetails()
  const notes = getNoteDetails()

  const staticPages = ['', '/projects', '/notes']

  const urls = [
    ...staticPages.map((path) => `
    <url>
      <loc>${SITE_URL}${path}/</loc>
      <changefreq>${path === '' ? 'weekly' : 'weekly'}</changefreq>
      <priority>${path === '' ? '1.0' : '0.8'}</priority>
    </url>`),
    ...projects.map((p) => `
    <url>
      <loc>${SITE_URL}/projects/${p.slug}/</loc>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`),
    ...notes.map((n) => `
    <url>
      <loc>${SITE_URL}/notes/${n.slug}/</loc>
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
