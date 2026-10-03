import { describe, expect, it } from 'vitest'
import { ALL_LEVELS, CHAPTERS } from './index'
import { compile } from '../engine/csharp/semantic'
import { checkRules } from '../engine/csharp/rules'
import { cloneDb, execute } from '../engine/sql'
import { GLOSSARY } from './glossary'

describe('içerik tutarlılığı', () => {
  it('seviye kimlikleri benzersiz', () => {
    const ids = ALL_LEVELS.map((l) => l.level.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(CHAPTERS.length)
  })

  for (const { level, chapter } of ALL_LEVELS) {
    const t = level.task
    const name = `${chapter.id} / ${level.id} (${t.kind})`
    it(name, () => {
      expect(level.cards.length).toBeGreaterThan(0)
      switch (t.kind) {
        case 'quiz':
          expect(t.answer).toBeGreaterThanOrEqual(0)
          expect(t.answer).toBeLessThan(t.options.length)
          break
        case 'match':
          expect(new Set(t.pairs.map((p) => p.right)).size).toBe(t.pairs.length)
          break
        case 'fill': {
          const holes = [...t.code.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1]))
          expect(holes.sort()).toEqual(t.blanks.map((_, i) => i))
          break
        }
        case 'tree': {
          const names = new Set([t.root, ...t.classes.map((c) => c.name)])
          for (const c of t.classes) expect(names.has(c.parent)).toBe(true)
          break
        }
        case 'bug': {
          const lines = t.code.split('\n').length
          for (const b of t.bugLines) expect(b).toBeLessThanOrEqual(lines)
          if (t.fix) expect(t.fix.answer).toBeLessThan(t.fix.options.length)
          if (t.code.trimStart().startsWith('class') || t.code.trimStart().startsWith('sealed')) {
            const errLines = [...new Set(compile(t.code).diagnostics.filter((d) => d.severity === 'error').map((d) => d.line))].sort((a, b) => a - b)
            expect(errLines).toEqual([...t.bugLines].sort((a, b) => a - b))
          }
          break
        }
        case 'code': {
          const sol = compile(t.solution)
          expect(sol.diagnostics.filter((d) => d.severity === 'error')).toEqual([])
          const res = checkRules(sol, t.rules)
          expect(res.filter((r) => !r.ok).map((r) => `${r.rule.goal}: ${r.detail}`)).toEqual([])
          const st = compile(t.starter)
          const stRes = checkRules(st, t.rules)
          expect(!st.ok || stRes.some((r) => !r.ok)).toBe(true)
          break
        }
        case 'sql': {
          const db = cloneDb(t.db)
          const r = execute(db, t.solution)
          expect(r.length).toBeGreaterThan(0)
          if (t.check === 'select') expect(r[r.length - 1].kind).toBe('select')
          break
        }
        case 'order':
          expect(t.lines.length).toBeGreaterThan(2)
          break
        case 'build':
          expect(t.blocks.some((b) => b.correct)).toBe(true)
          expect(t.blocks.some((b) => !b.correct)).toBe(true)
          break
        case 'predict':
          expect(t.answers.length).toBeGreaterThan(0)
          break
      }
    })
  }

  it('sözlük dolu', () => {
    expect(GLOSSARY.length).toBeGreaterThan(20)
  })
})
