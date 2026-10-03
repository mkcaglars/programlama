// Oyundaki veri tabanı görevleri için küçük, bellek içi bir SQL yorumlayıcısı.
// MySQL sözdiziminin ders kitabında geçen alt kümesini destekler.

export type Value = string | number | null

export interface Column {
  name: string
  type: string
  pk?: boolean
  autoInc?: boolean
  notNull?: boolean
}

export interface Table {
  name: string
  columns: Column[]
  rows: Record<string, Value>[]
}

export type Database = Record<string, Table>

export interface QueryResult {
  kind: 'select' | 'change' | 'create'
  columns: string[]
  rows: Value[][]
  affected: number
  message: string
  ordered: boolean
}

export class SqlError extends Error {}

type Tok = { t: 'kw' | 'id' | 'num' | 'str' | 'op'; v: string; raw: string }

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'ORDER', 'BY', 'ASC', 'DESC', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'AUTO_INCREMENT', 'NULL', 'LIKE', 'IN',
  'BETWEEN', 'IS', 'LIMIT', 'AS', 'DISTINCT', 'JOIN', 'INNER', 'LEFT', 'ON', 'GROUP', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX', 'DROP', 'HAVING',
])

function tokenize(sql: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < sql.length) {
    const c = sql[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '-' && sql[i + 1] === '-') { while (i < sql.length && sql[i] !== '\n') i++; continue }
    if (c === "'" || c === '"') {
      let j = i + 1
      let s = ''
      while (j < sql.length && sql[j] !== c) {
        if (sql[j] === '\\') { s += sql[j + 1]; j += 2; continue }
        s += sql[j++]
      }
      if (j >= sql.length) throw new SqlError(`Metin değeri kapatılmamış: ${c} işareti eksik. (1064)`)
      out.push({ t: 'str', v: s, raw: sql.slice(i, j + 1) })
      i = j + 1
      continue
    }
    if (c === '`') {
      const j = sql.indexOf('`', i + 1)
      if (j < 0) throw new SqlError('` işareti kapatılmamış. (1064)')
      out.push({ t: 'id', v: sql.slice(i + 1, j), raw: sql.slice(i, j + 1) })
      i = j + 1
      continue
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(sql[i + 1] ?? ''))) {
      let j = i
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++
      out.push({ t: 'num', v: sql.slice(i, j), raw: sql.slice(i, j) })
      i = j
      continue
    }
    if (/[A-Za-z_\u00C0-\u024F]/.test(c)) {
      let j = i
      while (j < sql.length && /[A-Za-z0-9_\u00C0-\u024F]/.test(sql[j])) j++
      const w = sql.slice(i, j)
      const up = w.toLocaleUpperCase('en')
      out.push(KEYWORDS.has(up) ? { t: 'kw', v: up, raw: w } : { t: 'id', v: w, raw: w })
      i = j
      continue
    }
    const two = sql.slice(i, i + 2)
    if (['<=', '>=', '<>', '!='].includes(two)) { out.push({ t: 'op', v: two, raw: two }); i += 2; continue }
    if ('=<>(),*;.+-/%'.includes(c)) { out.push({ t: 'op', v: c, raw: c }); i++; continue }
    throw new SqlError(`Tanınmayan karakter: '${c}' (1064)`)
  }
  return out
}

type Expr =
  | { k: 'lit'; v: Value }
  | { k: 'col'; table?: string; name: string }
  | { k: 'bin'; op: string; a: Expr; b: Expr }
  | { k: 'not'; a: Expr }
  | { k: 'neg'; a: Expr }
  | { k: 'in'; a: Expr; list: Expr[]; not: boolean }
  | { k: 'between'; a: Expr; lo: Expr; hi: Expr; not: boolean }
  | { k: 'isnull'; a: Expr; not: boolean }
  | { k: 'like'; a: Expr; pat: Expr; not: boolean }
  | { k: 'agg'; fn: string; arg: Expr | '*' }
  | { k: 'star' }

type Row = Record<string, Value>

