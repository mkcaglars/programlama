import type { Task } from './types'

/** Hata ve ipucu sayısına göre 1–3 yıldız. Kod/SQL görevlerinde ilk başarısız deneme affedilir. */
export function computeStars(kind: Task['kind'], mistakes: number, hints: number, solutionShown: boolean): number {
  if (solutionShown) return 1
  const m = kind === 'code' || kind === 'sql' ? Math.max(0, mistakes - 1) : mistakes
  const penalty = m + hints
  return penalty === 0 ? 3 : penalty <= 2 ? 2 : 1
}
