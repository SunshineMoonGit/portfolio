export const categoryStyle: Record<string, { icon: string; bg: string }> = {
  backend: { icon: '⚙️', bg: '#1a2744' },
  security: { icon: '🔒', bg: '#2a1a2e' },
  network: { icon: '🌐', bg: '#1a2e2a' },
  devops: { icon: '🚀', bg: '#2e2a1a' },
  infra: { icon: '🏗️', bg: '#1e2a1a' },
  git: { icon: '🌿', bg: '#1a2a2e' }
}

export function getCategoryStyle(category: string) {
  return categoryStyle[category] ?? { icon: '📝', bg: '#1e293b' }
}
