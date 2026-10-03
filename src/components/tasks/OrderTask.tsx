import { useState } from 'react'
import type { OrderTask as O } from '../../engine/types'
import { highlightLine } from '../highlight'
import { inline } from '../inline'
import { shuffle, type TaskProps } from './common'
import { sfx } from '../../engine/sound'

export function OrderTask({ task, onMistake, onSolved, solved }: TaskProps<O>) {
  const [items, setItems] = useState<string[]>(() => {
    if (solved) return task.lines
    let s = shuffle(task.lines, task.prompt)
    if (s.every((l, i) => l === task.lines[i])) s = [...s.slice(1), s[0]]
    return s
  })
  const [drag, setDrag] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>(solved ? 'ok' : 'idle')
  const done = state === 'ok'

  const move = (from: number, to: number) => {
    if (done || to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    setItems(next)
    setState('idle')
    sfx.click()
  }

  const correctOrders = [task.lines, ...(task.alternatives ?? [])]
  const check = () => {
    if (correctOrders.some((o) => o.every((l, i) => l === items[i]))) {
      setState('ok')
      sfx.ok()
      onSolved()
    } else {
      setState('bad')
      sfx.bad()
      onMistake()
    }
  }
  const lineOk = (i: number) => items[i] === task.lines[i]

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🧩 Kod Sırala</div>
        {task.prompt.split('\n').map((l, i) => (
          <div key={i}>{inline(l)}</div>
        ))}
        <div className="muted" style={{ fontSize: '0.9rem', marginTop: 4 }}>Satırları sürükle-bırak ya da ▲▼ düğmeleriyle taşı.</div>
      </div>
      <div className="order-list">
        {items.map((l, i) => (
          <div
            key={l + i}
            className={`order-item ${drag === i ? 'dragging' : ''} ${over === i ? 'over' : ''} ${state === 'bad' ? (lineOk(i) ? 'ok' : 'bad') : ''} ${done ? 'ok' : ''}`}
            draggable={!done}
            onDragStart={() => setDrag(i)}
            onDragEnd={() => {
              setDrag(null)
              setOver(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(i)
            }}
            onDrop={() => {
              if (drag !== null) move(drag, i)
              setDrag(null)
              setOver(null)
            }}
          >
            <span className="grip">⋮⋮</span>
            <span className="src">{highlightLine(l).map((h, j) => (h.cls ? <span key={j} className={h.cls}>{h.text}</span> : h.text))}</span>
            {!done && (
              <span className="mv">
                <button aria-label="Yukarı taşı" onClick={() => move(i, i - 1)} disabled={i === 0}>▲</button>
                <button aria-label="Aşağı taşı" onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>▼</button>
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="row">
        <button className="btn primary" onClick={check} disabled={done}>Kontrol Et</button>
        {state === 'bad' && <span className="feedback bad">Sıra henüz doğru değil. Yeşil satırlar yerinde, kırmızıları düzenle.</span>}
        {done && <span className="feedback ok">Kusursuz sıralama! ✅</span>}
      </div>
    </div>
  )
}
