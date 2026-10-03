import { useState } from 'react'
import type { QuizTask as Q } from '../../engine/types'
import { CodeView } from '../CodeView'
import { inline } from '../inline'
import { LETTERS, type TaskProps } from './common'
import { sfx } from '../../engine/sound'

export function QuizTask({ task, onMistake, onSolved, solved }: TaskProps<Q>) {
  const [wrong, setWrong] = useState<number[]>([])
  const [right, setRight] = useState(solved)
  const pick = (i: number) => {
    if (right) return
    if (i === task.answer) {
      setRight(true)
      sfx.ok()
      onSolved()
    } else if (!wrong.includes(i)) {
      setWrong([...wrong, i])
      sfx.bad()
      onMistake()
    }
  }
  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">❓ Soru</div>
        {task.question.split('\n').map((q, i) => (
          <div key={i}>{inline(q)}</div>
        ))}
      </div>
      {task.code && <CodeView code={task.code} />}
      <div className="options" role="list">
        {task.options.map((o, i) => (
          <button
            key={i}
            className={`option ${wrong.includes(i) ? 'wrong' : ''} ${right && i === task.answer ? 'right' : ''}`}
            onClick={() => pick(i)}
            disabled={right || wrong.includes(i)}
          >
            <span className="letter">{LETTERS[i]}</span>
            <span>{/[;{}()=]/.test(o) ? <code>{o}</code> : inline(o)}</span>
          </button>
        ))}
      </div>
      {wrong.length > 0 && !right && <div className="feedback bad">Bu seçenek doğru değil, tekrar dene!</div>}
    </div>
  )
}
