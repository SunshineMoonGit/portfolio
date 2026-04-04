import relationsData from './generated/relations.json'
import { getNotes } from './content'
import type { Backlink, NoteIndex, RelatedLink } from '@portfolio/content-types'

type NoteRelation = {
  related: RelatedLink[]
  backlinks: Backlink[]
  outgoing: string[]
}

type RelationIndex = {
  notes: Record<string, NoteRelation>
}

const relations = relationsData as RelationIndex
const notes = getNotes()

export function getRelatedNotes(slug: string): RelatedLink[] {
  return relations.notes[slug]?.related ?? []
}

export function getBacklinks(slug: string): Backlink[] {
  return relations.notes[slug]?.backlinks ?? []
}

export function getNotesByTag(tag: string): NoteIndex[] {
  return notes.filter((note) => note.tags.includes(tag))
}