class P {
  i = 0
  toks: Tok[]
  constructor(toks: Tok[]) { this.toks = toks }
  get cur(): Tok | undefined { return this.toks[this.i] }
  near(): string { return this.cur ? this.toks.slice(this.i, this.i + 3).map((t) => t.raw).join(' ') : 'sorgunun sonu' }
  isKw(v: string) { return this.cur?.t === 'kw' && this.cur.v === v }
  isOp(v: string) { return this.cur?.t === 'op' && this.cur.v === v }
  kw(v: string) {
    if (!this.isKw(v)) throw new SqlError(`SQL sözdizimi hatası: '${v}' bekleniyordu, '${this.near()}' yakınında. (1064)`)
    this.i++
  }
  op(v: string) {
    if (!this.isOp(v)) throw new SqlError(`SQL sözdizimi hatası: '${v}' bekleniyordu, '${this.near()}' yakınında. (1064)`)
    this.i++
  }
  ident(what: string): string {
    const c = this.cur
    if (c?.t === 'id') { this.i++; return c.v }
    throw new SqlError(`SQL sözdizimi hatası: ${what} bekleniyordu, '${this.near()}' yakınında. (1064)`)
  }

  expr(): Expr { return this.or() }
  or(): Expr {
    let a = this.and()
    while (this.isKw('OR')) { this.i++; a = { k: 'bin', op: 'OR', a, b: this.and() } }
    return a
  }
  and(): Expr {
    let a = this.not()
    while (this.isKw('AND')) { this.i++; a = { k: 'bin', op: 'AND', a, b: this.not() } }
    return a
  }
  not(): Expr {
    if (this.isKw('NOT')) { this.i++; return { k: 'not', a: this.not() } }
    return this.cmp()
  }
  cmp(): Expr {
    const a = this.add()
    const c = this.cur
    if (c?.t === 'op' && ['=', '<', '>', '<=', '>=', '<>', '!='].includes(c.v)) {
      this.i++
      return { k: 'bin', op: c.v === '!=' ? '<>' : c.v, a, b: this.add() }
    }
    let not = false
    if (this.isKw('NOT')) { not = true; this.i++ }
    if (this.isKw('LIKE')) { this.i++; return { k: 'like', a, pat: this.add(), not } }
    if (this.isKw('IN')) {
      this.i++
      this.op('(')
      const list = [this.expr()]
      while (this.isOp(',')) { this.i++; list.push(this.expr()) }
      this.op(')')
      return { k: 'in', a, list, not }
    }
    if (this.isKw('BETWEEN')) {
      this.i++
      const lo = this.add()
      this.kw('AND')
      return { k: 'between', a, lo, hi: this.add(), not }
    }
    if (not) throw new SqlError(`SQL sözdizimi hatası: NOT sonrası LIKE / IN / BETWEEN bekleniyordu. (1064)`)
    if (this.isKw('IS')) {
      this.i++
      let n = false
      if (this.isKw('NOT')) { n = true; this.i++ }
      this.kw('NULL')
      return { k: 'isnull', a, not: n }
    }
    return a
  }
  add(): Expr {
    let a = this.mul()
    while (this.isOp('+') || this.isOp('-')) { const op = this.cur!.v; this.i++; a = { k: 'bin', op, a, b: this.mul() } }
    return a
  }
  mul(): Expr {
    let a = this.unary()
    while (this.isOp('*') || this.isOp('/') || this.isOp('%')) { const op = this.cur!.v; this.i++; a = { k: 'bin', op, a, b: this.unary() } }
    return a
  }
  unary(): Expr {
    if (this.isOp('-')) { this.i++; return { k: 'neg', a: this.unary() } }
    return this.primary()
  }
  primary(): Expr {
    const c = this.cur
    if (!c) throw new SqlError('SQL sözdizimi hatası: sorgu yarım kalmış. (1064)')
    if (c.t === 'num') { this.i++; return { k: 'lit', v: Number(c.v) } }
    if (c.t === 'str') { this.i++; return { k: 'lit', v: c.v } }
    if (c.t === 'kw' && c.v === 'NULL') { this.i++; return { k: 'lit', v: null } }
    if (c.t === 'kw' && ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'].includes(c.v)) {
      this.i++
      this.op('(')
      let arg: Expr | '*'
      if (this.isOp('*')) { this.i++; arg = '*' } else arg = this.expr()
      this.op(')')
      return { k: 'agg', fn: c.v, arg }
    }
    if (c.t === 'op' && c.v === '(') {
      this.i++
      const e = this.expr()
      this.op(')')
      return e
    }
    if (c.t === 'id') {
      this.i++
      if (this.isOp('.')) {
        this.i++
        if (this.isOp('*')) { this.i++; return { k: 'star' } }
        return { k: 'col', table: c.v, name: this.ident('sütun adı') }
      }
      return { k: 'col', name: c.v }
    }
    throw new SqlError(`SQL sözdizimi hatası: '${this.near()}' yakınında. (1064)`)
  }
}

