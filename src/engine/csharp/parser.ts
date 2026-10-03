// Sınıf / arayüz / üye düzeyinde basit bir C# ayrıştırıcısı.
// Metot gövdeleri token dizisi olarak saklanır; gövde analizi body.ts'de yapılır.
import { lex, type Token } from './lexer'

export type Access = 'public' | 'private' | 'protected' | 'internal'

export interface Diagnostic {
  line: number
  code: string
  message: string
  severity: 'error' | 'warning'
}

export interface Param {
  type: string
  name: string
  hasDefault: boolean
}

interface MemberBase {
  name: string
  modifiers: string[]
  access: Access
  line: number
  isStatic: boolean
}

export interface FieldMember extends MemberBase {
  kind: 'field'
  type: string
  init: string | null
}

export interface Accessor {
  modifiers: string[]
  body: Token[] | null
}

export interface PropertyMember extends MemberBase {
  kind: 'property'
  type: string
  get: Accessor | null
  set: Accessor | null
  auto: boolean
}

export interface MethodMember extends MemberBase {
  kind: 'method'
  returnType: string
  params: Param[]
  body: Token[] | null
}

export interface CtorMember extends MemberBase {
  kind: 'ctor'
  params: Param[]
  body: Token[] | null
  initializer: { kind: 'base' | 'this'; args: number } | null
}

export interface DtorMember extends MemberBase {
  kind: 'dtor'
  params: Param[]
  body: Token[] | null
}

export type Member = FieldMember | PropertyMember | MethodMember | CtorMember | DtorMember

export interface TypeDecl {
  kind: 'class' | 'interface' | 'struct' | 'enum'
  name: string
  modifiers: string[]
  bases: string[]
  members: Member[]
  line: number
  enumValues: string[]
}

export interface Program {
  source: string
  tokens: Token[]
  types: TypeDecl[]
  usings: string[]
  topLevel: Token[]
  diagnostics: Diagnostic[]
}

export const MODIFIERS = new Set([
  'public', 'private', 'protected', 'internal', 'static', 'abstract', 'sealed', 'partial', 'virtual',
  'override', 'readonly', 'const', 'new', 'async', 'extern', 'unsafe', 'volatile',
])
const TYPE_KW = new Set(['class', 'interface', 'struct', 'enum', 'record'])
export const NON_TYPE_KW = new Set([
  'return', 'new', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'throw', 'try', 'catch', 'finally', 'using', 'lock', 'goto', 'yield', 'await', 'this', 'base', 'true',
  'false', 'null', 'typeof', 'default', 'in', 'is', 'as', 'out', 'ref', 'get', 'set', 'class', 'interface',
  'struct', 'enum', 'namespace', 'public', 'private', 'protected', 'internal', 'static', 'abstract',
  'sealed', 'virtual', 'override', 'readonly', 'const', 'operator',
])

export function accessOf(mods: string[], fallback: Access): Access {
  if (mods.includes('public')) return 'public'
  if (mods.includes('protected')) return 'protected'
  if (mods.includes('internal')) return 'internal'
  if (mods.includes('private')) return 'private'
  return fallback
}

