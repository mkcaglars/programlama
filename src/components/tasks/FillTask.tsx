import { Fragment, useState } from 'react'
import type { FillTask as F } from '../../engine/types'
import { highlightLine } from '../highlight'
import { inline } from '../inline'
import type { TaskProps } from './common'
import { sfx } from '../../engine/sound'

const norm = (s: string) => s.replace(/\s+/g, '')

export function FillTask({ task, onMistake, onSolved, solved }: TaskProps<F>) {
  const [vals, setVals] = useState<string[]>(() => task.blanks.map((b) => (solved ? b.accept[0] : '')))
  const [marks, setMarks] = useState<(boolean | null)[]>(() => task.blanks.map(() => (solved ? true : null)))
  const done = marks.every((m) => m === true)

  const check = () => {
    const res = task.blanks.map((b, i) => b.accept.some((a) => norm(a) === norm(vals[i])))
    setMarks(res)
    if (res.every(Boolean)) {
      sfx.ok()
      onSolved()
    } else {
      sfx.bad()
      onMistake()
    }
  }

  const lines = task.code.split('\n')
  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">✏️ Boşluk Doldur</div>
        {task.prompt.split('\n').map((l, i) => (
          <div key={i}>{inline(l)}</div>
        ))}
      </div>
      <pre className="code">
        {lines.map((ln, li) => {
          const parts = ln.split(/(\[\[\d+\]\])/g)
          return (
            <div className="ln" key={li}>
              <span className="no">{li + 1}</span>
              <span className="src">
                {parts.map((p, pi) => {
                  const m = /^\[\[(\d+)\]\]$/.exec(p)
                  if (m) {
                    const i = Number(m[1])
                    const b = task.blanks[i]
                    const w = Math.max(b.width ?? 6, vals[i].length + 1)
                    return (
                      <input
                        key={pi}
                        className={`blank ${marks[i] === true ? 'ok' : marks[i] === false ? 'bad' : ''}`}
                        style={{ width: `${w + 1}ch` }}
                        value={vals[i]}
                        disabled={done}
                        aria-label={`Boşluk ${i + 1}`}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        placeholder={b.placeholder ?? '?'}
                        onChange={(e) => {
                          const v = [...vals]
                          v[i] = e.target.value
                          setVals(v)
                          const mk = [...marks]
                          mk[i] = null
                          setMarks(mk)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && check()}
                      />
                    )
                  }
                  return (
                    <Fragment key={pi}>
                      {highlightLine(p).map((h, j) => (h.cls ? <span key={j} className={h.cls}>{h.text}</span> : h.text))}
                    </Fragment>
                  )
                })}
              </span>
            </div>
          )
        })}
      </pre>
      <div className="row">
        <button className="btn primary" onClick={check} disabled={done || vals.some((v) => !v.trim())}>
          Kontrol Et
        </button>
        {marks.some((m) => m === false) && <span className="feedback bad">Kırmızı boşlukları tekrar düşün. C# büyük/küçük harfe duyarlıdır!</span>}
        {done && <span className="feedback ok">Hepsi doğru! ✅</span>}
      </div>
    </div>
  )
}
