import type { Chapter, Level } from '../engine/types'
import { temeller } from './chapters/c0-temeller'
import { sinifNesne } from './chapters/c1-sinif-nesne'
import { kapsulleme } from './chapters/c2-kapsulleme'
import { metotlar } from './chapters/c3-metotlar'
import { yapiciStatic } from './chapters/c4-yapici-static'
import { kalitim } from './chapters/c5-kalitim'
import { soyutArayuz } from './chapters/c6-soyut-arayuz'
import { koleksiyonlar } from './chapters/c7-koleksiyonlar'
import { formlar } from './chapters/c8-formlar'
import { veritabani } from './chapters/c9-veritabani'

export const CHAPTERS: Chapter[] = [
  temeller,
  sinifNesne,
  kapsulleme,
  metotlar,
  yapiciStatic,
  kalitim,
  soyutArayuz,
  koleksiyonlar,
  formlar,
  veritabani,
]

export interface LevelRef {
  chapter: Chapter
  level: Level
  index: number
  /** Tüm oyundaki sıra */
  order: number
}

export const ALL_LEVELS: LevelRef[] = CHAPTERS.flatMap((chapter) => chapter.levels.map((level, index) => ({ chapter, level, index, order: 0 }))).map((r, i) => ({ ...r, order: i }))

export function findLevel(id: string): LevelRef | undefined {
  return ALL_LEVELS.find((r) => r.level.id === id)
}

export const DEFAULT_XP = 10
export const levelXp = (l: Level) => l.xp ?? DEFAULT_XP
