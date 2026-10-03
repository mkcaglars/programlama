import type { ProgressState } from '../engine/progress'
import { ALL_LEVELS, CHAPTERS } from './index'

export interface Badge {
  id: string
  icon: string
  title: string
  desc: string
  earned(s: ProgressState): boolean
}

const doneIds = (s: ProgressState) => new Set(Object.keys(s.levels))
const kindDone = (s: ProgressState, kind: string) => {
  const d = doneIds(s)
  const all = ALL_LEVELS.filter((l) => l.level.task.kind === kind)
  return { done: all.filter((l) => d.has(l.level.id)).length, total: all.length }
}

export const BADGES: Badge[] = [
  { id: 'ilk-adim', icon: '🎯', title: 'İlk Adım', desc: 'İlk seviyeni tamamla.', earned: (s) => doneIds(s).size >= 1 },
  ...CHAPTERS.map<Badge>((c) => ({
    id: `bolum-${c.id}`,
    icon: c.icon,
    title: `${c.title} Ustası`,
    desc: `"${c.title}" bölümündeki tüm seviyeleri tamamla.`,
    earned: (s) => c.levels.every((l) => s.levels[l.id]),
  })),
  { id: 'kusursuz', icon: '⭐', title: 'Kusursuz Beşli', desc: '5 seviyeyi 3 yıldızla bitir.', earned: (s) => Object.values(s.levels).filter((l) => l.stars === 3).length >= 5 },
  {
    id: 'hata-avcisi',
    icon: '🐞',
    title: 'Hata Avcısı',
    desc: 'Tüm "Hata Avcısı" görevlerini tamamla.',
    earned: (s) => {
      const k = kindDone(s, 'bug')
      return k.done === k.total
    },
  },
  { id: 'derleyici-dostu', icon: '💻', title: 'Derleyici Dostu', desc: '10 "Kod Yaz" görevini tamamla.', earned: (s) => kindDone(s, 'code').done >= 10 },
  {
    id: 'sql-sihirbazi',
    icon: '🧙',
    title: 'SQL Sihirbazı',
    desc: 'Tüm SQL görevlerini tamamla.',
    earned: (s) => {
      const k = kindDone(s, 'sql')
      return k.done === k.total
    },
  },
  {
    id: 'boss',
    icon: '👑',
    title: 'Bölüm Sonu Canavarı',
    desc: '5 bölüm sonu görevini tamamla.',
    earned: (s) => ALL_LEVELS.filter((l) => l.level.boss && s.levels[l.level.id]).length >= 5,
  },
  { id: 'yildiz', icon: '🌟', title: 'Yıldız Koleksiyoncusu', desc: 'Tüm seviyelerde 3 yıldız topla.', earned: (s) => ALL_LEVELS.every((l) => s.levels[l.level.id]?.stars === 3) },
  { id: 'mezun', icon: '🎓', title: 'NTP Mezunu', desc: 'Oyundaki tüm seviyeleri tamamla.', earned: (s) => ALL_LEVELS.every((l) => s.levels[l.level.id]) },
]

export function earnedBadges(s: ProgressState): Badge[] {
  return BADGES.filter((b) => b.earned(s))
}
