import notesData from './generated/notes.json'
import profileData from './generated/profile.json'
import projectsData from './generated/projects.json'
import type { Note, NoteIndex, Profile, Project, ProjectDetail } from '@portfolio/content-types'

const notes = notesData as Note[]
const profile = profileData as Profile
const projects = projectsData as ProjectDetail[]

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
