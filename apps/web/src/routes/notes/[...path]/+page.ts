import { redirect } from '@sveltejs/kit'
import { getCategoryTree, getNoteBySlug, getNoteDetails } from '$lib'
import type { CategoryNode } from '@portfolio/content-types'

function collectAllPaths(nodes: CategoryNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    acc.push(node.path)
    if (node.children.length) collectAllPaths(node.children, acc)
  }
  return acc
}

export function entries() {
  const categoryPaths = collectAllPaths(getCategoryTree())
  const legacyNoteSlugs = getNoteDetails().map((note) => note.slug)
  const unique = new Set<string>([...categoryPaths, ...legacyNoteSlugs])
  return [...unique].map((path) => ({ path }))
}

export function load({ params }) {
  // SvelteKit's trailingSlash config adds a trailing slash to prerendered
  // rest params, so `ai/rag` comes in as `ai/rag/`. Normalize before matching.
  const path = (params.path ?? '').replace(/\/+$/, '').replace(/^\/+/, '') || null

  if (!path) {
    return { selectedPath: null }
  }

  // Known category path → show filtered list
  const categoryPaths = new Set(collectAllPaths(getCategoryTree()))
  if (categoryPaths.has(path)) {
    return { selectedPath: path }
  }

  // Legacy URL: /notes/<slug> used to be the detail page before the restructure.
  // Redirect single-segment paths that resolve to a known note slug.
  // encodeURIComponent is required because slugs may contain non-ASCII characters
  // (e.g. `rag-한계와-보완`) and Location headers must be ASCII.
  if (!path.includes('/') && getNoteBySlug(path)) {
    throw redirect(301, `/note/${encodeURIComponent(path)}`)
  }

  // Unknown path — render empty state so the sidebar still works.
  return { selectedPath: path }
}
