// eslint-disable-next-line deprecation/deprecation
import { base } from '$app/paths'

export function withBase(path: string): string {
  return `${base}${path}`
}
