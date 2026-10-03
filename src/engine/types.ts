import type { Rule } from './csharp/rules'
import type { Database } from './sql'

/** Konu anlatım kartı. `body` içinde **kalın** ve `kod` biçimlendirmesi desteklenir. */
export interface Card {
  title: string
  body: string
  code?: string
  /** Kartın yanında gösterilecek görsel (emoji veya kısa sembol) */
  icon?: string
}

export interface QuizTask {
  kind: 'quiz'
  question: string
  code?: string
  options: string[]
  answer: number
  explain: string
}

/** Kodun çıktısını tahmin et */
export interface PredictTask {
  kind: 'predict'
  prompt: string
  code: string
  /** Kabul edilen cevaplar (satırlar '\n' ile). Boşluklar ve satır sonları esnek karşılaştırılır. */
  answers: string[]
  explain: string
}

/** Boşluk doldurma: kod içinde [[0]], [[1]]… yer tutucuları */
export interface FillTask {
  kind: 'fill'
  prompt: string
  code: string
  blanks: { accept: string[]; width?: number; placeholder?: string }[]
  explain: string
}

/** Serbest kod yazma: kurallı denetleyici ile kontrol edilir */
export interface CodeTask {
  kind: 'code'
  prompt: string
  starter: string
  solution: string
  rules: Rule[]
  explain: string
  /** Başarı sonrası gösterilecek örnek program çıktısı */
  output?: string
}

/** Hata avcısı: hatalı satırları bul */
export interface BugTask {
  kind: 'bug'
  prompt: string
  code: string
  /** 1 tabanlı satır numaraları */
  bugLines: number[]
  /** Hatalı satır bulunduktan sonra doğru düzeltmeyi seçme sorusu */
  fix?: { question: string; options: string[]; answer: number }
  explain: string
}

/** Satırları doğru sıraya koy (Parsons problemi) */
export interface OrderTask {
  kind: 'order'
  prompt: string
  /** Doğru sırada satırlar */
  lines: string[]
  /** Alternatif doğru sıralar (isteğe bağlı) */
  alternatives?: string[][]
  explain: string
}

/** Kalıtım ağacı: her sınıfın temel sınıfını seç */
export interface TreeTask {
  kind: 'tree'
  prompt: string
  root: string
  classes: { name: string; parent: string; hint?: string }[]
  explain: string
}

/** Sınıf inşa et: doğru üye bloklarını seç */
export interface BuildTask {
  kind: 'build'
  prompt: string
  header: string
  blocks: { code: string; correct: boolean; why: string }[]
  explain: string
}

/** Eşleştirme: sol sütundaki öğeleri sağdakilerle eşleştir */
export interface MatchTask {
  kind: 'match'
  prompt: string
  pairs: { left: string; right: string }[]
  explain: string
}

export interface SqlTask {
  kind: 'sql'
  prompt: string
  db: Database
  solution: string
  starter?: string
  /** select: sonuç karşılaştır, change: tablo durumunu karşılaştır */
  check: 'select' | 'change'
  /** sonuç sırası önemli mi (select için) */
  ordered?: boolean
  explain: string
}

export type Task = QuizTask | PredictTask | FillTask | CodeTask | BugTask | OrderTask | TreeTask | BuildTask | MatchTask | SqlTask

export interface Level {
  id: string
  title: string
  /** Kitaptaki ilgili bölüm (ör. "3.2") */
  ref?: string
  cards: Card[]
  task: Task
  hints?: string[]
  xp?: number
  /** Bölüm sonu görevi */
  boss?: boolean
}

export interface Chapter {
  id: string
  title: string
  subtitle: string
  /** Ders kitabındaki öğrenme birimi */
  unit: number
  icon: string
  color: string
  levels: Level[]
}

export const TASK_LABEL: Record<Task['kind'], string> = {
  quiz: 'Soru',
  predict: 'Çıktıyı Tahmin Et',
  fill: 'Boşluk Doldur',
  code: 'Kod Yaz',
  bug: 'Hata Avcısı',
  order: 'Kod Sırala',
  tree: 'Kalıtım Ağacı',
  build: 'Sınıf İnşa Et',
  match: 'Eşleştir',
  sql: 'SQL Sorgusu',
}
