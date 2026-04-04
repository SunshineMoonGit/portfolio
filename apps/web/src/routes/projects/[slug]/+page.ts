import { error } from '@sveltejs/kit'
import { getProjectBySlug, getProjectDetails } from '$lib'

export function entries() {
  return getProjectDetails().map((project) => ({ slug: project.slug }))
}

export function load({ params }) {
  const project = getProjectBySlug(params.slug)

  if (!project) {
    throw error(404, 'Project not found')
  }

  return { project }
}
