import searchIndexData from './generated/search-index.json'
import type { SearchDocument } from '@portfolio/content-types'

const searchIndex = searchIndexData as SearchDocument[]

function scoreDocument(document: SearchDocument, query: string): number {
  let score = 0

  if (document.title.toLowerCase().includes(query)) score += 6
  if (document.summary.toLowerCase().includes(query)) score += 3
  if (document.category.toLowerCase().includes(query)) score += 2
  if (document.tags.some((tag) => tag.toLowerCase().includes(query))) score += 4
  if (document.content?.toLowerCase().includes(query)) score += 1

  return score
}

export function getSearchIndex(): SearchDocument[] {
  return searchIndex
}

export function searchDocuments(query: string): SearchDocument[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return searchIndex

  return searchIndex
    .map((document) => ({ document, score: scoreDocument(document, normalized) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.document.title.localeCompare(right.document.title))
    .map((entry) => entry.document)
}
