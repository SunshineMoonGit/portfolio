import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CategoryNode } from '@portfolio/content-types'

const ROOT = path.resolve(import.meta.dirname, '..')
const VAULT_SOURCE_DIR = process.env.VAULT_SOURCE_DIR
	? path.resolve(ROOT, process.env.VAULT_SOURCE_DIR)
	: path.join(ROOT, 'vault')
const NOTES_DIR = path.join(VAULT_SOURCE_DIR, 'public', 'notes')
const PROJECTS_DIR = path.join(VAULT_SOURCE_DIR, 'public', 'project')
const PROFILE_PATH = path.join(VAULT_SOURCE_DIR, 'public', 'profile.json')
const OUTPUT_DIR = path.join(ROOT, 'apps', 'web', 'src', 'lib', 'generated')

type LinkRef = {
	slug: string
	title: string
}

type NoteRecord = {
	slug: string
	title: string
	category: string
	tags: string[]
	summary: string
	thumbnail: string
	created: string
	updated: string
	sourcePath: string
	content: string
	prev: LinkRef | null
	next: LinkRef | null
}

type ProjectRecord = {
	slug: string
	name: string
	title: string
	subtitle: string
	description: string
	period: string
	image: string
	techs: string[]
	url: string
	content: string
}

type SearchRecord = {
	slug: string
	title: string
	category: string
	tags: string[]
	summary: string
	content?: string
	sourcePath?: string
	kind: 'note' | 'project'
}

type RelationsRecord = {
	notes: Record<
		string,
		{
			related: Array<{ slug: string; title: string; score: number; reason: string }>
			backlinks: Array<{ fromSlug: string; fromTitle: string; toSlug: string; toTitle: string; context?: string }>
			outgoing: string[]
		}
	>
}

type ProfileRecord = {
	name: string
	headline: string
	interests: string[]
	projects: Array<{
		name: string
		description: string
		period?: string
		techs: string[]
		url: string
	}>
}

