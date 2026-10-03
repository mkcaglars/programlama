import { useSyncExternalStore } from 'react'

export interface LevelProgress {
  stars: number
  xp: number
  completedAt: number
}

export interface ProgressState {
  name: string
  levels: Record<string, LevelProgress>
  /** Öğretmen modu: tüm seviyeler açık */
  unlockAll: boolean
  sound: boolean
}

/** Adres satırındaki ?isim=... değeri (ör. ?isim=Mustafa%20Kemal). Yoksa null. */
export function nameFromUrl(search: string): string | null {
  let raw: string | null = null
  try {
    raw = new URLSearchParams(search).get('isim')
  } catch {
    return null
  }
  const name = (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
  return name || null
}

/** İsim URL'den geldiyse her öğrencinin ilerlemesi ayrı anahtarda tutulur (ortak bilgisayarlar için). */
export function storageKey(urlName: string | null): string {
  return urlName ? `nesne-atolyesi:v1:${urlName.toLocaleLowerCase('tr')}` : 'nesne-atolyesi:v1'
}

/** Bu oturumda isim URL'den mi geldi? Geldiyse isim sorulmaz. */
export const URL_NAME = typeof window === 'undefined' ? null : nameFromUrl(window.location.search)
const KEY = storageKey(URL_NAME)
const initial: ProgressState = { name: '', levels: {}, unlockAll: false, sound: true }

function load(): ProgressState {
  let loaded = initial
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) loaded = { ...initial, ...(JSON.parse(raw) as Partial<ProgressState>) }
  } catch {
    // depolama kullanılamıyor (gizli pencere vb.) — boş ilerlemeyle devam
  }
  return URL_NAME ? { ...loaded, name: URL_NAME } : loaded
}

let state: ProgressState = load()
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // yok say
  }
}

function set(next: ProgressState) {
  state = next
  save()
  listeners.forEach((l) => l())
}

export const progress = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  setName(name: string) {
    set({ ...state, name })
  },
  setUnlockAll(unlockAll: boolean) {
    set({ ...state, unlockAll })
  },
  setSound(sound: boolean) {
    set({ ...state, sound })
  },
  /** Seviyeyi tamamla; en iyi sonuç saklanır. Kazanılan ek XP'yi döndürür. */
  complete(id: string, stars: number, baseXp: number): number {
    const prev = state.levels[id]
    const xp = Math.round((baseXp * (stars + 1)) / 4)
    if (prev && prev.stars >= stars) return 0
    const gained = xp - (prev?.xp ?? 0)
    set({ ...state, levels: { ...state.levels, [id]: { stars, xp, completedAt: Date.now() } } })
    return gained
  },
  reset() {
    set({ ...initial, name: state.name })
  },
  exportJson(): string {
    return JSON.stringify(state)
  },
  importJson(json: string) {
    const parsed = JSON.parse(json) as Partial<ProgressState>
    if (!parsed || typeof parsed !== 'object' || typeof parsed.levels !== 'object') throw new Error('Geçersiz dosya')
    set({ ...initial, ...parsed, ...(URL_NAME ? { name: URL_NAME } : {}) })
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export function totalXp(s: ProgressState): number {
  return Object.values(s.levels).reduce((a, l) => a + l.xp, 0)
}

export const RANKS = [
  { min: 0, title: 'Çırak', icon: '🔧' },
  { min: 150, title: 'Kalfa', icon: '🛠️' },
  { min: 400, title: 'Usta', icon: '⚙️' },
  { min: 750, title: 'Mimar', icon: '📐' },
  { min: 1100, title: 'Baş Mühendis', icon: '🏆' },
]

export function rankOf(xp: number) {
  let r = RANKS[0]
  for (const x of RANKS) if (xp >= x.min) r = x
  const next = RANKS[RANKS.indexOf(r) + 1]
  return { ...r, next }
}
