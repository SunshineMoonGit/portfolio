interface CategoryMeta {
  /** Full display name used in sidebars, breadcrumbs, and meta strips. */
  label?: string
  /** 2-3 character abbreviation used in compact badges. */
  short?: string
  /** Sort order within a level; lower appears first. */
  order?: number
  /** Background color. Children inherit from the nearest ancestor that defines one. */
  bg?: string
}

export const categoryMeta: Record<string, CategoryMeta> = {
  // Level 0 — roots (define bg, inherited downward)
  'ai':                { label: 'AI',        short: 'AI', order: 10, bg: '#2a1f3d' },
  'backend':           { label: 'Backend',   short: 'BE', order: 20, bg: '#1a2744' },
  'network':           { label: 'Network',   short: 'NW', order: 30, bg: '#1a2e2a' },
  'infra':             { label: 'Infra',     short: 'IF', order: 40, bg: '#2e2a1a' },
  'git':               { label: 'Git',       short: 'GT', order: 50, bg: '#1a2a2e' },

  // Level 1
  'ai/rag':            { label: 'RAG',       short: 'RG', order: 1 },
  'ai/agent':          { label: 'Agent',     short: 'AG', order: 2 },
  'ai/reference':      { label: 'Reference', short: 'RF', order: 99 },
  'backend/auth':      { label: 'Auth',      short: 'AU', order: 1 },
  'backend/gateway':   { label: 'Gateway',   short: 'GW', order: 2 },
  'backend/database':  { label: 'Database',  short: 'DB', order: 3 },
  'backend/tools':     { label: 'Tools',     short: 'TL', order: 4 },
  'network/basics':    { label: 'Basics',    short: 'BA', order: 1 },
  'network/proxy':     { label: 'Proxy',     short: 'PX', order: 2 },
  'network/security':  { label: 'Security',  short: 'SC', order: 3 },
  'infra/devops':      { label: 'DevOps',    short: 'DO', order: 1 },

  // Level 2
  'ai/rag/graph':      { label: 'Graph',     short: 'GR', order: 2 },
  'ai/rag/retrieval':  { label: 'Retrieval', short: 'RT', order: 1 },
  'backend/auth/rbac': { label: 'RBAC',      short: 'RB', order: 2 },
  'backend/auth/sso':  { label: 'SSO',       short: 'SO', order: 1 },
}

const DEFAULT_BG = '#1e293b'

function titleCaseSegment(segment: string): string {
  if (!segment) return segment
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

function walkAncestors(path: string): string[] {
  const out: string[] = []
  let current = path
  while (current) {
    out.push(current)
    const idx = current.lastIndexOf('/')
    if (idx === -1) break
    current = current.slice(0, idx)
  }
  return out
}

/** Full display name for sidebar, breadcrumb, meta strip. */
export function getCategoryLabel(path: string): string {
  if (!path) return ''
  const meta = categoryMeta[path]
  if (meta?.label) return meta.label
  const last = path.split('/').pop() ?? path
  return titleCaseSegment(last)
}

/** Sort weight within a level. Lower = earlier. */
export function getCategoryOrder(path: string): number {
  return categoryMeta[path]?.order ?? 999
}

/**
 * Compact style descriptor for square badge icons.
 * Keeps the historical `{label, bg}` shape so existing callers keep working.
 * `bg` inherits from the nearest ancestor that defines one.
 */
export function getCategoryStyle(path: string): { label: string; bg: string } {
  if (!path) return { label: '??', bg: DEFAULT_BG }

  const ownMeta = categoryMeta[path]
  const lastSegment = path.split('/').pop() ?? path
  const label = ownMeta?.short ?? lastSegment.slice(0, 2).toUpperCase()

  let bg = DEFAULT_BG
  for (const ancestor of walkAncestors(path)) {
    const meta = categoryMeta[ancestor]
    if (meta?.bg) {
      bg = meta.bg
      break
    }
  }

  return { label, bg }
}

/** Path prefix match used for filtering notes under a selected category. */
export function isInCategory(notePath: string, selectedPath: string | null): boolean {
  if (!selectedPath) return true
  return notePath === selectedPath || notePath.startsWith(selectedPath + '/')
}

/**
 * Breadcrumb segments for a given category path.
 * `ai/rag/retrieval` → [{path:'ai', label:'AI'}, {path:'ai/rag', label:'RAG'}, {path:'ai/rag/retrieval', label:'Retrieval'}]
 */
export function getCategoryBreadcrumbs(path: string): Array<{ path: string; label: string }> {
  if (!path) return []
  const segments = path.split('/').filter(Boolean)
  const crumbs: Array<{ path: string; label: string }> = []
  let acc = ''
  for (const segment of segments) {
    acc = acc ? `${acc}/${segment}` : segment
    crumbs.push({ path: acc, label: getCategoryLabel(acc) })
  }
  return crumbs
}