function normalizeWhitespace(value: string): string {
	return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

function stripQuotes(value: string): string {
	return value.replace(/^['"](.*)['"]$/, '$1')
}

function normalizeTag(value: string): string {
	const trimmed = value.trim()
	return /^[a-z0-9-]+$/i.test(trimmed) ? trimmed.toLowerCase() : trimmed
}

function parseList(value: string): string[] {
	return value
		.replace(/^\[/, '')
		.replace(/\]$/, '')
		.split(',')
		.map((item) => normalizeTag(stripQuotes(item.trim())))
		.filter(Boolean)
}

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; content: string } {
	const trimmed = raw.trimStart()
	if (!trimmed.startsWith('---')) {
		return { meta: {}, content: raw.trim() }
	}

	const end = trimmed.indexOf('\n---', 3)
	if (end === -1) {
		return { meta: {}, content: raw.trim() }
	}

	const metaBlock = trimmed.slice(3, end).trim()
	const content = trimmed.slice(end + 4).trim()
	const meta: Record<string, unknown> = {}

	for (const line of metaBlock.split('\n')) {
		const separator = line.indexOf(':')
		if (separator === -1) continue
		const key = line.slice(0, separator).trim()
		const rawValue = line.slice(separator + 1).trim()
		if (!rawValue) continue
		meta[key] = rawValue.startsWith('[') && rawValue.endsWith(']')
			? parseList(rawValue)
			: stripQuotes(rawValue)
	}

	return { meta, content }
}

function slugifyNote(filename: string): string {
	return path.basename(filename, path.extname(filename)).trim().toLowerCase()
}

function slugifyProject(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9가-힣]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
}

function projectSlug(meta: Record<string, unknown>, file: string): string {
	const explicit = typeof meta.slug === 'string' ? meta.slug.trim() : ''
	if (explicit) return slugifyProject(explicit)

	const title = typeof meta.title === 'string' ? meta.title : ''
	return slugifyProject(title || path.basename(file, '.md'))
}

function normalizeProjectKey(value: string): string {
	return value.trim().toLowerCase()
}

function normalizeCategoryPath(value: string): string {
	return value
		.split('/')
		.map((segment) => segment.trim().toLowerCase())
		.filter(Boolean)
		.join('/')
}

function buildCategoryTree(notes: NoteRecord[]): CategoryNode[] {
	type MutableNode = {
		path: string
		segment: string
		depth: number
		children: Map<string, MutableNode>
		directCount: number
	}

	const roots = new Map<string, MutableNode>()

	for (const note of notes) {
		const segments = note.category.split('/').filter(Boolean)
		if (segments.length === 0) continue

		let currentLevel = roots
		let pathAccumulator = ''

		segments.forEach((segment, index) => {
			pathAccumulator = pathAccumulator ? `${pathAccumulator}/${segment}` : segment
			let node = currentLevel.get(segment)
			if (!node) {
				node = {
					path: pathAccumulator,
					segment,
					depth: index,
					children: new Map(),
					directCount: 0
				}
				currentLevel.set(segment, node)
			}
			if (index === segments.length - 1) {
				node.directCount += 1
			}
			currentLevel = node.children
		})
	}

	function finalize(node: MutableNode): CategoryNode {
		const children = [...node.children.values()]
			.sort((a, b) => a.segment.localeCompare(b.segment))
			.map(finalize)
		const descendantCount = children.reduce((sum, child) => sum + child.totalCount, 0)
		return {
			path: node.path,
			segment: node.segment,
			depth: node.depth,
			children,
			directCount: node.directCount,
			totalCount: node.directCount + descendantCount
		}
	}

	return [...roots.values()]
		.sort((a, b) => a.segment.localeCompare(b.segment))
		.map(finalize)
}

function stripMarkdown(content: string): string {
	return normalizeWhitespace(
		content
			.replace(/^#+\s+/gm, '')
			.replace(/```[\s\S]*?```/g, ' ')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/<[^>]+>/g, ' ')
			.replace(/^\s*[-*]\s+/gm, '')
			.replace(/^\s*\d+\.\s+/gm, '')
			.replace(/[*_~]+/g, '')
			.replace(/^\|.*\|$/gm, '')
			.replace(/^\s*[-|:]+\s*$/gm, '')
	)
}

function excerpt(content: string, maxLength = 140): string {
	const plain = stripMarkdown(content)
	return plain.length <= maxLength ? plain : `${plain.slice(0, maxLength).trim()}...`
}

function scoreRelated(source: NoteRecord, candidate: NoteRecord): { score: number; reason: string } | null {
	if (source.slug === candidate.slug) return null

	const sharedTags = source.tags.filter((tag) => candidate.tags.includes(tag))
	let score = sharedTags.length * 3
	let reason = sharedTags.length ? `shared tags: ${sharedTags.join(', ')}` : ''

	if (source.category === candidate.category) {
		score += 2
		reason ||= `same category: ${source.category}`
	}

	if (!score) return null
	return { score, reason }
}

function extractLinkedSlugs(content: string, noteSlugLookup: Map<string, string>): string[] {
	const matches = new Set<string>()

	for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
		const target = match[1]?.split('|')[0]?.trim()
		if (!target) continue
		const normalized = slugifyNote(target)
		const slug = noteSlugLookup.get(normalized)
		if (slug) matches.add(slug)
	}

	for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
		const target = match[1]?.trim()
		if (!target) continue
		if (target.startsWith('/notes/')) {
			matches.add(target.replace('/notes/', '').replace(/\/$/, ''))
			continue
		}

		if (target.endsWith('.md')) {
			const normalized = slugifyNote(target)
			const slug = noteSlugLookup.get(normalized)
			if (slug) matches.add(slug)
		}
	}

	return [...matches]
}

