import categoryTreeData from './generated/category-tree.json'
import notesData from './generated/notes.json'
import profileData from './generated/profile.json'
import projectsData from './generated/projects.json'
import { getCategoryOrder } from './content-style'
import type { CategoryNode, Note, NoteIndex, Profile, Project, ProjectDetail } from '@portfolio/content-types'

const notes = notesData as Note[]
const profile = profileData as Profile
const projects = projectsData as ProjectDetail[]

function sortCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  return [...nodes]
    .sort((a, b) => {
      const orderDiff = getCategoryOrder(a.path) - getCategoryOrder(b.path)
      if (orderDiff !== 0) return orderDiff
      return a.segment.localeCompare(b.segment)
    })
    .map((node) => ({ ...node, children: sortCategoryTree(node.children) }))
}

const categoryTree = sortCategoryTree(categoryTreeData as CategoryNode[])

export function getProfile(): Profile {
  return profile
}

export function getProjects(): Project[] {
  return profile.projects
}

export function getProjectDetails(): ProjectDetail[] {
  return projects
}

export function getProjectBySlug(slug: string): ProjectDetail | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getNotes(): NoteIndex[] {
  return notes
}

export function getNoteDetails(): Note[] {
  return notes
}

export function getNoteBySlug(slug: string): Note | undefined {
  return notes.find((note) => note.slug === slug)
}

export function getCategoryTree(): CategoryNode[] {
  return categoryTree
}
