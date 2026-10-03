// Görev kuralları: bir kod görevinde öğrencinin yazdığı kodun belirli bir yapıya
// (sınıf, alan, özellik, metot...) sahip olup olmadığını denetler.
import type { Token } from './lexer'
import type { Access, Member, TypeDecl } from './parser'
import type { CompileResult } from './semantic'

interface RuleBase {
  /** Öğrenciye gösterilen hedef cümlesi */
  goal: string
  /** Başarısız olduğunda gösterilecek özel ipucu (isteğe bağlı) */
  hint?: string
}

export type Rule = RuleBase &
  (
    | { t: 'class'; name: string; kind?: TypeDecl['kind']; abstract?: boolean; sealed?: boolean; static?: boolean; base?: string; implements?: string[] }
    | { t: 'field'; cls: string; name?: string; type?: string; access?: Access; static?: boolean; readonly?: boolean; const?: boolean; min?: number }
    | {
        t: 'property'; cls: string; name: string; type?: string; access?: Access; get?: boolean; set?: boolean | 'private'
        auto?: boolean; static?: boolean; abstract?: boolean; virtual?: boolean; override?: boolean; bodyHas?: string[]
      }
    | {
        t: 'method'; cls: string; name: string; returns?: string; params?: string[] | number; access?: Access; static?: boolean
        abstract?: boolean; virtual?: boolean; override?: boolean; overloads?: number; bodyHas?: string[]; noBody?: boolean
      }
    | { t: 'ctor'; cls: string; params?: string[] | number; min?: number; base?: boolean; static?: boolean; bodyHas?: string[] }
    | { t: 'dtor'; cls: string; bodyHas?: string[] }
    | { t: 'source'; has?: string[]; regex?: string; not?: boolean }
    | { t: 'new'; type: string; args?: number; min?: number }
    | { t: 'call'; member: string; args?: number; min?: number }
  )

export interface RuleResult {
  rule: Rule
  ok: boolean
  detail?: string
}

const squash = (s: string) => s.replace(/\s+/g, '')

function bodyText(src: string, tokens: Token[] | null | undefined): string {
  if (!tokens) return ''
  const real = tokens.filter((t) => t.end > 0)
  if (!real.length) return ''
  return src.slice(real[0].start, real[real.length - 1].end)
}

function memberBody(src: string, m: Member): string {
  if (m.kind === 'property') return bodyText(src, m.get?.body) + '\n' + bodyText(src, m.set?.body)
  return bodyText(src, m.body)
}

function checkBodyHas(src: string, m: Member, has: string[] | undefined): string | null {
  if (!has) return null
  const text = squash(memberBody(src, m))
  for (const h of has) if (!text.includes(squash(h))) return `'${m.name}' içinde beklenen ifade bulunamadı: ${h}`
  return null
}

function paramsMatch(actual: { type: string }[], expected: string[] | number | undefined): boolean {
  if (expected === undefined) return true
  if (typeof expected === 'number') return actual.length === expected
  return actual.length === expected.length && actual.every((p, i) => p.type === expected[i])
}

const accessTr = (a: Access) => a

