export const categoryStyle: Record<string, { label: string; bg: string }> = {
  backend: { label: 'BE', bg: '#1a2744' },
  security: { label: 'SC', bg: '#2a1a2e' },
  network: { label: 'NW', bg: '#1a2e2a' },
  devops: { label: 'DO', bg: '#2e2a1a' },
  infra: { label: 'IF', bg: '#1e2a1a' },
  git: { label: 'GT', bg: '#1a2a2e' }
}

export function getCategoryStyle(category: string) {
  return categoryStyle[category] ?? { label: category.slice(0, 2).toUpperCase(), bg: '#1e293b' }
}
