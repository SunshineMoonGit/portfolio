export interface NoteIndex {
  slug: string
  title: string
  category: string
  tags: string[]
  summary: string
  thumbnail: string
  created: string
  updated: string
  sourcePath: string
}

export interface Note extends NoteIndex {
  content: string
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export interface SearchDocument {
  slug: string
  title: string
  category: string
  tags: string[]
  summary: string
  sourcePath?: string
  content?: string
  kind?: 'note' | 'project'
}

export interface RelatedLink {
  slug: string
  title: string
  score: number
  reason?: string
  category?: string
  kind?: 'note' | 'project'
}

export interface Backlink {
  fromSlug: string
  fromTitle: string
  toSlug: string
  toTitle: string
  context?: string
}

export interface TagPage {
  tag: string
  title: string
  slug: string
  notes: NoteIndex[]
}

export interface Project {
  name: string
  description: string
  period?: string
  techs: string[]
  url: string
}

export interface ProjectDetail extends Project {
  slug: string
  subtitle?: string
  image?: string
  content: string
}

export interface Profile {
  name: string
  headline: string
  interests: string[]
  projects: Project[]
}