/** Konum `pos` bir açılış parantezindeyken eşleşen kapanışın indeksini döndürür (bulunamazsa -1). */
export function matchClose(tokens: Token[], pos: number): number {
  const open = tokens[pos].value
  const close = open === '(' ? ')' : open === '[' ? ']' : '}'
  let depth = 0
  for (let i = pos; i < tokens.length; i++) {
    const v = tokens[i].value
    if (tokens[i].kind !== 'punct') continue
    if (v === open) depth++
    else if (v === close) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/** Bir tür ifadesini (ör. `List<int>`, `string[]`, `System.Int32`) okur. */
export function parseTypeRef(tokens: Token[], pos: number): { text: string; end: number } | null {
  const t = tokens[pos]
  if (!t || t.kind !== 'ident' || NON_TYPE_KW.has(t.value)) return null
  let i = pos + 1
  let text = t.value
  while (tokens[i]?.value === '.' && tokens[i + 1]?.kind === 'ident') {
    text += '.' + tokens[i + 1].value
    i += 2
  }
  if (tokens[i]?.value === '<') {
    let depth = 0
    let j = i
    let ok = false
    for (; j < tokens.length; j++) {
      const v = tokens[j].value
      if (v === '<') depth++
      else if (v === '>') {
        depth--
        if (depth === 0) {
          ok = true
          break
        }
      } else if (!(tokens[j].kind === 'ident' || v === ',' || v === '.' || v === '[' || v === ']' || v === '?')) break
    }
    if (!ok) return null
    text += tokens.slice(i, j + 1).map((x) => x.value).join('').replace(/,/g, ', ')
    i = j + 1
  }
  if (tokens[i]?.value === '?') {
    text += '?'
    i++
  }
  while (tokens[i]?.value === '[') {
    let j = i + 1
    while (tokens[j]?.value === ',') j++
    if (tokens[j]?.value !== ']') break
    text += '[' + ','.repeat(j - i - 1) + ']'
    i = j + 1
  }
  return { text, end: i }
}

class Parser {
  pos = 0
  diags: Diagnostic[] = []
  types: TypeDecl[] = []
  usings: string[] = []
  topLevel: Token[] = []
  tokens: Token[]

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  /** Geçerli token (metot olarak: TS daraltması pos değişince yanılmasın) */
  get tok(): Token | undefined {
    return this.tokens[this.pos]
  }

  /** Daraltmadan etkilenmeyen okuma (pos değiştikten sonra) */
  peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  lastLine(): number {
    return this.tokens[this.tokens.length - 1]?.line ?? 1
  }

  err(line: number, code: string, message: string) {
    this.diags.push({ line, code, message, severity: 'error' })
  }

  expect(value: string, code = 'CS1002'): boolean {
    if (this.tok?.value === value) {
      this.pos++
      return true
    }
    const prev = this.tokens[this.pos - 1]
    this.err(prev?.line ?? this.tok?.line ?? 1, code, `'${value}' bekleniyor.`)
    return false
  }

  /** Hata sonrası toparlanma: ';' veya dengeli bir bloğun sonuna kadar atla. */
  recover(stopAtClose: boolean) {
    while (this.tok) {
      const v = this.tok.value
      if (v === ';') {
        this.pos++
        return
      }
      if (v === '{' || v === '(' || v === '[') {
        const c = matchClose(this.tokens, this.pos)
        this.pos = c < 0 ? this.tokens.length : c + 1
        if (v === '{') return
        continue
      }
      if (v === '}' && stopAtClose) return
      this.pos++
    }
  }

  readModifiers(): string[] {
    const mods: string[] = []
    while (this.tok && this.tok.kind === 'ident' && MODIFIERS.has(this.tok.value)) {
      if (mods.includes(this.tok.value)) this.err(this.tok.line, 'CS1004', `'${this.tok.value}' erişim/niteleyici sözcüğü tekrarlanmış.`)
      mods.push(this.tok.value)
      this.pos++
    }
    const accessCount = mods.filter((m) => ['public', 'private', 'protected', 'internal'].includes(m)).length
    if (accessCount > 1 && !(mods.includes('protected') && (mods.includes('internal') || mods.includes('private')))) {
      this.err(this.tokens[this.pos - 1].line, 'CS0107', 'Birden fazla erişim belirleyici kullanılamaz.')
    }
    return mods
  }

  skipAttributes() {
    while (this.tok?.value === '[') {
      const c = matchClose(this.tokens, this.pos)
      this.pos = c < 0 ? this.tokens.length : c + 1
    }
  }

  parseFile() {
    this.parseScope(this.tokens.length)
  }

  parseScope(end: number) {
    while (this.pos < end && this.tok) {
      const t = this.tok
      if (t.value === 'using' && this.tokens[this.pos + 1]?.kind === 'ident' && this.tokens[this.pos + 1]?.value !== 'var') {
        const start = this.pos + 1
        while (this.tok && this.tok.value !== ';' && this.tok.line === t.line) this.pos++
        this.usings.push(this.tokens.slice(start, this.pos).map((x) => x.value).join(''))
        if (this.tok?.value === ';') this.pos++
        else this.err(t.line, 'CS1002', "using satırının sonunda ';' bekleniyor.")
        continue
      }
      if (t.value === 'namespace') {
        this.pos++
        while (this.tok && (this.tok.kind === 'ident' || this.tok.value === '.')) this.pos++
        if (this.tok?.value === ';') {
          this.pos++
          continue
        }
        if (this.tok?.value === '{') {
          const c = matchClose(this.tokens, this.pos)
          if (c < 0) {
            this.err(t.line, 'CS1513', "Ad alanı (namespace) kapatılmamış: '}' bekleniyor.")
            this.pos++
            this.parseScope(this.tokens.length)
            return
          }
          this.pos++
          this.parseScope(c)
          this.pos = c + 1
          continue
        }
        this.err(t.line, 'CS1514', "Ad alanı adından sonra '{' bekleniyor.")
        continue
      }
      const save = this.pos
      this.skipAttributes()
      const mods = this.readModifiers()
      if (this.tok && TYPE_KW.has(this.tok.value)) {
        this.parseType(mods)
        continue
      }
      // Üst düzey ifade (top-level statements)
      this.pos = save
      if (t.value === '}') {
        this.err(t.line, 'CS1022', "Fazladan '}' var veya bir blok yanlış yerde kapatılmış.")
        this.pos++
        continue
      }
      const start = this.pos
      this.skipStatement()
      this.topLevel.push(...this.tokens.slice(start, this.pos))
    }
  }

  /** Bir deyimi (statement) atlar — üst düzey ifadeleri toplamak için kullanılır. */
  skipStatement() {
    const first = this.tok
    if (!first) return
    if (first.value === '{') {
      const c = matchClose(this.tokens, this.pos)
      this.pos = c < 0 ? this.tokens.length : c + 1
      return
    }
    while (this.tok) {
      const v = this.tok.value
      if (v === ';') {
        this.pos++
        return
      }
      if (v === '(' || v === '[') {
        const c = matchClose(this.tokens, this.pos)
        this.pos = c < 0 ? this.tokens.length : c + 1
        continue
      }
      if (v === '{') {
        const c = matchClose(this.tokens, this.pos)
        this.pos = c < 0 ? this.tokens.length : c + 1
        // if/for/while/metot gövdesi bloğu ise deyim burada biter
        const next = this.tok?.value
        if (next !== ';' && next !== ')' && next !== ',' && next !== '.') return
        continue
      }
      if (v === '}') return
      this.pos++
    }
  }

  parseType(mods: string[]) {
    const kw = this.tok!
    this.pos++
    const nameTok = this.tok
    if (!nameTok || nameTok.kind !== 'ident') {
      this.err(kw.line, 'CS1001', `${kw.value} sözcüğünden sonra bir ad (tanımlayıcı) bekleniyor.`)
      this.recover(false)
      return
    }
    this.pos++
    if (this.tok?.value === '<') {
      const r = parseTypeRef(this.tokens, this.pos - 1)
      if (r) this.pos = r.end
    }
    const kind = (kw.value === 'record' ? 'class' : kw.value) as TypeDecl['kind']
    const decl: TypeDecl = {
      kind,
      name: nameTok.value,
      modifiers: mods,
      bases: [],
      members: [],
      line: kw.line,
      enumValues: [],
    }
    if (this.tok?.value === '(') {
      // record birincil yapıcı – atla
      const c = matchClose(this.tokens, this.pos)
      this.pos = c < 0 ? this.tokens.length : c + 1
    }
    if (this.tok?.value === ':') {
      this.pos++
      for (;;) {
        const r = parseTypeRef(this.tokens, this.pos)
        if (!r) {
          this.err(this.tok?.line ?? kw.line, 'CS1031', "':' işaretinden sonra temel sınıf veya arayüz adı bekleniyor.")
          break
        }
        decl.bases.push(r.text)
        this.pos = r.end
        if (this.peek()?.value === ',') {
          this.pos++
          continue
        }
        break
      }
    }
    while (this.tok?.value === 'where') {
      while (this.peek() && this.peek()!.value !== '{') this.pos++
    }
    this.types.push(decl)
    if (this.tok?.value === ';') {
      this.pos++
      return
    }
    if (this.tok?.value !== '{') {
      this.err(this.tokens[this.pos - 1].line, 'CS1514', `'${decl.name}' tanımından sonra '{' bekleniyor.`)
      return
    }
    const close = matchClose(this.tokens, this.pos)
    if (close < 0) {
      this.err(kw.line, 'CS1513', `'${decl.name}' ${kindName(kind)} kapatılmamış: '}' bekleniyor.`)
    }
    const end = close < 0 ? this.tokens.length : close
    this.pos++
    if (kind === 'enum') {
      for (let i = this.pos; i < end; i++) {
        if (this.tokens[i].kind === 'ident' && (i === this.pos || this.tokens[i - 1].value === ',')) decl.enumValues.push(this.tokens[i].value)
      }
      this.pos = end + 1
      return
    }
    while (this.pos < end) {
      const before = this.pos
      this.parseMember(decl, end)
      if (this.pos === before) this.pos++
    }
    this.pos = end + 1
  }

  parseParams(): Param[] {
    // tok '(' üzerinde
    const close = matchClose(this.tokens, this.pos)
    const end = close < 0 ? this.tokens.length : close
    const params: Param[] = []
    let i = this.pos + 1
    while (i < end) {
      while (['ref', 'out', 'in', 'params', 'this'].includes(this.tokens[i]?.value)) i++
      const r = parseTypeRef(this.tokens, i)
      if (!r) {
        this.err(this.tokens[i]?.line ?? 1, 'CS1001', 'Parametre listesinde tür ve ad bekleniyor (ör. int sayi).')
        break
      }
      const nameTok = this.tokens[r.end]
      if (!nameTok || nameTok.kind !== 'ident') {
        this.err(this.tokens[i].line, 'CS1001', `Parametrenin adı eksik: '${r.text}' türünden sonra bir ad yazmalısınız.`)
        break
      }
      i = r.end + 1
      let hasDefault = false
      if (this.tokens[i]?.value === '=') {
        hasDefault = true
        while (i < end && this.tokens[i].value !== ',') i++
      }
      params.push({ type: r.text, name: nameTok.value, hasDefault })
      if (this.tokens[i]?.value === ',') i++
      else if (i < end) {
        this.err(this.tokens[i].line, 'CS1003', "Parametreler arasında ',' bekleniyor.")
        break
      }
    }
    if (close < 0) this.err(this.tok!.line, 'CS1026', "')' bekleniyor.")
    this.pos = end + 1
    return params
  }

  /** Metot / yapıcı gövdesini okur: `{...}`, `=> ifade;` veya `;` */
  parseBody(ownerLine: number): Token[] | null {
    const t = this.tok
    if (t?.value === '{') {
      const c = matchClose(this.tokens, this.pos)
      if (c < 0) {
        this.err(t.line, 'CS1513', "Metot gövdesi kapatılmamış: '}' bekleniyor.")
        const body = this.tokens.slice(this.pos + 1)
        this.pos = this.tokens.length
        return body
      }
      const body = this.tokens.slice(this.pos + 1, c)
      this.pos = c + 1
      return body
    }
    if (t?.value === '=>') {
      const start = this.pos + 1
      while (this.tok && this.tok.value !== ';' && this.tok.value !== '}') this.pos++
      const body = this.tokens.slice(start, this.pos)
      body.push({ kind: 'punct', value: ';', line: body[body.length - 1]?.line ?? ownerLine, start: 0, end: 0 })
      // `=> x` → `return x;` gibi davran
      body.unshift({ kind: 'ident', value: 'return', line: body[0]?.line ?? ownerLine, start: 0, end: 0 })
      this.expect(';')
      return body
    }
    if (t?.value === ';') {
      this.pos++
      return null
    }
    this.err(this.tokens[this.pos - 1]?.line ?? ownerLine, 'CS1002', "Metot tanımından sonra '{' (gövde) veya ';' bekleniyor.")
    this.recover(true)
    return null
  }

  parseMember(decl: TypeDecl, end: number) {
    const t = this.tok!
    if (t.value === ';') {
      this.pos++
      return
    }
    this.skipAttributes()
    const mods = this.readModifiers()
    const fallback: Access = decl.kind === 'interface' ? 'public' : 'private'
    const access = accessOf(mods, fallback)
    const isStatic = mods.includes('static') || mods.includes('const')
    const line = this.tok?.line ?? t.line
    if (!this.tok || this.pos >= end) {
      if (mods.length) this.err(line, 'CS1519', 'Niteleyiciden sonra bir üye tanımı bekleniyor.')
      return
    }
    if (TYPE_KW.has(this.tok.value)) {
      this.parseType(mods)
      return
    }
    if (this.tok.value === '~') {
      this.pos++
      const nameTok = this.tok
      this.pos++
      if (nameTok?.value !== decl.name) this.err(line, 'CS0574', `Yıkıcı metodun adı sınıf adıyla aynı olmalıdır: ~${decl.name}()`)
      if (this.peek()?.value !== '(') {
        this.err(line, 'CS1026', "Yıkıcı metot adından sonra '(' bekleniyor.")
        this.recover(true)
        return
      }
      const params = this.parseParams()
      const body = this.parseBody(line)
      decl.members.push({ kind: 'dtor', name: '~' + decl.name, modifiers: mods, access, line, isStatic, params, body })
      return
    }
    // Yapıcı metot
    if (this.tok.value === decl.name && this.tokens[this.pos + 1]?.value === '(') {
      this.pos++
      const params = this.parseParams()
      let initializer: CtorMember['initializer'] = null
      if (this.tok?.value === ':') {
        this.pos++
        const k = this.peek()?.value
        if ((k === 'base' || k === 'this') && this.tokens[this.pos + 1]?.value === '(') {
          this.pos++
          const c = matchClose(this.tokens, this.pos)
          initializer = { kind: k, args: countArgs(this.tokens, this.pos, c) }
          this.pos = c < 0 ? this.tokens.length : c + 1
        } else {
          this.err(line, 'CS1018', "Yapıcı metotta ':' işaretinden sonra base(...) veya this(...) bekleniyor.")
        }
      }
      const body = this.parseBody(line)
      decl.members.push({ kind: 'ctor', name: decl.name, modifiers: mods, access, line, isStatic, params, body, initializer })
      return
    }
    // Yanlışlıkla `void` veya bir tür yazılmadan metot: `Yaz() { }`
    if (this.tok.kind === 'ident' && this.tokens[this.pos + 1]?.value === '(') {
      this.err(line, 'CS1520', `'${this.tok.value}' metodunun dönüş türü eksik (değer döndürmüyorsa 'void' yazın). Yapıcı metot ise adı sınıf adıyla (${decl.name}) aynı olmalıdır.`)
      this.pos++
      this.parseParams()
      this.parseBody(line)
      return
    }
    const typeRef = parseTypeRef(this.tokens, this.pos)
    if (!typeRef) {
      this.err(line, 'CS1519', `Sınıf içinde beklenmeyen ifade: '${this.tok.value}'. Sınıf gövdesine yalnızca alan, özellik ve metot tanımları yazılabilir.`)
      this.recover(true)
      return
    }
    this.pos = typeRef.end
    let nameTok = this.tok
    // `Arayuz.Metot` biçiminde açık arayüz uygulaması
    if (nameTok?.kind === 'ident' && this.tokens[this.pos + 1]?.value === '.' && this.tokens[this.pos + 2]?.kind === 'ident') {
      this.pos += 2
      nameTok = this.tok
    }
    if (!nameTok || nameTok.kind !== 'ident' || NON_TYPE_KW.has(nameTok.value)) {
      const prev = this.tokens[this.pos - 1]
      if (nameTok && (nameTok.value === ';' || nameTok.value === '=')) {
        this.err(prev.line, 'CS1001', `'${typeRef.text}' türünden sonra bir ad (tanımlayıcı) bekleniyor.`)
      } else {
        this.err(prev.line, 'CS1519', `Beklenmeyen ifade: '${nameTok?.value ?? ''}'.`)
      }
      this.recover(true)
      return
    }
    this.pos++
    const name = nameTok.value
    if (this.tok?.value === '<') {
      const r = parseTypeRef(this.tokens, this.pos - 1)
      if (r) this.pos = r.end
    }
    const next = this.tok
    if (next?.value === '(') {
      if (name === decl.name) this.err(line, 'CS0542', `'${name}': üye adı, içinde bulunduğu türün adıyla aynı olamaz. Yapıcı metotların dönüş türü (void dâhil) olmaz.`)
      const params = this.parseParams()
      const body = this.parseBody(line)
      decl.members.push({ kind: 'method', name, modifiers: mods, access, line, isStatic, returnType: typeRef.text, params, body })
      return
    }
    if (next?.value === '{') {
      this.parseProperty(decl, name, typeRef.text, mods, access, line, isStatic)
      return
    }
    if (next?.value === '=>') {
      const body = this.parseBody(line)
      decl.members.push({
        kind: 'property', name, modifiers: mods, access, line, isStatic, type: typeRef.text,
        get: { modifiers: [], body }, set: null, auto: false,
      })
      return
    }
    // alan(lar)
    let curName = name
    let curLine = nameTok.line
    for (;;) {
      let init: string | null = null
      if (this.tok?.value === '=') {
        this.pos++
        const start = this.pos
        while (this.peek() && this.peek()!.value !== ';' && this.peek()!.value !== ',' && this.pos < end) {
          if (this.peek()!.value === '(' || this.peek()!.value === '[' || this.peek()!.value === '{') {
            const c = matchClose(this.tokens, this.pos)
            this.pos = c < 0 ? end : c + 1
            continue
          }
          if (this.tok.line > curLine && this.pos > start && endsExpr(this.tokens[this.pos - 1]) && startsDecl(this.tok)) break
          this.pos++
        }
        init = this.tokens.slice(start, this.pos).map((x) => x.value).join(' ')
        if (start === this.pos) this.err(curLine, 'CS1525', `'${curName}' alanına '=' işaretinden sonra bir değer atanmalı.`)
      }
      decl.members.push({ kind: 'field', name: curName, modifiers: mods, access, line: curLine, isStatic, type: typeRef.text, init })
      if (this.tok?.value === ',') {
        this.pos++
        if (this.tok?.kind === 'ident') {
          curName = this.tok.value
          curLine = this.tok.line
          this.pos++
          continue
        }
        this.err(curLine, 'CS1001', "',' işaretinden sonra bir alan adı bekleniyor.")
        this.recover(true)
        return
      }
      break
    }
    if (this.tok?.value === ';') {
      this.pos++
      return
    }
    const prev = this.tokens[this.pos - 1]
    this.err(prev.line, 'CS1002', `';' bekleniyor ('${curName}' alan tanımının sonunda).`)
    if (this.tok && this.tok.line === prev.line && this.tok.value !== '}') this.recover(true)
  }

  parseProperty(decl: TypeDecl, name: string, type: string, mods: string[], access: Access, line: number, isStatic: boolean) {
    const open = this.pos
    const close = matchClose(this.tokens, open)
    const end = close < 0 ? this.tokens.length : close
    if (close < 0) this.err(line, 'CS1513', `'${name}' özelliği kapatılmamış: '}' bekleniyor.`)
    this.pos = open + 1
    let get: Accessor | null = null
    let set: Accessor | null = null
    let auto = true
    while (this.pos < end) {
      const accMods: string[] = []
      while (this.tok && ['private', 'protected', 'internal', 'public'].includes(this.tok.value)) {
        accMods.push(this.tok.value)
        this.pos++
      }
      const k = this.tok
      if (!k) break
      if (k.value !== 'get' && k.value !== 'set' && k.value !== 'init') {
        if (decl.kind !== 'interface' && /^[A-Za-z_]/.test(k.value) && this.tokens[this.pos + 1]?.value !== '(') {
          this.err(k.line, 'CS1014', `Özellik içinde yalnızca 'get' ve 'set' erişimcileri yazılabilir ('${k.value}' beklenmiyor).`)
        } else {
          this.err(k.line, 'CS1014', `'${name}' özelliğinde 'get' veya 'set' erişimcisi bekleniyor.`)
        }
        this.pos = end
        break
      }
      this.pos++
      let body: Token[] | null = null
      if (this.tok?.value === ';') this.pos++
      else if (this.tok?.value === '{' || this.tok?.value === '=>') {
        body = this.parseBody(k.line)
        auto = false
      } else {
        this.err(k.line, 'CS1002', `'${k.value}' sözcüğünden sonra ';' veya '{' bekleniyor.`)
        while (this.pos < end && !['get', 'set', 'init'].includes(this.tok?.value ?? '')) this.pos++
      }
      const acc = { modifiers: accMods, body }
      if (k.value === 'get') {
        if (get) this.err(k.line, 'CS1007', `'${name}' özelliğinde 'get' erişimcisi iki kez tanımlanmış.`)
        get = acc
      } else {
        if (set) this.err(k.line, 'CS1007', `'${name}' özelliğinde 'set' erişimcisi iki kez tanımlanmış.`)
        set = acc
      }
    }
    if (!get && !set && close >= 0) this.err(line, 'CS0548', `'${name}': özelliğin en az bir erişimcisi (get veya set) olmalıdır.`)
    if (get && set && (get.body === null) !== (set.body === null) && decl.kind !== 'interface') {
      this.err(line, 'CS0501', `'${name}': get ve set'ten biri gövdeli diğeri gövdesiz olamaz. İkisini de { } ile yazın veya ikisini de 'get; set;' biçiminde bırakın.`)
    }
    this.pos = end + 1
    if (this.tok?.value === '=') {
      while (this.peek() && this.peek()!.value !== ';') this.pos++
      this.pos++
    }
    decl.members.push({ kind: 'property', name, modifiers: mods, access, line, isStatic, type, get, set, auto: auto && decl.kind !== 'interface' ? true : auto })
  }
}

function kindName(kind: TypeDecl['kind']): string {
  return kind === 'class' ? 'sınıfı' : kind === 'interface' ? 'arayüzü' : kind === 'struct' ? 'yapısı' : 'numaralandırması'
}

/** `(`..`)` arasındaki üst düzey argüman sayısı. */
export function countArgs(tokens: Token[], open: number, close: number): number {
  if (close < 0 || close === open + 1) return 0
  let depth = 0
  let count = 1
  for (let i = open + 1; i < close; i++) {
    const v = tokens[i].value
    if (tokens[i].kind !== 'punct') continue
    if (v === '(' || v === '[' || v === '{') depth++
    else if (v === ')' || v === ']' || v === '}') depth--
    else if (v === ',' && depth === 0) count++
  }
  return count
}

export function endsExpr(t: Token | undefined): boolean {
  if (!t) return false
  if (t.kind === 'ident') return !['else', 'do', 'try', 'finally', 'return', 'new', 'get', 'set'].includes(t.value)
  if (t.kind === 'number' || t.kind === 'string' || t.kind === 'char') return true
  return t.value === ')' || t.value === ']' || t.value === '++' || t.value === '--'
}

export function startsDecl(t: Token | undefined): boolean {
  if (!t) return false
  return t.kind === 'ident' || t.kind === 'number' || t.kind === 'string' || t.kind === 'char'
}

export function parse(source: string): Program {
  const { tokens, errors } = lex(source)
  const p = new Parser(tokens)
  for (const e of errors) p.diags.push({ line: e.line, code: e.message.slice(0, 6), message: e.message.slice(8), severity: 'error' })
  // Genel parantez dengesi
  const stack: Token[] = []
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
  for (const t of tokens) {
    if (t.kind !== 'punct') continue
    if (t.value === '(' || t.value === '[' || t.value === '{') stack.push(t)
    else if (pairs[t.value]) {
      const top = stack[stack.length - 1]
      if (top && top.value === pairs[t.value]) stack.pop()
      else if (!top) p.err(t.line, t.value === '}' ? 'CS1022' : 'CS1002', `Fazladan '${t.value}' var.`)
      else {
        p.err(t.line, t.value === ')' ? 'CS1026' : 'CS1513', `'${t.value}' beklenmiyor; satır ${top.line}'de açılan '${top.value}' önce kapatılmalı.`)
        stack.pop()
      }
    }
  }
  for (const t of stack) {
    const close = t.value === '(' ? ')' : t.value === '[' ? ']' : '}'
    p.err(t.line, close === '}' ? 'CS1513' : close === ')' ? 'CS1026' : 'CS1003', `Satır ${t.line}'de açılan '${t.value}' kapatılmamış: '${close}' bekleniyor.`)
  }
  p.parseFile()
  return { source, tokens, types: p.types, usings: p.usings, topLevel: p.topLevel, diagnostics: p.diags }
}