async function readJson<T>(filePath: string): Promise<T> {
	return JSON.parse(await readFile(filePath, 'utf-8')) as T
}

async function pathExists(targetPath: string): Promise<boolean> {
	try {
		await access(targetPath)
		return true
	} catch {
		return false
	}
}

async function loadProfile(): Promise<ProfileRecord> {
	if (!(await pathExists(PROFILE_PATH))) {
		throw new Error(`Profile not found: ${PROFILE_PATH}`)
	}
	return readJson<ProfileRecord>(PROFILE_PATH)
}

async function loadNotes(): Promise<NoteRecord[]> {
	const entries = await readdir(NOTES_DIR)
	const markdownFiles = entries.filter((entry) => entry.endsWith('.md') && !entry.startsWith('_')).sort()
	const noteSlugLookup = new Map<string, string>()
	const rawNotes: Array<Omit<NoteRecord, 'prev' | 'next'>> = []

	for (const file of markdownFiles) {
		const filePath = path.join(NOTES_DIR, file)
		const raw = await readFile(filePath, 'utf-8')
		const fileStat = await stat(filePath)
		const { meta, content } = parseFrontmatter(raw)
		const title = String(meta.title ?? path.basename(file, '.md'))
		const slug = String(meta.slug ?? slugifyNote(file))
		const tags = Array.isArray(meta.tags)
			? meta.tags.map((tag) => normalizeTag(String(tag))).filter(Boolean)
			: []

		const rawCategory = typeof meta.category === 'string' ? meta.category.trim() : ''
		if (!rawCategory) {
			throw new Error(
				`[build-content] ${file} is missing \`category\`. Every note must declare a path-style category (e.g. "ai/rag").`
			)
		}
		const category = normalizeCategoryPath(rawCategory)
		if (!category) {
			throw new Error(`[build-content] ${file} has an empty \`category\` after normalization.`)
		}

		const normalizedContent = normalizeWhitespace(content)

		noteSlugLookup.set(slugifyNote(file), slug)
		noteSlugLookup.set(slugifyNote(slug), slug)

		const fallbackDate = fileStat.mtime.toISOString().slice(0, 10)

		rawNotes.push({
			slug,
			title,
			category,
			tags,
			summary: String(meta.summary ?? excerpt(normalizedContent)),
			thumbnail: String(meta.thumbnail ?? ''),
			created: String(meta.created ?? fallbackDate),
			updated: String(meta.updated ?? fallbackDate),
			sourcePath: path.posix.join('notes', file),
			content: normalizedContent
		})
	}

	rawNotes.sort((a, b) => b.created.localeCompare(a.created) || a.slug.localeCompare(b.slug))

	return rawNotes.map((note, index, list) => ({
		...note,
		prev: index > 0 ? { slug: list[index - 1].slug, title: list[index - 1].title } : null,
		next: index < list.length - 1 ? { slug: list[index + 1].slug, title: list[index + 1].title } : null
	}))
}

async function loadProjects(profile: ProfileRecord): Promise<ProjectRecord[]> {
	const entries = await readdir(PROJECTS_DIR)
	const markdownFiles = entries.filter((entry) => entry.endsWith('.md') && !entry.startsWith('_')).sort()
	const profileProjectMap = new Map(profile.projects.map((project) => [normalizeProjectKey(project.name), project]))
	const projects: ProjectRecord[] = []

	for (const file of markdownFiles) {
		const raw = await readFile(path.join(PROJECTS_DIR, file), 'utf-8')
		const { meta, content } = parseFrontmatter(raw)
		const name = String(meta.title ?? path.basename(file, '.md'))
		const profileProject = profileProjectMap.get(normalizeProjectKey(name))
		const slug = projectSlug(meta, file)

		projects.push({
			slug,
			name,
			title: String(meta.title ?? name),
			subtitle: String(meta.subtitle ?? ''),
			description: String(meta.description ?? profileProject?.description ?? excerpt(content)),
			period: String(meta.period ?? profileProject?.period ?? ''),
			image: String(meta.image ?? ''),
			techs: profileProject?.techs ?? [],
			url: profileProject?.url ?? '',
			content: normalizeWhitespace(content)
		})
	}

	return projects
}

