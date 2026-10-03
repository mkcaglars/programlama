// Metot gövdelerindeki deyimleri tarar: eksik ';' gibi sözdizimi hatalarını bulur ve
// anlamsal denetim için "olaylar" (nesne oluşturma, üye erişimi, tanımlamalar) toplar.
import type { Token } from './lexer'
import { countArgs, endsExpr, matchClose, parseTypeRef, type Diagnostic } from './parser'

export type Target =
  | { kind: 'name'; name: string }
  | { kind: 'this' }
  | { kind: 'base' }

export type BodyEvent =
  | { type: 'new'; typeName: string; args: number; line: number; initNames: string[]; isArray: boolean }
  | { type: 'access'; target: Target; member: string; line: number; call: number | null; assign: boolean }
  | { type: 'ident'; name: string; line: number; call: number | null; assign: boolean }
  | { type: 'decl'; declType: string; name: string; line: number; init: Token[] }
  | { type: 'assignLiteral'; name: string; line: number; init: Token[] }

export interface BodyResult {
  diagnostics: Diagnostic[]
  events: BodyEvent[]
  locals: Map<string, string>
}

const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%='])
const CONTINUES = new Set(['is', 'as', 'in', 'and', 'or', 'not', 'when', 'with', 'switch'])

export function analyzeBody(tokens: Token[], initialLocals: Map<string, string>): BodyResult {
  const diagnostics: Diagnostic[] = []
  const events: BodyEvent[] = []
  const locals = new Map(initialLocals)
  const t = tokens

  const err = (line: number, code: string, message: string) => diagnostics.push({ line, code, message, severity: 'error' })

  const close = (i: number) => {
    const c = matchClose(t, i)
    return c < 0 ? t.length : c
  }

  function declAt(i: number, j: number): number {
    // `Tür ad = ...` biçiminde yerel değişken tanımı mı?
    const r = parseTypeRef(t, i)
    if (!r) return i
    const nameTok = t[r.end]
    if (!nameTok || nameTok.kind !== 'ident') return i
    const after = t[r.end + 1]?.value
    if (r.end + 1 < j && after !== '=' && after !== ',' && after !== ';') return i
    if (r.end + 1 >= j && r.end + 1 !== j) return i
    let k = r.end
    for (;;) {
      const name = t[k].value
      let declType = r.text
      let initStart = k + 1
      let initEnd = k + 1
      if (t[k + 1]?.value === '=') {
        initStart = k + 2
        initEnd = initStart
        while (initEnd < j && t[initEnd].value !== ',') {
          if (['(', '[', '{'].includes(t[initEnd].value)) initEnd = close(initEnd) + 1
          else initEnd++
        }
      }
      const init = t.slice(initStart, initEnd)
      if (declType === 'var') {
        if (init[0]?.value === 'new') {
          const nr = parseTypeRef(t, initStart + 1)
          if (nr) declType = nr.text
        }
      }
      locals.set(name, declType)
      events.push({ type: 'decl', declType, name, line: t[k].line, init })
      k = initEnd
      if (t[k]?.value === ',' && t[k + 1]?.kind === 'ident') {
        k = k + 1
        continue
      }
      break
    }
    return r.end
  }

  function scan(i: number, j: number) {
    const start = i
    let k = declAt(i, j)
    // `ad = sabit;` biçimi
    if (k === start && t[i]?.kind === 'ident' && t[i + 1]?.value === '=' && j - i <= 4) {
      events.push({ type: 'assignLiteral', name: t[i].value, line: t[i].line, init: t.slice(i + 2, j) })
    }
    for (k = start; k < j; k++) {
      const tok = t[k]
      if (tok.kind !== 'ident') continue
      if (tok.value === 'new') {
        const r = parseTypeRef(t, k + 1)
        if (!r) continue
        let args = 0
        let p = r.end
        const isArray = r.text.includes('[') || t[p]?.value === '['
        if (t[p]?.value === '(') {
          const c = close(p)
          args = countArgs(t, p, c)
          p = c + 1
        }
        const initNames: string[] = []
        if (t[p]?.value === '{' && !isArray) {
          const c = close(p)
          for (let q = p + 1; q < c; q++) {
            if (t[q].kind === 'ident' && t[q + 1]?.value === '=' && (t[q - 1].value === '{' || t[q - 1].value === ',')) initNames.push(t[q].value)
          }
        }
        events.push({ type: 'new', typeName: r.text, args, line: tok.line, initNames, isArray })
        continue
      }
      const prev = t[k - 1]
      if (prev?.value === '.') continue
      const isTarget = t[k + 1]?.value === '.' && t[k + 2]?.kind === 'ident'
      if (isTarget) {
        const target: Target = tok.value === 'this' ? { kind: 'this' } : tok.value === 'base' ? { kind: 'base' } : { kind: 'name', name: tok.value }
        const after = k + 3
        let call: number | null = null
        if (t[after]?.value === '(') call = countArgs(t, after, close(after))
        const assign = ASSIGN_OPS.has(t[after]?.value) || t[after]?.value === '++' || t[after]?.value === '--' || t[k - 1]?.value === '++' || t[k - 1]?.value === '--'
        events.push({ type: 'access', target, member: t[k + 2].value, line: tok.line, call, assign })
        continue
      }
      let call: number | null = null
      if (t[k + 1]?.value === '(') call = countArgs(t, k + 1, close(k + 1))
      const assign = ASSIGN_OPS.has(t[k + 1]?.value) || t[k + 1]?.value === '++' || t[k + 1]?.value === '--'
      events.push({ type: 'ident', name: tok.value, line: tok.line, call, assign })
    }
  }

  function stmt(i: number, end: number): number {
    const tok = t[i]
    if (!tok) return end
    const v = tok.value
    if (v === '{') {
      const c = close(i)
      block(i + 1, Math.min(c, end))
      return c + 1
    }
    if (v === ';') return i + 1
    if (tok.kind === 'ident') {
      if ((v === 'if' || v === 'while' || v === 'lock' || v === 'using' || v === 'switch') && t[i + 1]?.value === '(') {
        const c = close(i + 1)
        scan(i + 2, c)
        if (v === 'switch') {
          if (t[c + 1]?.value === '{') {
            const bc = close(c + 1)
            block(c + 2, bc)
            return bc + 1
          }
          return c + 1
        }
        if (c + 1 >= end) {
          err(tok.line, 'CS1525', `'${v}' koşulundan sonra bir deyim veya { } bloğu bekleniyor.`)
          return end
        }
        if (t[c + 1]?.value === ';' && v !== 'while') {
          diagnostics.push({ line: t[c + 1].line, code: 'CS0642', message: `'${v} (...)' satırının sonundaki ';' yanlış: koşul boş bir deyime bağlanmış olur.`, severity: 'warning' })
        }
        return stmt(c + 1, end)
      }
      if (v === 'if' || v === 'while' || v === 'for' || v === 'foreach' || v === 'switch') {
        if (t[i + 1]?.value !== '(') {
          err(tok.line, 'CS1003', `'${v}' sözcüğünden sonra '(' bekleniyor (koşul parantez içinde yazılır).`)
          let k = i + 1
          while (k < end && t[k].value !== '{' && t[k].value !== ';') k++
          return stmt(k, end)
        }
      }
      if (v === 'for' && t[i + 1]?.value === '(') {
        const c = close(i + 1)
        const semis = t.slice(i + 2, c).filter((x) => x.value === ';').length
        if (semis !== 2) err(tok.line, 'CS1002', "for döngüsünün parantezi içinde iki ';' olmalı: for (başlangıç; koşul; artış)")
        scan(i + 2, c)
        return stmt(c + 1, end)
      }
      if (v === 'foreach' && t[i + 1]?.value === '(') {
        const c = close(i + 1)
        const r = parseTypeRef(t, i + 2)
        if (r && t[r.end]?.kind === 'ident' && t[r.end + 1]?.value === 'in') {
          let elem = r.text
          if (elem === 'var') {
            const src = t[r.end + 2]
            const srcType = src && r.end + 3 === c ? locals.get(src.value) : undefined
            if (srcType) elem = elementType(srcType) ?? 'var'
          }
          locals.set(t[r.end].value, elem)
          scan(r.end + 2, c)
        } else {
          err(tok.line, 'CS0230', "foreach için 'foreach (Tür ad in koleksiyon)' biçimi bekleniyor.")
        }
        return stmt(c + 1, end)
      }
      if (v === 'else') return stmt(i + 1, end)
      if (v === 'try' || v === 'finally' || v === 'checked' || v === 'unchecked') return stmt(i + 1, end)
      if (v === 'catch') {
        let k = i + 1
        if (t[k]?.value === '(') {
          const c = close(k)
          if (t[k + 1]?.kind === 'ident' && t[k + 2]?.kind === 'ident') locals.set(t[k + 2].value, t[k + 1].value)
          k = c + 1
        }
        return stmt(k, end)
      }
      if (v === 'do') {
        const k = stmt(i + 1, end)
        if (t[k]?.value === 'while' && t[k + 1]?.value === '(') {
          const c = close(k + 1)
          scan(k + 2, c)
          if (t[c + 1]?.value !== ';') err(t[c].line, 'CS1002', "do-while döngüsünün sonunda ';' bekleniyor.")
          return t[c + 1]?.value === ';' ? c + 2 : c + 1
        }
        err(t[k - 1]?.line ?? tok.line, 'CS1003', "do bloğundan sonra 'while (koşul);' bekleniyor.")
        return k
      }
      if ((v === 'case' || v === 'default') && t[i + 1]?.value !== '(') {
        let k = i + 1
        while (k < end && t[k].value !== ':') k++
        scan(i + 1, k)
        return k + 1
      }
    }
    // ifade deyimi
    let j = i
    while (j < end) {
      const cur = t[j]
      const cv = cur.value
      if (cur.kind === 'punct') {
        if (cv === ';') {
          scan(i, j)
          return j + 1
        }
        if (cv === '(' || cv === '[') {
          j = close(j) + 1
          continue
        }
        if (cv === '{') {
          const c = close(j)
          if (t[j - 1]?.value === '=>') block(j + 1, c)
          j = c + 1
          continue
        }
        if (cv === '}') break
      }
      if (j > i && cur.line > t[j - 1].line && endsExpr(t[j - 1]) && !(cur.kind === 'ident' && CONTINUES.has(cv)) && cur.kind !== 'punct') {
        err(t[j - 1].line, 'CS1002', "';' bekleniyor (satır sonunda noktalı virgül eksik).")
        scan(i, j)
        return j
      }
      j++
    }
    const last = t[Math.min(j, end) - 1] ?? tok
    err(last.line, 'CS1002', "';' bekleniyor (satır sonunda noktalı virgül eksik).")
    scan(i, Math.min(j, end))
    return Math.min(j, end) === i ? i + 1 : Math.min(j, end)
  }

  function block(i: number, end: number) {
    while (i < end) {
      const next = stmt(i, end)
      i = next > i ? next : i + 1
    }
  }

  block(0, t.length)
  return { diagnostics, events, locals }
}

/** `Ogrenci[]` → `Ogrenci`, `List<Ogrenci>` → `Ogrenci` */
export function elementType(type: string): string | null {
  if (type.endsWith('[]')) return type.slice(0, -2)
  const m = /^(?:List|IEnumerable|ICollection|IList)<(.+)>$/.exec(type)
  return m ? m[1] : null
}
