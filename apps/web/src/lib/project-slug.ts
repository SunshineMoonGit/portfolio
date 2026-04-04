export function toProjectSlug(name: string): string {
  return encodeURIComponent(name.trim())
}