const lc = (s: string) => s.toLocaleLowerCase('tr')

function findTable(db: Database, name: string): Table {
  const t = Object.values(db).find((x) => lc(x.name) === lc(name))
  if (!t) throw new SqlError(`'${name}' adında bir tablo bulunamadı. (1146)`)
  return t
}

function truthy(v: Value): boolean {
  return v !== null && v !== 0 && v !== '' && v !== '0'
}

function cmpValues(a: Value, b: Value): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? -1 : 1
  const na = typeof a === 'number' ? a : Number(a)
  const nb = typeof b === 'number' ? b : Number(b)
  if ((typeof a === 'number' || typeof b === 'number') && !isNaN(na) && !isNaN(nb)) return na - nb
  return String(a).localeCompare(String(b), 'tr', { sensitivity: 'base' })
}

interface Scope {
  row: Row
  /** sütun anahtarları: "tablo.sütun" (küçük harf) */
  group?: Row[]
}

function lookup(scope: Row, e: { table?: string; name: string }): Value {
  const name = lc(e.name)
  if (e.table) {
    const key = `${lc(e.table)}.${name}`
    if (key in scope) return scope[key]
    throw new SqlError(`Bilinmeyen sütun '${e.table}.${e.name}'. (1054)`)
  }
  const keys = Object.keys(scope).filter((k) => k.split('.')[1] === name)
  if (keys.length === 0) throw new SqlError(`Bilinmeyen sütun '${e.name}'. Tablodaki sütun adlarını kontrol edin. (1054)`)
  if (keys.length > 1) throw new SqlError(`'${e.name}' sütunu belirsiz; tablo adıyla yazın (ör. tablo.${e.name}). (1052)`)
  return scope[keys[0]]
}

