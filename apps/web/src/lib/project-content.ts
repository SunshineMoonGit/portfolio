// @ts-nocheck
import { getProjectBySlug } from '$lib/content'
import type { ProjectDetail } from '@portfolio/content-types'

export async function getProjectDetail(slug: string): Promise<ProjectDetail> {
  const project = getProjectBySlug(slug)

  if (!project) {
    throw new Error('Project not found')
  }

  return project
}
