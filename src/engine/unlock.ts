import { ALL_LEVELS } from '../content'
import type { ProgressState } from './progress'

/** Seviye açık mı? Seviyeler sırayla açılır; öğretmen modunda hepsi açıktır. */
export function isUnlocked(s: ProgressState, levelId: string): boolean {
  if (s.unlockAll) return true
  const idx = ALL_LEVELS.findIndex((l) => l.level.id === levelId)
  if (idx <= 0) return idx === 0
  return !!s.levels[ALL_LEVELS[idx - 1].level.id] || !!s.levels[levelId]
}

export function nextLevelId(s: ProgressState): string | null {
  const next = ALL_LEVELS.find((l) => !s.levels[l.level.id])
  return next ? next.level.id : null
}
