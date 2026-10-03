import { useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

const getHash = () => window.location.hash.replace(/^#/, '') || '/'

export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, getHash, () => '/')
  return hash.split('/').filter(Boolean).map(decodeURIComponent)
}

export function go(path: string) {
  window.location.hash = path
  window.scrollTo({ top: 0 })
}
