import { useState } from 'react'
import { GLOSSARY } from '../content/glossary'
import { CHAPTERS } from '../content'
import { CodeView } from '../components/CodeView'

const fold = (s: string) => s.toLocaleLowerCase('tr')

export function GlossaryScreen() {
  const [q, setQ] = useState('')
  const [ch, setCh] = useState('')
  const list = GLOSSARY.filter((t) => (!ch || t.chapter === ch) && (!q || fold(t.term + ' ' + t.en + ' ' + t.desc).includes(fold(q))))
  return (
    <>
      <h1>📖 NTP Sözlüğü</h1>
      <input className="search" placeholder="Terim ara… (ör. kalıtım, override, property)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Terim ara" />
      <div className="row" style={{ marginBottom: 16 }}>
        <button className={`pick ${ch === '' ? 'on' : ''}`} onClick={() => setCh('')}>Tümü</button>
        {CHAPTERS.map((c) => (
          <button key={c.id} className={`pick ${ch === c.id ? 'on' : ''}`} onClick={() => setCh(c.id)}>
            {c.icon} {c.title}
          </button>
        ))}
      </div>
      <div className="terms">
        {list.map((t) => (
          <div key={t.term} className="panel term">
            <h3>{t.term}</h3>
            <div className="en">{t.en}</div>
            <p>{t.desc}</p>
            {t.code && <CodeView code={t.code} numbers={false} />}
          </div>
        ))}
        {list.length === 0 && <p className="muted">Sonuç bulunamadı.</p>}
      </div>
    </>
  )
}
