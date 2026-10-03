// C# kaynak kodunu basit token'lara ayırır. Tam bir C# lexer'ı değildir;
// oyundaki denetleyicinin ihtiyaç duyduğu kadarını tanır.

export type TokenKind = 'ident' | 'number' | 'string' | 'char' | 'punct'

export interface Token {
  kind: TokenKind
  value: string
  line: number
  start: number
  end: number
}

export interface LexError {
  line: number
  message: string
}

const MULTI = ['=>', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '??', '::']

export function lex(src: string): { tokens: Token[]; errors: LexError[] } {
  const tokens: Token[] = []
  const errors: LexError[] = []
  let i = 0
  let line = 1
  const n = src.length

  while (i < n) {
    const c = src[i]
    if (c === '\n') {
      line++
      i++
      continue
    }
    if (/\s/.test(c)) {
      i++
      continue
    }
    // yorumlar
    if (c === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const startLine = line
      i += 2
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') line++
        i++
      }
      if (i >= n) errors.push({ line: startLine, message: 'CS1035: Yorum satırı kapatılmamış (*/ eksik).' })
      i += 2
      continue
    }
    // metinler: "...", @"...", $"..."
    if (c === '"' || ((c === '@' || c === '$') && src[i + 1] === '"') || (c === '$' && src[i + 1] === '@' && src[i + 2] === '"')) {
      const start = i
      const startLine = line
      const verbatim = c === '@' || src[i + 1] === '@'
      while (src[i] !== '"') i++
      i++
      let closed = false
      while (i < n) {
        if (!verbatim && src[i] === '\\') {
          i += 2
          continue
        }
        if (src[i] === '"') {
          if (verbatim && src[i + 1] === '"') {
            i += 2
            continue
          }
          closed = true
          i++
          break
        }
        if (src[i] === '\n') {
          if (!verbatim) break
          line++
        }
        i++
      }
      if (!closed) errors.push({ line: startLine, message: 'CS1010: Metin (string) kapatılmamış, çift tırnak (") eksik.' })
      tokens.push({ kind: 'string', value: src.slice(start, i), line: startLine, start, end: i })
      continue
    }
    if (c === "'") {
      const start = i
      i++
      while (i < n && src[i] !== "'" && src[i] !== '\n') {
        if (src[i] === '\\') i++
        i++
      }
      if (src[i] !== "'") errors.push({ line, message: "CS1012: Karakter sabiti kapatılmamış, tek tırnak (') eksik." })
      else i++
      const value = src.slice(start, i)
      const inner = value.slice(1, -1)
      if (inner.length > 1 && !inner.startsWith('\\')) {
        errors.push({ line, message: `CS1012: char türüne tek tırnak içinde yalnızca bir karakter yazılabilir: ${value}` })
      }
      tokens.push({ kind: 'char', value, line, start, end: i })
      continue
    }
    if (/[0-9]/.test(c)) {
      const start = i
      while (i < n && /[0-9_.a-zA-Z]/.test(src[i])) {
        if (src[i] === '.' && !/[0-9]/.test(src[i + 1] ?? '')) break
        i++
      }
      tokens.push({ kind: 'number', value: src.slice(start, i), line, start, end: i })
      continue
    }
    if (/[A-Za-z_À-ɏ@]/.test(c)) {
      const start = i
      i++
      while (i < n && /[A-Za-z0-9_À-ɏ]/.test(src[i])) i++
      tokens.push({ kind: 'ident', value: src.slice(start, i), line, start, end: i })
      continue
    }
    const two = src.slice(i, i + 2)
    if (MULTI.includes(two)) {
      tokens.push({ kind: 'punct', value: two, line, start: i, end: i + 2 })
      i += 2
      continue
    }
    tokens.push({ kind: 'punct', value: c, line, start: i, end: i + 1 })
    i++
  }
  return { tokens, errors }
}