function evalExpr(e: Expr, s: Scope): Value {
  switch (e.k) {
    case 'lit': return e.v
    case 'col': return lookup(s.row, e)
    case 'star': throw new SqlError('* burada kullanılamaz. (1064)')
    case 'neg': { const v = evalExpr(e.a, s); return v === null ? null : -Number(v) }
    case 'not': return truthy(evalExpr(e.a, s)) ? 0 : 1
    case 'isnull': { const v = evalExpr(e.a, s) === null; return (e.not ? !v : v) ? 1 : 0 }
    case 'like': {
      const v = evalExpr(e.a, s)
      const p = evalExpr(e.pat, s)
      if (v === null || p === null) return 0
      const re = new RegExp('^' + String(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i')
      const r = re.test(String(v))
      return (e.not ? !r : r) ? 1 : 0
    }
    case 'in': {
      const v = evalExpr(e.a, s)
      const r = e.list.some((x) => cmpValues(v, evalExpr(x, s)) === 0)
      return (e.not ? !r : r) ? 1 : 0
    }
    case 'between': {
      const v = evalExpr(e.a, s)
      const r = cmpValues(v, evalExpr(e.lo, s)) >= 0 && cmpValues(v, evalExpr(e.hi, s)) <= 0
      return (e.not ? !r : r) ? 1 : 0
    }
    case 'agg': {
      const rows = s.group
      if (!rows) throw new SqlError(`${e.fn}() yalnızca SELECT listesinde kullanılabilir. (1111)`)
      if (e.fn === 'COUNT') return e.arg === '*' ? rows.length : rows.filter((r) => evalExpr(e.arg as Expr, { row: r }) !== null).length
      const vals = rows.map((r) => evalExpr(e.arg as Expr, { row: r })).filter((v) => v !== null).map(Number)
      if (!vals.length) return null
      if (e.fn === 'SUM') return vals.reduce((a, b) => a + b, 0)
      if (e.fn === 'AVG') return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10000) / 10000
      if (e.fn === 'MIN') return Math.min(...vals)
      return Math.max(...vals)
    }
    case 'bin': {
      if (e.op === 'AND') return truthy(evalExpr(e.a, s)) && truthy(evalExpr(e.b, s)) ? 1 : 0
      if (e.op === 'OR') return truthy(evalExpr(e.a, s)) || truthy(evalExpr(e.b, s)) ? 1 : 0
      const a = evalExpr(e.a, s)
      const b = evalExpr(e.b, s)
      if (['+', '-', '*', '/', '%'].includes(e.op)) {
        if (a === null || b === null) return null
        const x = Number(a)
        const y = Number(b)
        if (e.op === '+') return x + y
        if (e.op === '-') return x - y
        if (e.op === '*') return x * y
        if (e.op === '%') return x % y
        return y === 0 ? null : Math.round((x / y) * 10000) / 10000
      }
      if (a === null || b === null) return 0
      const c = cmpValues(a, b)
      const r = e.op === '=' ? c === 0 : e.op === '<>' ? c !== 0 : e.op === '<' ? c < 0 : e.op === '>' ? c > 0 : e.op === '<=' ? c <= 0 : c >= 0
      return r ? 1 : 0
    }
  }
}

function hasAgg(e: Expr): boolean {
  switch (e.k) {
    case 'agg': return true
    case 'bin': return hasAgg(e.a) || hasAgg(e.b)
    case 'not': case 'neg': case 'isnull': return hasAgg(e.a)
    default: return false
  }
}

function exprLabel(e: Expr, raw: string): string {
  if (e.k === 'col') return e.name
  return raw
}

function coerce(v: Value, col: Column): Value {
  if (v === null) {
    if (col.notNull || col.pk) throw new SqlError(`'${col.name}' sütunu boş (NULL) olamaz. (1048)`)
    return null
  }
  const t = col.type.toUpperCase()
  if (/INT|DECIMAL|FLOAT|DOUBLE|NUMERIC/.test(t)) {
    const n = Number(v)
    if (isNaN(n)) throw new SqlError(`'${col.name}' sütunu sayısal (${col.type}); '${v}' değeri uygun değil. (1366)`)
    return /INT/.test(t) ? Math.trunc(n) : n
  }
  const m = /VARCHAR\((\d+)\)|CHAR\((\d+)\)/.exec(t)
  const s = String(v)
  if (m) {
    const max = Number(m[1] ?? m[2])
    if (s.length > max) throw new SqlError(`'${col.name}' sütunu için veri çok uzun (en fazla ${max} karakter). (1406)`)
  }
  return s
}

export function cloneDb(db: Database): Database {
  return JSON.parse(JSON.stringify(db)) as Database
}

/** Bir veya birden çok SQL deyimini çalıştırır; veritabanını yerinde değiştirir. */
export function execute(db: Database, sql: string): QueryResult[] {
  const toks = tokenize(sql)
  const results: QueryResult[] = []
  const p = new P(toks)
  while (p.cur) {
    if (p.isOp(';')) { p.i++; continue }
    results.push(statement(db, p, sql))
    if (p.cur && !p.isOp(';')) throw new SqlError(`SQL sözdizimi hatası: '${p.near()}' yakınında. Deyimler arasında ';' kullanın. (1064)`)
  }
  if (!results.length) throw new SqlError('Çalıştırılacak bir sorgu yazmadınız.')
  return results
}

function statement(db: Database, p: P, sql: string): QueryResult {
  const c = p.cur!
  if (c.t !== 'kw') throw new SqlError(`SQL sözdizimi hatası: '${p.near()}' yakınında. Sorgu SELECT, INSERT, UPDATE, DELETE veya CREATE ile başlamalı. (1064)`)
  switch (c.v) {
    case 'SELECT': return select(db, p, sql)
    case 'INSERT': return insert(db, p)
    case 'UPDATE': return update(db, p)
    case 'DELETE': return del(db, p)
    case 'CREATE': return create(db, p)
    case 'DROP': {
      p.i++
      p.kw('TABLE')
      const t = findTable(db, p.ident('tablo adı'))
      delete db[Object.keys(db).find((k) => db[k] === t)!]
      return { kind: 'create', columns: [], rows: [], affected: 0, message: `'${t.name}' tablosu silindi.`, ordered: false }
    }
  }
  throw new SqlError(`SQL sözdizimi hatası: '${p.near()}' yakınında. (1064)`)
}

function rowsOf(t: Table, alias: string): Row[] {
  return t.rows.map((r) => {
    const o: Row = {}
    for (const col of t.columns) o[`${lc(alias)}.${lc(col.name)}`] = r[col.name] ?? null
    return o
  })
}

function select(db: Database, p: P, sql: string): QueryResult {
  p.kw('SELECT')
  let distinct = false
  if (p.isKw('DISTINCT')) { distinct = true; p.i++ }
  const items: { e: Expr | 'star'; label: string }[] = []
  for (;;) {
    if (p.isOp('*')) {
      p.i++
      items.push({ e: 'star', label: '*' })
    } else {
      const start = p.i
      const e = p.expr()
      let label = exprLabel(e, p.toks.slice(start, p.i).map((t) => t.raw).join('').replace(/,/g, ', '))
      if (p.isKw('AS')) { p.i++; label = p.cur?.t === 'str' ? p.toks[p.i++].v : p.ident('takma ad') }
      else if (p.cur?.t === 'id') label = p.ident('takma ad')
      items.push({ e, label })
    }
    if (p.isOp(',')) { p.i++; continue }
    break
  }
  p.kw('FROM')
  const tName = p.ident('tablo adı')
  const t = findTable(db, tName)
  let alias = t.name
  if (p.isKw('AS')) { p.i++; alias = p.ident('takma ad') }
  else if (p.cur?.t === 'id') alias = p.ident('takma ad')
  let rows = rowsOf(t, alias)
  const tables: { t: Table; alias: string }[] = [{ t, alias }]
  while (p.isKw('JOIN') || p.isKw('INNER') || p.isKw('LEFT')) {
    let left = false
    if (p.isKw('INNER')) p.i++
    else if (p.isKw('LEFT')) { left = true; p.i++ }
    p.kw('JOIN')
    const t2 = findTable(db, p.ident('tablo adı'))
    let a2 = t2.name
    if (p.isKw('AS')) { p.i++; a2 = p.ident('takma ad') }
    else if (p.cur?.t === 'id') a2 = p.ident('takma ad')
    p.kw('ON')
    const on = p.expr()
    const right = rowsOf(t2, a2)
    const out: Row[] = []
    for (const r of rows) {
      let matched = false
      for (const r2 of right) {
        const m = { ...r, ...r2 }
        if (truthy(evalExpr(on, { row: m }))) { out.push(m); matched = true }
      }
      if (left && !matched) {
        const empty: Row = {}
        for (const col of t2.columns) empty[`${lc(a2)}.${lc(col.name)}`] = null
        out.push({ ...r, ...empty })
      }
    }
    rows = out
    tables.push({ t: t2, alias: a2 })
  }
  if (p.isKw('WHERE')) {
    p.i++
    const w = p.expr()
    rows = rows.filter((r) => truthy(evalExpr(w, { row: r })))
  }
  let groups: Row[][] | null = null
  if (p.isKw('GROUP')) {
    p.i++
    p.kw('BY')
    const keys = [p.expr()]
    while (p.isOp(',')) { p.i++; keys.push(p.expr()) }
    const map = new Map<string, Row[]>()
    for (const r of rows) {
      const k = JSON.stringify(keys.map((k) => evalExpr(k, { row: r })))
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(r)
    }
    groups = [...map.values()]
  }
  let having: Expr | null = null
  if (p.isKw('HAVING')) { p.i++; having = p.expr() }
  const order: { e: Expr; desc: boolean }[] = []
  if (p.isKw('ORDER')) {
    p.i++
    p.kw('BY')
    for (;;) {
      const e = p.expr()
      let desc = false
      if (p.isKw('DESC')) { desc = true; p.i++ } else if (p.isKw('ASC')) p.i++
      order.push({ e, desc })
      if (p.isOp(',')) { p.i++; continue }
      break
    }
  }
  let limit: number | null = null
  if (p.isKw('LIMIT')) {
    p.i++
    const n = p.cur
    if (n?.t !== 'num') throw new SqlError('LIMIT sonrasında bir sayı bekleniyor. (1064)')
    p.i++
    limit = Number(n.v)
  }

  const aggregate = items.some((it) => it.e !== 'star' && hasAgg(it.e))
  if (aggregate && !groups) groups = [rows]
  const columns: string[] = []
  for (const it of items) {
    if (it.e === 'star') for (const tb of tables) for (const col of tb.t.columns) columns.push(col.name)
    else columns.push(it.label)
  }
  const scopes: Scope[] = groups ? groups.filter((g) => g.length || aggregate).map((g) => ({ row: g[0] ?? {}, group: g })) : rows.map((r) => ({ row: r }))
  let out = scopes
    .filter((s) => !having || truthy(evalExpr(having, s)))
    .map((s) => {
      const vals: Value[] = []
      for (const it of items) {
        if (it.e === 'star') {
          for (const tb of tables) for (const col of tb.t.columns) vals.push(s.row[`${lc(tb.alias)}.${lc(col.name)}`] ?? null)
        } else vals.push(evalExpr(it.e, s))
      }
      return { vals, s }
    })
  if (order.length) {
    out.sort((x, y) => {
      for (const o of order) {
        let a: Value
        let b: Value
        // ORDER BY bir takma ada veya seçilen sütuna işaret edebilir
        const idx = o.e.k === 'col' && !o.e.table ? items.findIndex((it) => lc(it.label) === lc((o.e as { name: string }).name)) : -1
        if (idx >= 0 && items[idx].e !== 'star') { a = x.vals[idx]; b = y.vals[idx] }
        else { a = evalExpr(o.e, x.s); b = evalExpr(o.e, y.s) }
        const c = cmpValues(a, b)
        if (c !== 0) return o.desc ? -c : c
      }
      return 0
    })
  }
  let vals = out.map((o) => o.vals)
  if (distinct) {
    const seen = new Set<string>()
    vals = vals.filter((v) => { const k = JSON.stringify(v); if (seen.has(k)) return false; seen.add(k); return true })
  }
  if (limit !== null) vals = vals.slice(0, limit)
  void sql
  return { kind: 'select', columns, rows: vals, affected: vals.length, message: `${vals.length} satır listelendi.`, ordered: order.length > 0 }
}

function insert(db: Database, p: P): QueryResult {
  p.kw('INSERT')
  p.kw('INTO')
  const t = findTable(db, p.ident('tablo adı'))
  let cols: Column[] = t.columns.filter((c) => !c.autoInc)
  let explicit = false
  if (p.isOp('(')) {
    p.i++
    explicit = true
    cols = []
    for (;;) {
      const n = p.ident('sütun adı')
      const col = t.columns.find((c) => lc(c.name) === lc(n))
      if (!col) throw new SqlError(`'${t.name}' tablosunda '${n}' adında bir sütun yok. (1054)`)
      cols.push(col)
      if (p.isOp(',')) { p.i++; continue }
      break
    }
    p.op(')')
  }
  p.kw('VALUES')
  let count = 0
  for (;;) {
    p.op('(')
    const vals: Value[] = []
    for (;;) {
      vals.push(evalExpr(p.expr(), { row: {} }))
      if (p.isOp(',')) { p.i++; continue }
      break
    }
    p.op(')')
    let useCols = cols
    if (!explicit && vals.length === t.columns.length) useCols = t.columns
    if (vals.length !== useCols.length) throw new SqlError(`Sütun sayısı ile değer sayısı eşleşmiyor (${useCols.length} sütun, ${vals.length} değer). (1136)`)
    const row: Row = {}
    for (const col of t.columns) row[col.name] = null
    useCols.forEach((col, i) => { row[col.name] = coerce(vals[i], col) })
    for (const col of t.columns) {
      if (col.autoInc && row[col.name] === null) row[col.name] = Math.max(0, ...t.rows.map((r) => Number(r[col.name]) || 0)) + 1
      if (row[col.name] === null && (col.notNull || col.pk)) throw new SqlError(`'${col.name}' sütunu için bir değer girilmeli (NULL olamaz). (1364)`)
      if (col.pk && t.rows.some((r) => cmpValues(r[col.name], row[col.name]) === 0)) throw new SqlError(`Yinelenen kayıt: '${row[col.name]}' değeri '${col.name}' birincil anahtarında zaten var. (1062)`)
    }
    t.rows.push(row)
    count++
    if (p.isOp(',')) { p.i++; continue }
    break
  }
  return { kind: 'change', columns: [], rows: [], affected: count, message: `${count} satır eklendi.`, ordered: false }
}

function update(db: Database, p: P): QueryResult {
  p.kw('UPDATE')
  const t = findTable(db, p.ident('tablo adı'))
  p.kw('SET')
  const sets: { col: Column; e: Expr }[] = []
  for (;;) {
    const n = p.ident('sütun adı')
    const col = t.columns.find((c) => lc(c.name) === lc(n))
    if (!col) throw new SqlError(`Bilinmeyen sütun '${n}'. (1054)`)
    p.op('=')
    sets.push({ col, e: p.expr() })
    if (p.isOp(',')) { p.i++; continue }
    break
  }
  let where: Expr | null = null
  if (p.isKw('WHERE')) { p.i++; where = p.expr() }
  let count = 0
  const view = rowsOf(t, t.name)
  t.rows.forEach((r, i) => {
    if (where && !truthy(evalExpr(where, { row: view[i] }))) return
    const newVals = sets.map((s) => coerce(evalExpr(s.e, { row: view[i] }), s.col))
    sets.forEach((s, k) => { r[s.col.name] = newVals[k] })
    count++
  })
  return { kind: 'change', columns: [], rows: [], affected: count, message: `${count} satır güncellendi.${where ? '' : ' (WHERE yazılmadığı için TÜM satırlar değişti!)'}`, ordered: false }
}

function del(db: Database, p: P): QueryResult {
  p.kw('DELETE')
  p.kw('FROM')
  const t = findTable(db, p.ident('tablo adı'))
  let where: Expr | null = null
  if (p.isKw('WHERE')) { p.i++; where = p.expr() }
  const view = rowsOf(t, t.name)
  const before = t.rows.length
  t.rows = t.rows.filter((_, i) => where && !truthy(evalExpr(where, { row: view[i] })))
  const n = before - t.rows.length
  return { kind: 'change', columns: [], rows: [], affected: n, message: `${n} satır silindi.${where ? '' : ' (WHERE yazılmadığı için TÜM satırlar silindi!)'}`, ordered: false }
}

function create(db: Database, p: P): QueryResult {
  p.kw('CREATE')
  p.kw('TABLE')
  const name = p.ident('tablo adı')
  if (Object.values(db).some((t) => lc(t.name) === lc(name))) throw new SqlError(`'${name}' tablosu zaten var. (1050)`)
  p.op('(')
  const columns: Column[] = []
  for (;;) {
    if (p.isKw('PRIMARY')) {
      p.i++
      p.kw('KEY')
      p.op('(')
      const n = p.ident('sütun adı')
      p.op(')')
      const col = columns.find((c) => lc(c.name) === lc(n))
      if (!col) throw new SqlError(`PRIMARY KEY için '${n}' sütunu bulunamadı. (1072)`)
      col.pk = true
    } else {
      const cname = p.ident('sütun adı')
      const tt = p.cur
      if (!tt || (tt.t !== 'id' && tt.t !== 'kw')) throw new SqlError(`'${cname}' sütunu için veri türü bekleniyordu (ör. INT, VARCHAR(50)). (1064)`)
      p.i++
      let type = tt.v.toUpperCase()
      if (p.isOp('(')) {
        p.i++
        const parts: string[] = []
        while (p.cur && !p.isOp(')')) { parts.push(p.cur.v); p.i++ }
        p.op(')')
        type += `(${parts.join('')})`
      }
      if (!/^(INT|INTEGER|TINYINT|SMALLINT|BIGINT|VARCHAR|CHAR|TEXT|DATE|DATETIME|DECIMAL|FLOAT|DOUBLE|BOOLEAN|BOOL|BIT)/.test(type)) {
        throw new SqlError(`'${tt.raw}' geçerli bir veri türü değil (ör. INT, VARCHAR(50), DATE, DECIMAL(10,2)). (1064)`)
      }
      if (/^(VARCHAR|CHAR)$/.test(type)) throw new SqlError(`${type} türü için uzunluk belirtilmeli: ${type}(50) (1064)`)
      const col: Column = { name: cname, type }
      for (;;) {
        if (p.isKw('PRIMARY')) { p.i++; p.kw('KEY'); col.pk = true; continue }
        if (p.isKw('AUTO_INCREMENT')) { p.i++; col.autoInc = true; continue }
        if (p.isKw('NOT')) { p.i++; p.kw('NULL'); col.notNull = true; continue }
        if (p.isKw('NULL')) { p.i++; continue }
        break
      }
      columns.push(col)
    }
    if (p.isOp(',')) { p.i++; continue }
    break
  }
  p.op(')')
  db[name] = { name, columns, rows: [] }
  return { kind: 'create', columns: [], rows: [], affected: 0, message: `'${name}' tablosu oluşturuldu.`, ordered: false }
}

const norm = (v: Value) => (v === null ? null : typeof v === 'number' ? v : isNaN(Number(v)) || v === '' ? String(v) : Number(v))

/** İki SELECT sonucunu karşılaştırır (ORDER BY yoksa satır sırası önemsiz). */
export function sameResult(a: QueryResult, b: QueryResult, ordered: boolean): boolean {
  if (a.columns.length !== b.columns.length || a.rows.length !== b.rows.length) return false
  const key = (r: Value[]) => JSON.stringify(r.map(norm))
  const ra = a.rows.map(key)
  const rb = b.rows.map(key)
  if (!ordered) { ra.sort(); rb.sort() }
  return ra.every((x, i) => x === rb[i])
}

export function sameDb(a: Database, b: Database): boolean {
  const names = (d: Database) => Object.values(d).map((t) => lc(t.name)).sort()
  if (JSON.stringify(names(a)) !== JSON.stringify(names(b))) return false
  for (const ta of Object.values(a)) {
    const tb = Object.values(b).find((t) => lc(t.name) === lc(ta.name))!
    const colsA = ta.columns.map((c) => `${lc(c.name)}:${c.type.replace(/\s/g, '')}:${!!c.pk}`)
    const colsB = tb.columns.map((c) => `${lc(c.name)}:${c.type.replace(/\s/g, '')}:${!!c.pk}`)
    if (JSON.stringify(colsA.map((c) => c.split(':')[0])) !== JSON.stringify(colsB.map((c) => c.split(':')[0]))) return false
    const rows = (t: Table) => t.rows.map((r) => JSON.stringify(t.columns.map((c) => norm(r[c.name])))).sort()
    if (JSON.stringify(rows(ta)) !== JSON.stringify(rows(tb))) return false
  }
  return true
}
