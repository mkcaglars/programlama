import { useState } from 'react'
import type { MatchTask as M } from '../../engine/types'
import { inline } from '../inline'
import { shuffle, type TaskProps } from './common'
import { sfx } from '../../engine/sound'

const COLORS = ['#f59e0b', '#60a5fa', '#a78bfa', '#34d399', '#fb7185', '#22d3ee', '#fbbf24', '#e879f9']

export function MatchTask({ task, onMistake, onSolved, solved }: TaskProps<M>) {
  const [rights] = useState(() => shuffle(task.pairs.map((_, i) => i), task.prompt))
  // pairs: left index -> right index
  const [pairs, setPairs] = useState<Record<number, number>>(() => (solved ? Object.fromEntries(task.pairs.map((_, i) => [i, i])) : {}))
  const [selLeft, setSelLeft] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const [done, setDone] = useState(solved)

  const colorOf = (left: number) => COLORS[Object.keys(pairs).map(Number).sort((a, b) => a - b).indexOf(left) % COLORS.length]
  const leftOfRight = (r: number) => {
    const e = Object.entries(pairs).find(([, v]) => v === r)
    return e ? Number(e[0]) : null
  }

  const clickLeft = (i: number) => {
    if (done) return
    sfx.click()
    setSelLeft(i)
    setWrong([])
  }
  const clickRight = (r: number) => {
    if (done) return
    if (selLeft === null) {
      const l = leftOfRight(r)
      if (l !== null) {
        const p = { ...pairs }
        delete p[l]
        setPairs(p)
      }
      return
    }
    sfx.click()
    const p = { ...pairs }
    const prev = leftOfRight(r)
    if (prev !== null) delete p[prev]
    p[selLeft] = r
    setPairs(p)
    setWrong([])
    const nextFree = task.pairs.findIndex((_, i) => p[i] === undefined)
    setSelLeft(nextFree >= 0 ? nextFree : null)
  }

  const check = () => {
    const bad = task.pairs.map((_, i) => i).filter((i) => pairs[i] !== i)
    if (!bad.length) {
      setDone(true)
      sfx.ok()
      onSolved()
    } else {
      setWrong(bad)
      sfx.bad()
      onMistake()
    }
  }
  const complete = Object.keys(pairs).length === task.pairs.length

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🔗 Eşleştir</div>
        {task.prompt.split('\n').map((l, i) => (
          <div key={i}>{inline(l)}</div>
        ))}
        <div className="muted" style={{ fontSize: '0.9rem', marginTop: 4 }}>Soldan bir öğe seç, sonra sağdaki karşılığına tıkla.</div>
      </div>
      <div className="match">
        <div className="match-col">
          {task.pairs.map((p, i) => {
            const paired = pairs[i] !== undefined
            return (
              <button
                key={i}
                className={`match-item ${selLeft === i ? 'sel' : ''} ${paired ? 'paired' : ''} ${wrong.includes(i) ? 'wrong' : ''} ${done ? 'locked-ok' : ''}`}
                style={paired ? ({ '--pc': colorOf(i) } as React.CSSProperties) : undefined}
                onClick={() => clickLeft(i)}
              >
                {paired && !done && <span className="tag">{Object.keys(pairs).map(Number).sort((a, b) => a - b).indexOf(i) + 1}</span>}
                {inline(p.left)}
              </button>
            )
          })}
        </div>
        <div className="match-col">
          {rights.map((r) => {
            const l = leftOfRight(r)
            return (
              <button
                key={r}
                className={`match-item ${l !== null ? 'paired' : ''} ${l !== null && wrong.includes(l) ? 'wrong' : ''} ${done ? 'locked-ok' : ''}`}
                style={l !== null ? ({ '--pc': colorOf(l) } as React.CSSProperties) : undefined}
                onClick={() => clickRight(r)}
              >
                {l !== null && !done && <span className="tag">{Object.keys(pairs).map(Number).sort((a, b) => a - b).indexOf(l) + 1}</span>}
                {inline(task.pairs[r].right)}
              </button>
            )
          })}
        </div>
      </div>
      <div className="row">
        <button className="btn primary" onClick={check} disabled={done || !complete}>Kontrol Et</button>
        {wrong.length > 0 && <span className="feedback bad">{wrong.length} eşleştirme yanlış. Titreyen öğeleri tekrar eşleştir.</span>}
        {done && <span className="feedback ok">Tüm eşleştirmeler doğru! 🔗</span>}
      </div>
    </div>
  )
}
