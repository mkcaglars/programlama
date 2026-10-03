import type { Member, TypeDecl } from '../engine/csharp/parser'

const sign = (m: Member) => (m.access === 'public' ? '+' : m.access === 'private' ? '−' : m.access === 'protected' ? '#' : '~')

function memberText(m: Member): string {
  switch (m.kind) {
    case 'field':
      return `${m.name} : ${m.type}`
    case 'property':
      return `${m.name} : ${m.type} {${[m.get ? 'get' : '', m.set ? (m.set.modifiers.includes('private') ? 'private set' : 'set') : ''].filter(Boolean).join('; ')}}`
    case 'method':
      return `${m.name}(${m.params.map((p) => `${p.name}: ${p.type}`).join(', ')}) : ${m.returnType}`
    case 'ctor':
      return `«yapıcı» ${m.name}(${m.params.map((p) => `${p.name}: ${p.type}`).join(', ')})`
    case 'dtor':
      return `«yıkıcı» ${m.name}()`
  }
}

/** Ayrıştırılmış sınıfları basit UML kutuları olarak gösterir. */
export function UmlView({ types }: { types: TypeDecl[] }) {
  const shown = types.filter((t) => t.kind !== 'enum' && !(t.name === 'Program' && t.members.every((m) => m.isStatic)))
  if (!shown.length) return <p className="muted">Henüz bir sınıf tanımlanmadı. Kod yazdıkça sınıf diyagramın burada belirecek.</p>
  return (
    <div className="uml">
      {shown.map((t) => {
        const abstract = t.modifiers.includes('abstract')
        const data = t.members.filter((m) => m.kind === 'field' || m.kind === 'property')
        const ops = t.members.filter((m) => m.kind === 'method' || m.kind === 'ctor' || m.kind === 'dtor')
        return (
          <div key={t.name} className={`uml-box ${t.kind}`}>
            <div className={`h ${abstract ? 'abstract' : ''}`}>
              {t.kind === 'interface' && <small>«interface»</small>}
              {abstract && <small>«abstract»</small>}
              {t.modifiers.includes('sealed') && <small>«sealed»</small>}
              {t.modifiers.includes('static') && <small>«static»</small>}
              {t.name}
              {t.bases.length > 0 && <small>: {t.bases.join(', ')}</small>}
            </div>
            {t.kind !== 'interface' && (
              <div className="s">
                {data.map((m, i) => (
                  <div key={i} className={m.isStatic ? 'static' : ''}>
                    {sign(m)} {memberText(m)}
                  </div>
                ))}
              </div>
            )}
            <div className="s">
              {(t.kind === 'interface' ? t.members : ops).map((m, i) => (
                <div key={i} className={`${m.isStatic ? 'static' : ''} ${m.modifiers.includes('abstract') ? 'ab' : ''}`}>
                  {t.kind === 'interface' ? '+' : sign(m)} {memberText(m)}
                  {m.modifiers.includes('override') ? ' «override»' : m.modifiers.includes('virtual') ? ' «virtual»' : ''}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
