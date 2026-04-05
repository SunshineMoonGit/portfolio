import Fuse from 'fuse.js'
import type { FuseResultMatch } from 'fuse.js'
import searchIndexData from './generated/search-index.json'
import type { SearchDocument } from '@portfolio/content-types'

const searchIndex = searchIndexData as SearchDocument[]

const fuse = new Fuse(searchIndex, {
	keys: [
		{ name: 'title', weight: 6 },
		{ name: 'tags', weight: 4 },
		{ name: 'summary', weight: 3 },
		{ name: 'category', weight: 2 },
		{ name: 'content', weight: 1 }
	],
	threshold: 0.3,
	includeScore: true,
	includeMatches: true,
	minMatchCharLength: 2,
	ignoreLocation: true
})

export interface SearchResult {
	document: SearchDocument
	score: number
	matches: readonly FuseResultMatch[]
}

export interface SearchFilters {
	kind?: 'note' | 'project'
	category?: string
	tags?: string[]
}

function applyFilters(docs: SearchDocument[], filters?: SearchFilters): SearchDocument[] {
	if (!filters) return docs
	let result = docs
	if (filters.kind) result = result.filter((d) => d.kind === filters.kind)
	if (filters.category) result = result.filter((d) => d.category === filters.category)
	if (filters.tags?.length) result = result.filter((d) => filters.tags!.some((t) => d.tags.includes(t)))
	return result
}

export function searchDocuments(query: string, filters?: SearchFilters): SearchResult[] {
	const normalized = query.trim()

	if (!normalized) {
		const filtered = applyFilters(searchIndex, filters)
		return filtered.map((document) => ({ document, score: 0, matches: [] }))
	}

	const results = fuse.search(normalized)

	const mapped: SearchResult[] = results.map((r) => ({
		document: r.item,
		score: 1 - (r.score ?? 1),
		matches: r.matches ?? []
	}))

	if (!filters) return mapped

	return mapped.filter((r) => {
		const d = r.document
		if (filters.kind && d.kind !== filters.kind) return false
		if (filters.category && d.category !== filters.category) return false
		if (filters.tags?.length && !filters.tags.some((t) => d.tags.includes(t))) return false
		return true
	})
}

export function getSearchIndex(): SearchDocument[] {
	return searchIndex
}

export function getAllCategories(): string[] {
	const set = new Set(searchIndex.map((d) => d.category))
	return [...set].sort()
}

export function getAllTags(): { tag: string; count: number }[] {
	const counts = new Map<string, number>()
	for (const doc of searchIndex) {
		for (const tag of doc.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count)
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlightByIndices(text: string, indices: readonly [number, number][]): string {
	if (!indices.length) return escapeHtml(text)

	const sorted = [...indices].sort((a, b) => a[0] - b[0])
	const merged: [number, number][] = []

	for (const [start, end] of sorted) {
		const last = merged[merged.length - 1]
		if (last && start <= last[1] + 1) {
			last[1] = Math.max(last[1], end)
		} else {
			merged.push([start, end])
		}
	}

	let result = ''
	let cursor = 0

	for (const [start, end] of merged) {
		result += escapeHtml(text.slice(cursor, start))
		result += `<mark class="bg-gold/20 text-gold rounded-sm px-0.5">${escapeHtml(text.slice(start, end + 1))}</mark>`
		cursor = end + 1
	}

	result += escapeHtml(text.slice(cursor))
	return result
}

export function getSnippet(matches: readonly FuseResultMatch[]): { text: string; indices: readonly [number, number][] } | null {
	const contentMatch = matches.find((m) => m.key === 'content')
	if (!contentMatch?.value || !contentMatch.indices.length) return null

	const content = contentMatch.value
	const firstIdx = contentMatch.indices[0]
	const matchStart = firstIdx[0]
	const matchEnd = firstIdx[1]

	const snippetStart = Math.max(0, matchStart - 60)
	const snippetEnd = Math.min(content.length, matchEnd + 60)
	const text = (snippetStart > 0 ? '...' : '') + content.slice(snippetStart, snippetEnd) + (snippetEnd < content.length ? '...' : '')

	const adjustedIndices: [number, number][] = contentMatch.indices
		.filter(([s, e]) => s >= snippetStart && e <= snippetEnd)
		.map(([s, e]) => [s - snippetStart + (snippetStart > 0 ? 3 : 0), e - snippetStart + (snippetStart > 0 ? 3 : 0)])

	return { text, indices: adjustedIndices }
}
