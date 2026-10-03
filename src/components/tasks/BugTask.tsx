import { useState } from 'react'
import type { BugTask as B } from '../../engine/types'
import { CodeView } from '../CodeView'
import { inline } from '../inline'
import { LETTERS, type TaskProps } from './common'
import { sfx } from '../../engine/sound'

export function BugTask({ task, onMistake, onSolved, solved }: TaskProps<B>) {
  const [sel, setSel] = useState<number[]>(solved ? task.bugLines : [])
  const [phase, setPhase] = useState<'find' | 'fix' | 'done'>(solved ? 'done' : 'find')
  const [msg, setMsg] = useState<{ cls: string; text: string } | null>(null)
  const [revealed, setRevealed] = useState(solved)
  const [wrongFix, setWrongFix] = useState<number[]>([])

  const toggle = (line: number) => {
    if (phase !== 'find') return
    setSel((s) => (s.includes(line) ? s.filter((x) => x !== line) : [...s, line]))
    setMsg(null)
  }

  const check = () => {
    const correct = sel.filter((l) => task.bugLines.includes(l)).length
    const extra = sel.filter((l) => !task.bugLines.includes(l)).length
    if (correct === task.bugLines.length && extra === 0) {
      setRevealed(true)
      sfx.ok()
      if (task.fix) {
        setPhase('fix')
        setMsg({ cls: 'ok', text: 'Hatalı satırların hepsini buldun! Şimdi düzeltmeyi seç.' })
      } else {
        setPhase('done')
        onSolved()
      }
    } else {
      sfx.bad()
      onMistake()
      const parts: string[] = []
      if (extra) parts.push(`${extra} seçimin hatalı değil`)
      if (correct < task.bugLines.length) parts.push(`${task.bugLines.length - correct} hatalı satır daha var`)
      setMsg({ cls: 'bad', text: `${correct}/${task.bugLines.length} doğru. ${parts.join(', ')}.` })
    }
  }

  const pickFix = (i: number) => {
    if (!task.fix || phase !== 'fix') return
    if (i === task.fix.answer) {
      setPhase('done')
      sfx.ok()
      onSolved()
    } else if (!wrongFix.includes(i)) {
      setWrongFix([...wrongFix, i])
      sfx.bad()
      onMistake()
    }
  }

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🐞 Hata Avcısı</div>
        {task.prompt.split('\n').map((l, i) => (
          <div key={i}>{inline(l)}</div>
        ))}
        <div className="muted" style={{ fontSize: '0.9rem', marginTop: 4 }}>
          Satıra tıklayarak işaretle. Toplam <b>{task.bugLines.length}</b> hatalı satır var.
        </div>
      </div>
      <CodeView
        code={task.code}
        onLineClick={phase === 'find' ? toggle : undefined}
        lineClass={(l) => (revealed && task.bugLines.includes(l) ? 'correct' : sel.includes(l) ? 'selected' : '')}
      />
      {phase === 'find' && (
        <div className="row">
          <button className="btn primary" onClick={check} disabled={sel.length === 0}>
            Kontrol Et ({sel.length} satır seçili)
          </button>
          {msg && <span className={`feedback ${msg.cls}`}>{msg.text}</span>}
        </div>
      )}
      {phase !== 'find' && task.fix && (
        <div className="panel task-area">
          <h3>🔧 {task.fix.question}</h3>
          <div className="options">
            {task.fix.options.map((o, i) => (
              <button
                key={i}
                className={`option ${wrongFix.includes(i) ? 'wrong' : ''} ${phase === 'done' && i === task.fix!.answer ? 'right' : ''}`}
                onClick={() => pickFix(i)}
                disabled={phase === 'done' || wrongFix.includes(i)}
              >
                <span className="letter">{LETTERS[i]}</span>
                <span>{/[;{}()=]/.test(o) ? <code>{o}</code> : o}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
