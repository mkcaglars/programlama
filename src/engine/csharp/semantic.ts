// Anlamsal denetimler: kalıtım, arayüz uygulama, erişim belirleyiciler, static,
// yapıcı metotlar ve basit tür uyumsuzlukları. Derleyici hata kodlarına benzer
// Türkçe mesajlar üretir.
import { analyzeBody, type BodyEvent } from './body'
import type { Token } from './lexer'
import { parse, type Diagnostic, type Member, type MethodMember, type Program, type TypeDecl } from './parser'

export interface CompileResult {
  program: Program
  diagnostics: Diagnostic[]
  /** Gövdelerde toplanan olaylar (kural denetimleri için) */
  events: { owner: string | null; member: string | null; event: BodyEvent }[]
  ok: boolean
}

const OBJECT_VIRTUALS = ['ToString', 'Equals', 'GetHashCode']

const BCL: Record<string, string[]> = {
  Console: ['WriteLine', 'Write', 'ReadLine', 'ReadKey', 'Read', 'Clear', 'Beep', 'ForegroundColor', 'BackgroundColor', 'ResetColor', 'Title'],
  Convert: ['ToInt32', 'ToInt16', 'ToInt64', 'ToDouble', 'ToDecimal', 'ToSingle', 'ToString', 'ToBoolean', 'ToChar', 'ToByte', 'ToDateTime'],
  Math: ['Abs', 'Pow', 'Sqrt', 'Round', 'Floor', 'Ceiling', 'Max', 'Min', 'PI', 'E', 'Sin', 'Cos', 'Tan', 'Log', 'Log10', 'Truncate', 'Sign', 'Exp'],
}

const NUMERIC = ['int', 'long', 'short', 'byte', 'double', 'float', 'decimal', 'uint', 'ulong', 'sbyte', 'ushort']
const INTEGRAL = ['int', 'long', 'short', 'byte', 'uint', 'ulong', 'sbyte', 'ushort']

function sig(m: { params: { type: string }[] }): string {
  return m.params.map((p) => p.type).join(',')
}

function describeMember(m: Member, owner: string): string {
  if (m.kind === 'method') return `${owner}.${m.name}(${sig(m).replace(/,/g, ', ')})`
  return `${owner}.${m.name}`
}

