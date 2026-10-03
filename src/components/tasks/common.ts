export interface TaskProps<T> {
  task: T
  onMistake(): void
  onSolved(): void
  solved: boolean
}

/** Tohumlu karıştırma: aynı görev her açılışta aynı (ama karışık) sırada gelir. */
export function shuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const LETTERS = 'ABCDEFGH'
