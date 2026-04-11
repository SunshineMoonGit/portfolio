import { error } from '@sveltejs/kit'
import { getNoteBySlug, getNoteDetails } from '$lib'

export function entries() {
  return getNoteDetails().map((note) => ({ slug: note.slug }))
}

export function load({ params }) {
  const note = getNoteBySlug(params.slug)

  if (!note) {
    throw error(404, 'Note not found')
  }

  return { note, selectedPath: note.category }
}