export function checkRules(result: CompileResult, rules: Rule[]): RuleResult[] {
  const { program } = result
  const src = program.source
  const types = new Map(program.types.map((t) => [t.name, t]))
  const need = (name: string): TypeDecl | string => types.get(name) ?? `'${name}' adlı tür bulunamadı.`

  return rules.map((rule): RuleResult => {
    const fail = (detail: string): RuleResult => ({ rule, ok: false, detail: rule.hint ?? detail })
    const pass: RuleResult = { rule, ok: true }
    switch (rule.t) {
      case 'class': {
        const ty = types.get(rule.name)
        const kindTr = rule.kind === 'interface' ? 'arayüz' : 'sınıf'
        if (!ty) return fail(`'${rule.name}' adlı ${kindTr} tanımlanmamış.`)
        if (rule.kind && ty.kind !== rule.kind) return fail(`'${rule.name}' bir ${kindTr} olarak tanımlanmalı ('${rule.kind}').`)
        if (rule.abstract !== undefined && ty.modifiers.includes('abstract') !== rule.abstract) return fail(rule.abstract ? `'${rule.name}' soyut (abstract) olmalı.` : `'${rule.name}' soyut olmamalı.`)
        if (rule.sealed !== undefined && ty.modifiers.includes('sealed') !== rule.sealed) return fail(rule.sealed ? `'${rule.name}' mühürlü (sealed) olmalı.` : `'${rule.name}' mühürlü olmamalı.`)
        if (rule.static !== undefined && ty.modifiers.includes('static') !== rule.static) return fail(rule.static ? `'${rule.name}' statik olmalı.` : `'${rule.name}' statik olmamalı.`)
        if (rule.base && ty.bases[0] !== rule.base) return fail(`'${rule.name}', '${rule.base}' sınıfından türetilmeli: class ${rule.name} : ${rule.base}`)
        for (const i of rule.implements ?? []) if (!ty.bases.includes(i)) return fail(`'${rule.name}', '${i}' arayüzünü uygulamalı (':' işaretinden sonra yazılır).`)
        return pass
      }
      case 'field': {
        const ty = need(rule.cls)
        if (typeof ty === 'string') return fail(ty)
        const fields = ty.members.filter(
          (m) =>
            m.kind === 'field' &&
            (rule.name === undefined || m.name === rule.name) &&
            (rule.type === undefined || m.type === rule.type) &&
            (rule.access === undefined || m.access === rule.access) &&
            (rule.static === undefined || m.modifiers.includes('static') === rule.static) &&
            (rule.readonly === undefined || m.modifiers.includes('readonly') === rule.readonly) &&
            (rule.const === undefined || m.modifiers.includes('const') === rule.const),
        )
        const min = rule.min ?? 1
        if (fields.length >= min) return pass
        if (rule.name) {
          const any = ty.members.find((m) => m.name === rule.name)
          if (!any) return fail(`'${rule.cls}' sınıfında '${rule.name}' alanı yok.`)
          if (any.kind !== 'field') return fail(`'${rule.name}' bir alan (değişken) olarak tanımlanmalı.`)
          if (rule.type && any.type !== rule.type) return fail(`'${rule.name}' alanının türü '${rule.type}' olmalı (şu an '${any.type}').`)
          if (rule.access && any.access !== rule.access) return fail(`'${rule.name}' alanı ${accessTr(rule.access)} olmalı (şu an ${any.access}).`)
          if (rule.static !== undefined) return fail(rule.static ? `'${rule.name}' alanı static olmalı.` : `'${rule.name}' alanı static olmamalı.`)
          return fail(`'${rule.name}' alanı istenen biçimde değil.`)
        }
        return fail(`'${rule.cls}' sınıfında istenen özelliklerde en az ${min} alan olmalı.`)
      }
      case 'property': {
        const ty = need(rule.cls)
        if (typeof ty === 'string') return fail(ty)
        const m = ty.members.find((x) => x.name === rule.name)
        if (!m) return fail(`'${rule.cls}' içinde '${rule.name}' özelliği yok.`)
        if (m.kind !== 'property') return fail(`'${rule.name}' bir özellik (property) olmalı: get/set erişimcileri içeren { } bloğu ile yazılır.`)
        if (rule.type && m.type !== rule.type) return fail(`'${rule.name}' özelliğinin türü '${rule.type}' olmalı.`)
        if (rule.access && m.access !== rule.access) return fail(`'${rule.name}' özelliği ${rule.access} olmalı.`)
        if (rule.get !== undefined && !!m.get !== rule.get) return fail(rule.get ? `'${rule.name}' özelliğinin get erişimcisi olmalı.` : `'${rule.name}' özelliğinin get erişimcisi olmamalı.`)
        if (rule.set === 'private') {
          if (!m.set || !m.set.modifiers.includes('private')) return fail(`'${rule.name}' özelliğinin set erişimcisi private olmalı: private set;`)
        } else if (rule.set !== undefined && !!m.set !== rule.set) {
          return fail(rule.set ? `'${rule.name}' özelliğinin set erişimcisi olmalı.` : `'${rule.name}' salt okunur olmalı (set erişimcisi olmamalı).`)
        }
        if (rule.auto !== undefined && m.auto !== rule.auto) return fail(rule.auto ? `'${rule.name}' otomatik özellik olmalı: { get; set; }` : `'${rule.name}' özelliğinin get/set gövdeleri yazılmalı.`)
        if (rule.static !== undefined && m.isStatic !== rule.static) return fail(`'${rule.name}' ${rule.static ? '' : 'statik olmamalı'}${rule.static ? 'statik olmalı' : ''}.`)
        for (const k of ['abstract', 'virtual', 'override'] as const) {
          if (rule[k] !== undefined && m.modifiers.includes(k) !== rule[k]) return fail(rule[k] ? `'${rule.name}' özelliği ${k} olmalı.` : `'${rule.name}' özelliği ${k} olmamalı.`)
        }
        const b = checkBodyHas(src, m, rule.bodyHas)
        return b ? fail(b) : pass
      }
      case 'method': {
        const ty = need(rule.cls)
        if (typeof ty === 'string') return fail(ty)
        const all = ty.members.filter((x) => x.name === rule.name && x.kind === 'method')
        if (!all.length) return fail(`'${rule.cls}' içinde '${rule.name}' metodu yok.`)
        if (rule.overloads && all.length < rule.overloads) return fail(`'${rule.name}' metodunun en az ${rule.overloads} farklı sürümü (aşırı yükleme) olmalı; şu an ${all.length} tane var.`)
        const cand = all.filter((m) => m.kind === 'method' && paramsMatch(m.params, rule.params))
        if (!cand.length) {
          const want = typeof rule.params === 'number' ? `${rule.params} parametreli` : `(${(rule.params ?? []).join(', ')}) parametreli`
          return fail(`'${rule.name}' metodunun ${want} bir sürümü olmalı.`)
        }
        let last = ''
        for (const m of cand) {
          if (m.kind !== 'method') continue
          if (rule.returns && m.returnType !== rule.returns) { last = `'${rule.name}' metodunun dönüş türü '${rule.returns}' olmalı (şu an '${m.returnType}').`; continue }
          if (rule.access && m.access !== rule.access) { last = `'${rule.name}' metodu ${rule.access} olmalı (şu an ${m.access}).`; continue }
          if (rule.static !== undefined && m.modifiers.includes('static') !== rule.static) { last = rule.static ? `'${rule.name}' metodu static olmalı.` : `'${rule.name}' metodu static olmamalı.`; continue }
          let bad = ''
          for (const k of ['abstract', 'virtual', 'override'] as const) {
            if (rule[k] !== undefined && m.modifiers.includes(k) !== rule[k]) bad = rule[k] ? `'${rule.name}' metodu ${k} olmalı.` : `'${rule.name}' metodu ${k} olmamalı.`
          }
          if (bad) { last = bad; continue }
          if (rule.noBody && m.body) { last = `'${rule.name}' metodunun gövdesi olmamalı; ';' ile bitmeli.`; continue }
          const b = checkBodyHas(src, m, rule.bodyHas)
          if (b) { last = b; continue }
          return pass
        }
        return fail(last)
      }
      case 'ctor': {
        const ty = need(rule.cls)
        if (typeof ty === 'string') return fail(ty)
        const ctors = ty.members.filter((m) => m.kind === 'ctor' && (rule.static === undefined || m.isStatic === rule.static))
        if (!ctors.length) return fail(`'${rule.cls}' sınıfında ${rule.static ? 'statik ' : ''}yapıcı metot yok. Yapıcı metot, sınıfla aynı adı taşır ve dönüş türü yazılmaz: public ${rule.cls}(...) { }`)
        if (rule.min && ctors.length < rule.min) return fail(`'${rule.cls}' sınıfında en az ${rule.min} yapıcı metot olmalı (şu an ${ctors.length}).`)
        const cand = ctors.filter((m) => m.kind === 'ctor' && paramsMatch(m.params, rule.params))
        if (!cand.length) return fail(`'${rule.cls}' sınıfında ${typeof rule.params === 'number' ? rule.params : '(' + (rule.params ?? []).join(', ') + ')'} parametreli bir yapıcı metot olmalı.`)
        let last = ''
        for (const m of cand) {
          if (m.kind !== 'ctor') continue
          if (rule.base && m.initializer?.kind !== 'base') { last = `Yapıcı metot, temel sınıfın yapıcısını ': base(...)' ile çağırmalı.`; continue }
          const b = checkBodyHas(src, m, rule.bodyHas)
          if (b) { last = b; continue }
          return pass
        }
        return fail(last)
      }
      case 'dtor': {
        const ty = need(rule.cls)
        if (typeof ty === 'string') return fail(ty)
        const d = ty.members.find((m) => m.kind === 'dtor')
        if (!d) return fail(`'${rule.cls}' sınıfında yıkıcı metot yok: ~${rule.cls}() { }`)
        const b = checkBodyHas(src, d, rule.bodyHas)
        return b ? fail(b) : pass
      }
      case 'source': {
        const text = squash(src.replace(/\/\/.*$/gm, ''))
        let found = true
        for (const h of rule.has ?? []) if (!text.includes(squash(h))) found = false
        if (rule.regex && !new RegExp(rule.regex, 'm').test(src)) found = false
        if (rule.not ? found : !found) return fail(rule.goal)
        return pass
      }
      case 'new': {
        const news = result.events.filter((e) => e.event.type === 'new' && e.event.typeName === rule.type && (rule.args === undefined || e.event.args === rule.args))
        const min = rule.min ?? 1
        if (news.length >= min) return pass
        return fail(`En az ${min} adet 'new ${rule.type}(${rule.args === undefined ? '...' : rule.args === 0 ? '' : '…' + rule.args + ' değer…'})' ifadesi olmalı (şu an ${news.length}).`)
      }
      case 'call': {
        const calls = result.events.filter(
          (e) =>
            (e.event.type === 'access' || e.event.type === 'ident') &&
            (e.event.type === 'access' ? e.event.member : e.event.name) === rule.member &&
            e.event.call !== null &&
            (rule.args === undefined || e.event.call === rule.args),
        )
        const min = rule.min ?? 1
        if (calls.length >= min) return pass
        return fail(`'${rule.member}(...)' metodu ${min > 1 ? `en az ${min} kez ` : ''}çağrılmalı${rule.args !== undefined ? ` (${rule.args} değer ile)` : ''}.`)
      }
    }
  })
}
