import { useState } from 'react'
import type { BuildTask as B } from '../../engine/types'
import { CodeView } from '../CodeView'
import { inline } from '../inline'
import { shuffle, type TaskProps } from './common'
import { sfx } from '../../engine/sound'

export function BuildTask({ task, onMistake, onSolved, solved }: TaskProps<B>) {
  const [order] = useState(() => shuffle(task.blocks.map((_, i) => i), task.header))
  const [inside, setInside] = useState<number[]>(() => (solved ? task.blocks.map((b, i) => (b.correct ? i : -1)).filter((i) => i >= 0) : []))
  const [bad, setBad] = useState<number[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [done, setDone] = useState(solved)

  const toggle = (i: number) => {
    if (done) return
    sfx.click()
    setInside((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
    setBad([])
    setMsg(null)
  }

  const check = () => {
    const wrongIn = inside.filter((i) => !task.blocks[i].correct)
    const missing = task.blocks.filter((b, i) => b.correct && !inside.includes(i)).length
    if (!wrongIn.length && !missing) {
      setDone(true)
      sfx.ok()
      onSolved()
      return
    }
    sfx.bad()
    onMistake()
    setBad(wrongIn)
    const parts = []
    if (wrongIn.length) parts.push(`${wrongIn.length} blok sınıfa ait değil`)
    if (missing) parts.push(`${missing} geçerli blok eksik`)
    setMsg(parts.join(', ') + '.')
  }

  const indent = (s: string) => s.split('\n').map((l) => '    ' + l).join('\n')
  const sorted = [...inside].sort((a, b) => a - b)
  const code = `${task.header}\n{\n${sorted.map((i) => indent(task.blocks[i].code)).join('\n\n')}${sorted.length ? '\n' : ''}}`

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🧱 Sınıf İnşa Et</div>
        {task.prompt.split('\n').map((l, i) => (
          <div key={i}>{inline(l)}</div>
        ))}
        <div className="muted" style={{ fontSize: '0.9rem', marginTop: 4 }}>Bloklara tıklayarak sınıfa ekle veya çıkar.</div>
      </div>
      <div className="build">
        <div className="palette">
          {order.map((i) => {
            const b = task.blocks[i]
            return (
              <button key={i} className={`block ${inside.includes(i) ? 'in' : ''} ${bad.includes(i) ? 'bad' : ''}`} onClick={() => toggle(i)} disabled={done}>
                {inside.includes(i) ? '✓ ' : '+ '}
                {b.code}
                {bad.includes(i) && <span className="why">✗ {b.why}</span>}
              </button>
            )
          })}
        </div>
        <div>
          <div className="muted" style={{ fontWeight: 800, marginBottom: 6 }}>{task.header.split(" ").pop()}.cs — canlı önizleme</div>
          <CodeView code={code} />
        </div>
      </div>
      <div className="row">
        <button className="btn primary" onClick={check} disabled={done || inside.length === 0}>Sınıfı Derle</button>
        {msg && <span className="feedback bad">{msg}</span>}
        {done && <span className="feedback ok">Sınıf başarıyla derlendi! 🏭</span>}
      </div>
    </div>
  )
}
