import { useState } from 'react'
import type { TreeTask as T } from '../../engine/types'
import { inline } from '../inline'
import type { TaskProps } from './common'
import { sfx } from '../../engine/sound'

export function TreeTask({ task, onMistake, onSolved, solved }: TaskProps<T>) {
  const [parents, setParents] = useState<Record<string, string>>(() =>
    solved ? Object.fromEntries(task.classes.map((c) => [c.name, c.parent])) : {},
  )
  const [checked, setChecked] = useState(solved)
  const [done, setDone] = useState(solved)
  const names = [task.root, ...task.classes.map((c) => c.name)]

  const check = () => {
    setChecked(true)
    if (task.classes.every((c) => parents[c.name] === c.parent)) {
      setDone(true)
      sfx.ok()
      onSolved()
    } else {
      sfx.bad()
      onMistake()
    }
  }

  const render = (name: string, seen: Set<string>): React.ReactNode => {
    if (seen.has(name)) return null
    const next = new Set(seen).add(name)
    const kids = task.classes.filter((c) => parents[c.name] === name)
    return (
      <li key={name}>
        {name}
        {kids.length > 0 && <ul>{kids.map((k) => render(k.name, next))}</ul>}
      </li>
    )
  }
  const orphans = task.classes.filter((c) => !parents[c.name])

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🌳 Kalıtım Ağacı</div>
        <div>{inline(task.prompt)}</div>
      </div>
      <div className="tree-grid">
        <div>
          {task.classes.map((c) => (
            <div key={c.name} className={`tree-row ${checked && !done ? (parents[c.name] === c.parent ? 'ok' : 'bad') : ''} ${done ? 'ok' : ''}`}>
              <div className="name">
                class {c.name} : <span style={{ color: 'var(--accent)' }}>{parents[c.name] ?? '?'}</span>
              </div>
              <div className="choices">
                {names
                  .filter((n) => n !== c.name)
                  .map((n) => (
                    <button
                      key={n}
                      className={`pick ${parents[c.name] === n ? 'on' : ''}`}
                      disabled={done}
                      onClick={() => {
                        setParents({ ...parents, [c.name]: n })
                        setChecked(false)
                        sfx.click()
                      }}
                    >
                      {n}
                    </button>
                  ))}
              </div>
              {checked && !done && parents[c.name] !== c.parent && c.hint && <div className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>💡 {c.hint}</div>}
            </div>
          ))}
        </div>
        <div>
          <div className="tree-view">
            <ul>{render(task.root, new Set())}</ul>
            {orphans.length > 0 && <div style={{ color: '#6b7aa6', marginTop: 10 }}>Yerleştirilmemiş: {orphans.map((o) => o.name).join(', ')}</div>}
          </div>
        </div>
      </div>
      <div className="row">
        <button className="btn primary" onClick={check} disabled={done || orphans.length > 0}>Kontrol Et</button>
        {checked && !done && <span className="feedback bad">Kırmızı satırlardaki temel sınıfları tekrar düşün: "… bir …dır" testi uygula.</span>}
        {done && <span className="feedback ok">Kalıtım ağacı doğru! 🌳</span>}
      </div>
    </div>
  )
}
