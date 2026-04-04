import { error } from '@sveltejs/kit'
import { getNotes, getNotesByTag } from '$lib'

export function entries() {
  const tags = new Set(getNotes().flatMap((note) => note.tags))
  return [...tags].sort((left, right) => left.localeCompare(right)).map((tag) => ({ tag }))
}

export function load({ params }) {
  const tag = params.tag
  const notes = getNotesByTag(tag)

  if (!notes.length) {
    throw error(404, 'Tag not found')
  }

  return {
    tag,
    notes
  }
}