export function compile(source: string): CompileResult {
  const program = parse(source)
  const diags: Diagnostic[] = [...program.diagnostics]
  const events: CompileResult['events'] = []
  const err = (line: number, code: string, message: string) => diags.push({ line, code, message, severity: 'error' })
  const warn = (line: number, code: string, message: string) => diags.push({ line, code, message, severity: 'warning' })

  // Yalnızca sözdizimi hataları (CS1xxx) anlamsal denetimleri durdurur
  const syntaxErrors = diags.some((d) => d.severity === 'error' && /^CS1/.test(d.code))
  const types = new Map<string, TypeDecl>()
  for (const ty of program.types) {
    if (types.has(ty.name)) err(ty.line, 'CS0101', `'${ty.name}' adında bir tür zaten tanımlanmış.`)
    else types.set(ty.name, ty)
  }

  const baseClassOf = (ty: TypeDecl): TypeDecl | 'external' | null => {
    if (ty.kind !== 'class' || ty.bases.length === 0) return null
    const first = ty.bases[0]
    const known = types.get(first)
    if (known) return known.kind === 'class' ? known : null
    // Tanınmayan ve 'I' ile başlamayan ad: dış bir temel sınıf (ör. Form)
    return /^I[A-ZÇĞİÖŞÜ]/.test(first) ? null : 'external'
  }

  /** Sınıf ve atalarını sırayla döndürür; dış bir ata varsa `external=true`. */
  const chain = (ty: TypeDecl): { list: TypeDecl[]; external: boolean } => {
    const list: TypeDecl[] = []
    let cur: TypeDecl | 'external' | null = ty
    const seen = new Set<string>()
    while (cur && cur !== 'external') {
      if (seen.has(cur.name)) break
      seen.add(cur.name)
      list.push(cur)
      cur = baseClassOf(cur)
    }
    return { list, external: cur === 'external' }
  }

  const interfacesOf = (ty: TypeDecl): TypeDecl[] => {
    const out: TypeDecl[] = []
    const visit = (names: string[]) => {
      for (const n of names) {
        const it = types.get(n)
        if (it && it.kind === 'interface' && !out.includes(it)) {
          out.push(it)
          visit(it.bases)
        }
      }
    }
    for (const c of chain(ty).list) visit(c.bases)
    return out
  }

  const isDerivedFrom = (ty: TypeDecl | null, ancestor: TypeDecl): boolean => !!ty && chain(ty).list.includes(ancestor)

  const findMembers = (ty: TypeDecl, name: string): { member: Member; owner: TypeDecl }[] => {
    const out: { member: Member; owner: TypeDecl }[] = []
    const c = chain(ty)
    const lists = ty.kind === 'interface' ? [ty, ...interfacesOf(ty)] : c.list
    for (const t of lists) for (const m of t.members) if (m.name === name && m.kind !== 'ctor' && m.kind !== 'dtor') out.push({ member: m, owner: t })
    return out
  }

  const hasExternalBase = (ty: TypeDecl) => chain(ty).external

  if (!syntaxErrors) {
    // ---- Tür düzeyi denetimler ----
    for (const ty of types.values()) {
      if (ty.kind === 'interface') {
        for (const m of ty.members) {
          if (m.kind === 'field') err(m.line, 'CS0525', `Arayüzler alan (değişken) içeremez: '${m.name}'. Arayüzde yalnızca metot ve özellik imzaları bulunur.`)
          if (m.kind === 'ctor') err(m.line, 'CS0526', 'Arayüzler yapıcı metot içeremez.')
          if (m.kind === 'method' && m.body && !m.modifiers.includes('static')) {
            warn(m.line, 'NTP001', `'${ty.name}.${m.name}' arayüz metodunun gövdesi olmamalı; arayüzde yalnızca imza yazılır: ${m.returnType} ${m.name}(...);`)
          }
        }
        for (const b of ty.bases) {
          const bt = types.get(b)
          if (bt && bt.kind !== 'interface') err(ty.line, 'CS0527', `'${ty.name}' arayüzü bir sınıftan ('${b}') türetilemez; yalnızca başka arayüzlerden türetilebilir.`)
        }
        continue
      }
      if (ty.kind !== 'class' && ty.kind !== 'struct') continue

      // temel sınıf listesi
      ty.bases.forEach((b, i) => {
        const bt = types.get(b)
        if (!bt || bt.kind !== 'class') return
        if (ty.kind === 'struct') err(ty.line, 'CS0527', `'${ty.name}' yapısı (struct) bir sınıftan türetilemez.`)
        else if (i > 0) {
          if (types.get(ty.bases[0])?.kind === 'class') err(ty.line, 'CS1721', `'${ty.name}' birden fazla temel sınıfa (${ty.bases[0]}, ${b}) sahip olamaz. C# sınıflarda çoklu kalıtımı desteklemez; bunun için arayüzleri kullanın.`)
          else err(ty.line, 'CS1722', `Temel sınıf '${b}', temel tür listesinde ilk sırada yazılmalıdır (önce sınıf, sonra arayüzler).`)
        }
        if (bt.modifiers.includes('sealed')) err(ty.line, 'CS0509', `'${ty.name}', mühürlü (sealed) '${b}' sınıfından türetilemez.`)
        if (bt.modifiers.includes('static')) err(ty.line, 'CS0709', `'${ty.name}', statik '${b}' sınıfından türetilemez.`)
      })
      const c = chain(ty)
      if (baseClassOf(c.list[c.list.length - 1]) && !c.external) {
        err(ty.line, 'CS0146', `'${ty.name}' için döngüsel kalıtım var: bir sınıf kendi alt sınıfından türetilemez.`)
        continue
      }

      const isAbstract = ty.modifiers.includes('abstract')
      const isStaticClass = ty.modifiers.includes('static')
      if (isAbstract && ty.modifiers.includes('sealed')) err(ty.line, 'CS0418', `'${ty.name}': soyut (abstract) bir sınıf aynı zamanda mühürlü (sealed) olamaz.`)

      // üye çakışmaları
      const seen = new Map<string, Member>()
      let dtorCount = 0
      for (const m of ty.members) {
        if (m.kind === 'dtor') {
          dtorCount++
          if (dtorCount > 1) err(m.line, 'CS0111', `'${ty.name}' sınıfında yalnızca bir yıkıcı metot olabilir (yıkıcılar aşırı yüklenemez).`)
          if (m.params.length) err(m.line, 'CS1026', 'Yıkıcı metot parametre alamaz.')
          if (m.modifiers.length) err(m.line, 'CS0106', `Yıkıcı metotta erişim belirleyici veya niteleyici kullanılamaz ('${m.modifiers.join(' ')}').`)
          if (ty.kind === 'struct') err(m.line, 'CS0575', 'Yapılar (struct) yıkıcı metot içeremez.')
          continue
        }
        if (isStaticClass && !m.isStatic && m.kind !== 'ctor') err(m.line, 'CS0708', `'${m.name}': statik sınıfta örnek (instance) üye tanımlanamaz; üyeyi 'static' yapın.`)
        const key = m.kind === 'method' || m.kind === 'ctor' ? `${m.kind === 'ctor' ? '.ctor' + (m.isStatic ? 's' : '') : m.name}(${sig(m)})` : m.name
        const plainKey = m.kind === 'ctor' ? null : m.name
        if (seen.has(key)) {
          if (m.kind === 'method' || m.kind === 'ctor') err(m.line, 'CS0111', `'${ty.name}' sınıfı, aynı parametre türlerine sahip '${m.name}' adlı bir üyeyi zaten tanımlıyor. Aşırı yükleme için parametre sayısı veya türleri farklı olmalıdır (dönüş türünün farklı olması yetmez).`)
          else err(m.line, 'CS0102', `'${ty.name}' türü '${m.name}' için zaten bir tanım içeriyor.`)
        } else if (plainKey && m.kind !== 'method') {
          const clash = ty.members.find((o) => o !== m && o.name === m.name && o.kind !== 'ctor' && ty.members.indexOf(o) < ty.members.indexOf(m))
          if (clash) err(m.line, 'CS0102', `'${ty.name}' türü '${m.name}' için zaten bir tanım içeriyor (alan ve özellik adları farklı olmalı; ör. 'kanalNo' alanı ve 'KanalNo' özelliği).`)
        } else if (m.kind === 'method') {
          const clash = ty.members.find((o) => o.name === m.name && o.kind !== 'method' && o.kind !== 'ctor')
          if (clash) err(m.line, 'CS0102', `'${ty.name}' türü '${m.name}' için zaten bir tanım içeriyor.`)
        }
        seen.set(key, m)

        if (m.kind === 'ctor' && m.isStatic) {
          if (m.params.length) err(m.line, 'CS0132', `'${ty.name}': statik yapıcı metot parametre alamaz.`)
          if (m.modifiers.some((x) => ['public', 'private', 'protected', 'internal'].includes(x))) err(m.line, 'CS0515', 'Statik yapıcı metotta erişim belirleyici (public, private...) kullanılamaz.')
        }
        if (m.kind === 'method' || m.kind === 'property') {
          const abs = m.modifiers.includes('abstract')
          if (abs && !isAbstract) err(m.line, 'CS0513', `'${ty.name}.${m.name}' soyut (abstract) olarak tanımlanmış ama '${ty.name}' sınıfı soyut değil. Sınıfı da 'abstract' yapın.`)
          if (abs && m.kind === 'method' && m.body) err(m.line, 'CS0500', `'${ty.name}.${m.name}()' soyut olduğu için gövde içeremez; '{ }' yerine ';' ile bitirin.`)
          if (abs && m.access === 'private') err(m.line, 'CS0621', `'${m.name}': soyut veya sanal üyeler private olamaz.`)
          if (m.modifiers.includes('virtual') && m.access === 'private') err(m.line, 'CS0621', `'${m.name}': sanal (virtual) üyeler private olamaz.`)
          if (abs && m.modifiers.includes('virtual')) err(m.line, 'CS0503', `'${m.name}': soyut üye aynı zamanda virtual olarak işaretlenemez (abstract zaten geçersiz kılınabilir).`)
          if (m.kind === 'method' && !m.body && !abs && !m.modifiers.includes('extern') && !m.modifiers.includes('partial')) {
            err(m.line, 'CS0501', `'${ty.name}.${m.name}()' bir gövde bildirmeli; soyut değilse '{ }' ile gövdesini yazın.`)
          }
        }
      }

      const baseRaw = baseClassOf(ty)
      const base = baseRaw === 'external' ? null : baseRaw

      // override / gizleme
      for (const m of ty.members) {
        if (m.kind !== 'method' && m.kind !== 'property') continue
        const isOverride = m.modifiers.includes('override')
        const inBase = base ? findMembers(base, m.name).filter((x) => x.member.kind === m.kind && (m.kind !== 'method' || sig(x.member as MethodMember) === sig(m))) : []
        if (isOverride) {
          if (!base) {
            if (!hasExternalBase(ty) && !OBJECT_VIRTUALS.includes(m.name)) err(m.line, 'CS0115', `'${ty.name}.${m.name}': geçersiz kılınacak (override) uygun bir üye bulunamadı. Sınıf bir temel sınıftan türetilmemiş.`)
            continue
          }
          if (inBase.length === 0) {
            if (!hasExternalBase(ty) && !OBJECT_VIRTUALS.includes(m.name)) err(m.line, 'CS0115', `'${ty.name}.${m.name}': temel sınıfta geçersiz kılınacak (override) uygun bir '${m.name}' üyesi bulunamadı.`)
            continue
          }
          const target = inBase[0]
          const mods = target.member.modifiers
          if (!mods.includes('virtual') && !mods.includes('abstract') && !mods.includes('override')) {
            err(m.line, 'CS0506', `'${ty.name}.${m.name}': devralınan '${describeMember(target.member, target.owner.name)}' geçersiz kılınamaz çünkü virtual, abstract veya override olarak işaretlenmemiş.`)
          } else if (mods.includes('sealed')) {
            err(m.line, 'CS0239', `'${ty.name}.${m.name}': devralınan üye mühürlü (sealed) olduğu için geçersiz kılınamaz.`)
          } else if (target.member.access !== m.access) {
            err(m.line, 'CS0507', `'${ty.name}.${m.name}': geçersiz kılarken erişim belirleyici değiştirilemez ('${target.member.access}' olmalı).`)
          }
        } else if (inBase.length && !m.modifiers.includes('new')) {
          const tm = inBase[0].member.modifiers
          if (tm.includes('abstract')) {
            // CS0534 aşağıda raporlanır
          } else if (tm.includes('virtual') || tm.includes('override')) {
            warn(m.line, 'CS0114', `'${ty.name}.${m.name}', devralınan '${inBase[0].owner.name}.${m.name}' üyesini gizliyor. Geçersiz kılmak için 'override' anahtar sözcüğünü ekleyin.`)
          } else {
            warn(m.line, 'CS0108', `'${ty.name}.${m.name}', devralınan '${inBase[0].owner.name}.${m.name}' üyesini gizliyor. Bilerek yapıyorsanız 'new' anahtar sözcüğünü kullanın.`)
          }
        }
      }

      // soyut üyeleri uygulama
      if (!isAbstract && ty.kind === 'class') {
        const list = c.list
        for (let i = list.length - 1; i >= 1; i--) {
          for (const am of list[i].members) {
            if (!am.modifiers.includes('abstract')) continue
            const implemented = list.slice(0, i).some((d) => d.members.some((x) => x.name === am.name && x.kind === am.kind && x.modifiers.includes('override')))
            if (!implemented) err(ty.line, 'CS0534', `'${ty.name}', devralınan soyut '${describeMember(am, list[i].name)}' üyesini uygulamıyor. Alt sınıfta 'public override ...' ile yazmalısınız.`)
          }
        }
      }

      // arayüz uygulama
      if (ty.kind === 'class' || ty.kind === 'struct') {
        for (const it of interfacesOf(ty)) {
          for (const im of it.members) {
            if (im.kind !== 'method' && im.kind !== 'property') continue
            if (im.kind === 'method' && im.body) continue
            const impl = c.list.flatMap((x) => x.members).find((x) => x.name === im.name && x.kind === im.kind && (im.kind !== 'method' || (x as MethodMember).params.length === im.params.length))
            const desc = im.kind === 'method' ? `${it.name}.${im.name}(${sig(im).replace(/,/g, ', ')})` : `${it.name}.${im.name}`
            if (!impl) {
              err(ty.line, 'CS0535', `'${ty.name}', '${desc}' arayüz üyesini uygulamıyor. Arayüzdeki tüm üyeler sınıfta yazılmalıdır.`)
            } else if (impl.access !== 'public') {
              err(impl.line, 'CS0737', `'${ty.name}', '${desc}' arayüz üyesini uyguluyor ancak '${impl.name}' public değil. Arayüz üyeleri public olarak uygulanmalıdır.`)
            } else if (im.kind === 'method' && impl.kind === 'method' && im.returnType !== impl.returnType) {
              err(impl.line, 'CS0738', `'${ty.name}.${impl.name}' dönüş türü arayüzdeki '${im.returnType}' ile aynı olmalıdır.`)
            }
          }
        }
      }

      // yapıcı zinciri
      if (base) {
        const baseCtors = base.members.filter((m) => m.kind === 'ctor' && !m.isStatic)
        const ctors = ty.members.filter((m) => m.kind === 'ctor' && !m.isStatic)
        const accepts = (n: number) => baseCtors.length === 0 ? n === 0 : baseCtors.some((bc) => bc.kind === 'ctor' && n <= bc.params.length && n >= bc.params.filter((p) => !p.hasDefault).length)
        const needArgs = !accepts(0)
        if (ctors.length === 0 && needArgs) {
          err(ty.line, 'CS7036', `'${base.name}' sınıfının parametresiz yapıcı metodu yok. '${ty.name}' sınıfında bir yapıcı yazıp ': base(...)' ile gerekli değerleri gönderin.`)
        }
        for (const ct of ctors) {
          if (ct.kind !== 'ctor') continue
          if (ct.initializer?.kind === 'base') {
            if (!accepts(ct.initializer.args)) err(ct.line, 'CS1729', `'${base.name}' sınıfı ${ct.initializer.args} bağımsız değişken alan bir yapıcı metot içermiyor.`)
          } else if (!ct.initializer && needArgs) {
            err(ct.line, 'CS7036', `'${base.name}' sınıfının parametresiz yapıcısı yok; '${ty.name}' yapıcısında ': base(...)' çağrısı yapılmalı.`)
          }
        }
      } else {
        for (const ct of ty.members) {
          if (ct.kind === 'ctor' && ct.initializer?.kind === 'base' && ct.initializer.args > 0 && !hasExternalBase(ty)) {
            err(ct.line, 'CS1729', `'${ty.name}' bir temel sınıftan türetilmediği için base(...) ile değer gönderilemez.`)
          }
        }
      }
    }
  }

  // ---- Gövde analizleri ----
  type Ctx = { owner: TypeDecl | null; member: Member | null; isStatic: boolean; inCtor: boolean }
  const bodies: { tokens: Token[]; ctx: Ctx; params: Map<string, string> }[] = []
  for (const ty of program.types) {
    for (const m of ty.members) {
      const params = new Map<string, string>()
      if ('params' in m) for (const p of m.params) params.set(p.name, p.type)
      const ctx: Ctx = { owner: ty, member: m, isStatic: m.isStatic, inCtor: m.kind === 'ctor' }
      if ((m.kind === 'method' || m.kind === 'ctor' || m.kind === 'dtor') && m.body) bodies.push({ tokens: m.body, ctx, params })
      if (m.kind === 'property') {
        if (m.get?.body) bodies.push({ tokens: m.get.body, ctx, params })
        if (m.set?.body) {
          const sp = new Map(params)
          sp.set('value', m.type)
          bodies.push({ tokens: m.set.body, ctx, params: sp })
        }
      }
    }
  }
  if (program.topLevel.length) bodies.push({ tokens: program.topLevel, ctx: { owner: null, member: null, isStatic: true, inCtor: false }, params: new Map() })

  for (const b of bodies) {
    const r = analyzeBody(b.tokens, b.params)
    diags.push(...r.diagnostics)
    for (const e of r.events) events.push({ owner: b.ctx.owner?.name ?? null, member: b.ctx.member?.name ?? null, event: e })
    if (syntaxErrors || r.diagnostics.some((d) => d.severity === 'error' && /^CS1/.test(d.code))) continue
    checkBody(b.ctx, r.events, r.locals)
  }

  // alan ilk değerleri için tür denetimi
  if (!syntaxErrors) {
    for (const ty of program.types) {
      for (const m of ty.members) {
        if (m.kind === 'field' && m.init) checkLiteralAssign(m.type, m.init.split(' '), m.line, m.name)
      }
    }
  }

  function memberTypeOf(owner: TypeDecl | null, name: string): string | undefined {
    if (!owner) return undefined
    const found = findMembers(owner, name)[0]?.member
    if (!found) return undefined
    if (found.kind === 'field' || found.kind === 'property') return found.type
    return undefined
  }

  function checkLiteralAssign(declType: string, init: string[], line: number, name: string) {
    if (init.length === 0) return
    let toks = init
    if (toks[0] === '-' && toks.length === 2) toks = [toks[1]]
    const raw = toks.join(' ')
    let srcType: string | null = null
    if (toks.length === 1) {
      const v = toks[0]
      if (v.startsWith('"') || v.startsWith('@"') || v.startsWith('$"')) srcType = 'string'
      else if (v.startsWith("'")) srcType = 'char'
      else if (v === 'true' || v === 'false') srcType = 'bool'
      else if (/^[0-9]/.test(v)) {
        if (/[fF]$/.test(v)) srcType = 'float'
        else if (/[mM]$/.test(v)) srcType = 'decimal'
        else if (/[.eE]/.test(v) || /[dD]$/.test(v)) srcType = 'double'
        else srcType = 'int'
      }
    } else if (/^[A-Za-z_]\w*\s\.\sText$/.test(raw) || raw === 'Console . ReadLine ( )') {
      srcType = 'string'
    }
    if (!srcType) return
    const t = declType
    const bad = (from: string, extra = '') => err(line, 'CS0029', `'${from}' türü örtük olarak '${t}' türüne dönüştürülemez ('${name}').${extra}`)
    if (t === 'string') {
      if (srcType !== 'string') bad(srcType, srcType === 'char' ? ' Metinler çift tırnak ("...") içinde yazılır.' : ' Sayıyı metne çevirmek için .ToString() kullanın.')
    } else if (t === 'char') {
      if (srcType === 'string') bad('string', " char türüne tek tırnak içinde tek bir karakter atanır: 'A'")
      else if (srcType !== 'char') bad(srcType)
    } else if (t === 'bool') {
      if (srcType !== 'bool') bad(srcType, ' bool türü yalnızca true veya false değerini alır.')
    } else if (NUMERIC.includes(t)) {
      if (srcType === 'string') bad('string', ' Metni sayıya çevirmek için Convert.ToInt32(...) / Convert.ToDouble(...) kullanın.')
      else if (srcType === 'bool') bad('bool')
      else if (INTEGRAL.includes(t) && (srcType === 'double' || srcType === 'float' || srcType === 'decimal')) {
        err(line, 'CS0266', `'${srcType}' türü örtük olarak '${t}' türüne dönüştürülemez. Ondalıklı sayılar tam sayı türünde saklanamaz; açık dönüştürme gerekir.`)
      } else if (t === 'float' && srcType === 'double') {
        err(line, 'CS0664', "double türündeki sabit değer örtük olarak float türüne dönüştürülemez; sayının sonuna 'F' ekleyin (ör. 3.5F).")
      } else if (t === 'decimal' && (srcType === 'double' || srcType === 'float')) {
        err(line, 'CS0664', "double türündeki sabit değer örtük olarak decimal türüne dönüştürülemez; sayının sonuna 'M' ekleyin (ör. 3.5M).")
      }
    }
  }

  function checkBody(ctx: Ctx, evs: BodyEvent[], locals: Map<string, string>) {
    const owner = ctx.owner
    const resolveVarType = (name: string): string | undefined => locals.get(name) ?? memberTypeOf(owner, name)
    const canAccess = (m: Member, declaring: TypeDecl): boolean => {
      if (m.access === 'public' || m.access === 'internal') return true
      if (m.access === 'private') return owner === declaring
      return isDerivedFrom(owner, declaring)
    }
    const accessMsg = (m: Member, declaring: TypeDecl) =>
      `'${declaring.name}.${m.name}' ${m.access === 'private' ? 'private' : 'protected'} olduğu için bu bölümden erişilemez (koruma düzeyi). ${m.access === 'private' ? 'Sınıf dışından erişim için public bir özellik veya metot kullanın.' : 'protected üyelere yalnızca sınıfın kendisi ve alt sınıfları erişebilir.'}`

    const checkMemberUse = (ty: TypeDecl, memberName: string, e: Extract<BodyEvent, { type: 'access' }>, viaType: boolean, viaBase: boolean) => {
      const found = findMembers(ty, memberName)
      if (found.length === 0) {
        if (hasExternalBase(ty)) return
        if (viaType && ty.kind === 'enum') return
        if (OBJECT_VIRTUALS.includes(memberName) || memberName === 'GetType') return
        err(e.line, viaType ? 'CS0117' : 'CS1061', `'${ty.name}' türü '${memberName}' adında bir üye içermiyor. (Büyük/küçük harf ve yazımı kontrol edin.)`)
        return
      }
      const { member: m, owner: declaring } = found[0]
      if (!canAccess(m, declaring)) {
        err(e.line, 'CS0122', accessMsg(m, declaring))
        return
      }
      if (viaType && !m.isStatic) {
        err(e.line, 'CS0120', `'${declaring.name}.${m.name}' statik değil; ona erişmek için önce bir nesne oluşturmalısınız (new ${declaring.name}(...)).`)
        return
      }
      if (!viaType && !viaBase && m.isStatic && m.kind !== 'ctor') {
        err(e.line, 'CS0176', `'${declaring.name}.${m.name}' statik bir üyedir; nesne üzerinden değil sınıf adıyla erişilir: ${declaring.name}.${m.name}`)
        return
      }
      if (e.call !== null) {
        const methods = found.filter((f) => f.member.kind === 'method').map((f) => f.member as MethodMember)
        if (methods.length === 0) {
          err(e.line, 'CS1955', `'${declaring.name}.${m.name}' bir metot değil, parantez () ile çağrılamaz.`)
          return
        }
        const ok = methods.some((mm) => e.call! <= mm.params.length && e.call! >= mm.params.filter((p) => !p.hasDefault).length)
        if (!ok) err(e.line, 'CS1501', `'${m.name}' metodunun ${e.call} bağımsız değişken (parametre) alan bir aşırı yüklemesi yok. Mevcut: ${methods.map((mm) => `${m.name}(${mm.params.map((p) => p.type + ' ' + p.name).join(', ')})`).join(' / ')}`)
        return
      }
      if (e.assign) {
        if (m.kind === 'method') err(e.line, 'CS1656', `'${m.name}' bir metot olduğu için değer atanamaz.`)
        else if (m.kind === 'property') {
          if (!m.set) {
            if (!(ctx.inCtor && owner === declaring && m.auto)) err(e.line, 'CS0200', `'${declaring.name}.${m.name}' özelliği salt okunurdur (set erişimcisi yok); değer atanamaz.`)
          } else if (m.set.modifiers.includes('private') && owner !== declaring) {
            err(e.line, 'CS0272', `'${declaring.name}.${m.name}' özelliğinin set erişimcisi private olduğu için sınıf dışından değer atanamaz.`)
          }
        } else if (m.kind === 'field') {
          if (m.modifiers.includes('const')) err(e.line, 'CS0131', `'${m.name}' bir sabittir (const); değeri değiştirilemez.`)
          else if (m.modifiers.includes('readonly') && !(ctx.inCtor && owner === declaring)) err(e.line, 'CS0191', `'${m.name}' salt okunur (readonly) bir alandır; yalnızca tanımlanırken veya yapıcı metotta değer atanabilir.`)
        }
      }
    }

    for (const e of evs) {
      if (e.type === 'decl') {
        checkLiteralAssign(e.declType, e.init.map((x) => x.value), e.line, e.name)
        continue
      }
      if (e.type === 'assignLiteral') {
        const vt = resolveVarType(e.name)
        if (vt) checkLiteralAssign(vt, e.init.map((x) => x.value), e.line, e.name)
        continue
      }
      if (e.type === 'new') {
        if (e.isArray) continue
        const ty = types.get(e.typeName)
        if (!ty) continue
        if (ty.kind === 'interface') {
          err(e.line, 'CS0144', `'${ty.name}' bir arayüzdür; arayüzlerden nesne (örnek) oluşturulamaz.`)
          continue
        }
        if (ty.modifiers.includes('abstract')) {
          err(e.line, 'CS0144', `'${ty.name}' soyut (abstract) bir sınıftır; soyut sınıflardan nesne oluşturulamaz. Bunun yerine bu sınıftan türetilmiş bir alt sınıf kullanın.`)
          continue
        }
        if (ty.modifiers.includes('static')) {
          err(e.line, 'CS0712', `'${ty.name}' statik bir sınıftır; statik sınıflardan nesne oluşturulamaz.`)
          continue
        }
        const ctors = ty.members.filter((m) => m.kind === 'ctor' && !m.isStatic)
        if (ctors.length === 0) {
          if (e.args > 0) err(e.line, 'CS1729', `'${ty.name}' sınıfı ${e.args} bağımsız değişken alan bir yapıcı metot içermiyor (sınıfta yalnızca parametresiz varsayılan yapıcı var).`)
        } else {
          const matching = ctors.filter((c) => c.kind === 'ctor' && e.args <= c.params.length && e.args >= c.params.filter((p) => !p.hasDefault).length)
          if (matching.length === 0) err(e.line, 'CS1729', `'${ty.name}' sınıfı ${e.args} bağımsız değişken alan bir yapıcı metot içermiyor.`)
          else if (matching.every((c) => !canAccess(c, ty))) err(e.line, 'CS0122', `'${ty.name}' yapıcı metodu ${matching[0].access} olduğu için sınıf dışından nesne oluşturulamaz.`)
        }
        for (const n of e.initNames) {
          const f = findMembers(ty, n)[0]
          if (!f) err(e.line, 'CS0117', `'${ty.name}' türü '${n}' adında bir üye içermiyor.`)
          else if (!canAccess(f.member, f.owner)) err(e.line, 'CS0122', accessMsg(f.member, f.owner))
          else if (f.member.kind === 'property' && !f.member.set) err(e.line, 'CS0200', `'${ty.name}.${n}' salt okunurdur; nesne başlatıcıda değer atanamaz.`)
        }
        continue
      }
      if (e.type === 'access') {
        if (e.target.kind === 'this') {
          if (ctx.isStatic) {
            err(e.line, 'CS0026', "'this' anahtar sözcüğü statik bir metotta veya statik bağlamda kullanılamaz.")
            continue
          }
          if (owner) checkMemberUse(owner, e.member, e, false, true)
          continue
        }
        if (e.target.kind === 'base') {
          if (!owner) continue
          const b = baseClassOf(owner)
          if (b && b !== 'external') checkMemberUse(b, e.member, e, false, true)
          continue
        }
        const name = e.target.name
        const vt = resolveVarType(name)
        if (vt) {
          const ty = types.get(vt.replace(/\?$/, ''))
          if (ty) checkMemberUse(ty, e.member, e, false, false)
          continue
        }
        if (owner && findMembers(owner, name).length) continue
        const ty = types.get(name)
        if (ty) {
          checkMemberUse(ty, e.member, e, true, false)
          continue
        }
        const bcl = BCL[name]
        if (bcl) {
          if (!bcl.includes(e.member)) {
            const close = bcl.find((x) => x.toLowerCase() === e.member.toLowerCase())
            err(e.line, 'CS0117', `'${name}' içinde '${e.member}' adında bir tanım yok.${close ? ` Bunu mu demek istediniz: ${name}.${close}? (C# büyük/küçük harfe duyarlıdır.)` : ''}`)
          }
          continue
        }
        const bclName = Object.keys(BCL).find((k) => k.toLowerCase() === name.toLowerCase())
        if (bclName && !locals.has(name)) {
          err(e.line, 'CS0103', `'${name}' adı geçerli bağlamda yok. Bunu mu demek istediniz: '${bclName}'? (C# büyük/küçük harfe duyarlıdır.)`)
          continue
        }
        if (/^messagebox$/i.test(name) && name !== 'MessageBox') err(e.line, 'CS0103', `'${name}' adı geçerli bağlamda yok. Doğrusu: 'MessageBox'.`)
        continue
      }
      if (e.type === 'ident') {
        if (!owner || locals.has(e.name)) continue
        const found = findMembers(owner, e.name)
        if (found.length) {
          const m = found[0].member
          if (ctx.isStatic && !m.isStatic) {
            err(e.line, 'CS0120', `'${owner.name}.${e.name}' statik değil; statik bir metodun içinden örnek (instance) üyelere doğrudan erişilemez.`)
            continue
          }
          if (found[0].owner !== owner && m.access === 'private') {
            err(e.line, 'CS0122', accessMsg(m, found[0].owner))
            continue
          }
          if (e.call !== null) {
            const methods = found.filter((f) => f.member.kind === 'method').map((f) => f.member as MethodMember)
            if (methods.length && !methods.some((mm) => e.call! <= mm.params.length && e.call! >= mm.params.filter((p) => !p.hasDefault).length)) {
              err(e.line, 'CS1501', `'${e.name}' metodunun ${e.call} bağımsız değişken alan bir aşırı yüklemesi yok.`)
            }
          } else if (e.assign && m.kind === 'property' && !m.set && !(ctx.inCtor && m.auto)) {
            err(e.line, 'CS0200', `'${owner.name}.${e.name}' özelliği salt okunurdur (set erişimcisi yok); değer atanamaz.`)
          }
          continue
        }
        if (e.call !== null && !hasExternalBase(owner) && !types.has(e.name) && !['nameof', 'typeof', 'base', 'this', 'sizeof', 'default'].includes(e.name)) {
          err(e.line, 'CS0103', `'${e.name}' adı geçerli bağlamda yok. Böyle bir metot tanımlanmamış.`)
        }
      }
    }
  }

  // tekrarları ayıkla, satıra göre sırala
  const uniq = new Map<string, Diagnostic>()
  for (const d of diags) {
    const k = `${d.line}|${d.code}`
    if (!uniq.has(k)) uniq.set(k, d)
  }
  const diagnostics = [...uniq.values()].sort((a, b) => a.line - b.line || (a.severity === 'error' ? -1 : 1))
  return { program, diagnostics, events, ok: !diagnostics.some((d) => d.severity === 'error') }
}