function buildSearchIndex(notes: NoteRecord[], projects: ProjectRecord[]): SearchRecord[] {
	return [
		...notes.map((note) => ({
			slug: note.slug,
			title: note.title,
			category: note.category,
			tags: note.tags,
			summary: note.summary,
			content: stripMarkdown(note.content),
			sourcePath: note.sourcePath,
			kind: 'note' as const
		})),
		...projects.map((project) => ({
			slug: project.slug,
			title: project.title,
			category: 'project',
			tags: project.techs,
			summary: project.description,
			content: stripMarkdown(project.content),
			sourcePath: `project/${project.name}.md`,
			kind: 'project' as const
		}))
	]
}

function buildRelations(notes: NoteRecord[]): RelationsRecord {
	const noteMap = new Map(notes.map((note) => [note.slug, note]))
	const noteSlugLookup = new Map<string, string>()
	for (const note of notes) {
		noteSlugLookup.set(slugifyNote(note.slug), note.slug)
		noteSlugLookup.set(slugifyNote(note.title), note.slug)
	}

	const relations: RelationsRecord = { notes: {} }
	const backlinks: RelationsRecord['notes'] = {}

	for (const note of notes) {
		backlinks[note.slug] = { related: [], backlinks: [], outgoing: [] }
	}

	for (const note of notes) {
		const outgoing = extractLinkedSlugs(note.content, noteSlugLookup)
		const related = notes
			.map((candidate) => {
				const scored = scoreRelated(note, candidate)
				if (!scored) return null
				return {
					slug: candidate.slug,
					title: candidate.title,
					score: scored.score,
					reason: scored.reason
				}
			})
			.filter((value): value is { slug: string; title: string; score: number; reason: string } => Boolean(value))
			.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
			.slice(0, 5)

		relations.notes[note.slug] = {
			related,
			backlinks: [],
			outgoing
		}

		for (const targetSlug of outgoing) {
			const target = noteMap.get(targetSlug)
			if (!target) continue
			backlinks[targetSlug].backlinks.push({
				fromSlug: note.slug,
				fromTitle: note.title,
				toSlug: targetSlug,
				toTitle: target.title
			})
		}
	}

	for (const note of notes) {
		relations.notes[note.slug].backlinks = backlinks[note.slug].backlinks
	}

	return relations
}

async function writeGeneratedJson(filename: string, value: unknown): Promise<void> {
	await mkdir(OUTPUT_DIR, { recursive: true })
	await writeFile(path.join(OUTPUT_DIR, filename), `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

async function main() {
	const hasNotesDir = await pathExists(NOTES_DIR)
	const hasProjectsDir = await pathExists(PROJECTS_DIR)

	if (!hasNotesDir || !hasProjectsDir) {
		console.log(`Vault sources are absent at "${VAULT_SOURCE_DIR}". Keeping existing generated content artifacts.`)
		return
	}

	const profile = await loadProfile()
	const notes = await loadNotes()
	const projects = await loadProjects(profile)
	const searchIndex = buildSearchIndex(notes, projects)
	const relations = buildRelations(notes)
	const categoryTree = buildCategoryTree(notes)

	await Promise.all([
		writeGeneratedJson('profile.json', profile),
		writeGeneratedJson('notes.json', notes),
		writeGeneratedJson('projects.json', projects),
		writeGeneratedJson('search-index.json', searchIndex),
		writeGeneratedJson('relations.json', relations),
		writeGeneratedJson('category-tree.json', categoryTree)
	])

	console.log(
		`Generated ${notes.length} notes, ${projects.length} projects, ${searchIndex.length} search documents, ${categoryTree.length} root categories.`
	)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
