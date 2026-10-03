import { useState } from 'react'
import type { PredictTask as P } from '../../engine/types'
import { CodeView } from '../CodeView'
import { inline } from '../inline'
import type { TaskProps } from './common'
import { sfx } from '../../engine/sound'
import { normOutput } from '../../engine/text'


export function PredictTask({ task, onMistake, onSolved, solved }: TaskProps<P>) {
  const [value, setValue] = useState(solved ? task.answers[0] : '')
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>(solved ? 'ok' : 'idle')
  const check = () => {
    const v = normOutput(value)
    if (!v) return
    if (task.answers.some((a) => normOutput(a) === v)) {
      setState('ok')
      sfx.ok()
      onSolved()
    } else {
      setState('bad')
      sfx.bad()
      onMistake()
    }
  }
  const lineCount = task.answers[0].split('\n').length
  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🔮 Çıktıyı Tahmin Et</div>
        <div>{inline(task.prompt)}</div>
      </div>
      <CodeView code={task.code} />
      <div className="panel task-area">
        <label className="muted" htmlFor="out" style={{ fontWeight: 800 }}>
          Konsol çıktısı {lineCount > 1 ? `(${lineCount} satır)` : ''}
        </label>
        <textarea
          id="out"
          className="console"
          style={{ width: '100%', minHeight: `${Math.max(3, lineCount + 1) * 1.6}em`, marginTop: 8, resize: 'vertical' }}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (state === 'bad') setState('idle')
          }}
          disabled={state === 'ok'}
          placeholder="Program ne yazdırır?"
          spellCheck={false}
        />
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary" onClick={check} disabled={state === 'ok' || !value.trim()}>
            Kontrol Et
          </button>
          {state === 'bad' && <span className="feedback bad">Çıktı farklı. Kodu satır satır takip et!</span>}
          {state === 'ok' && <span className="feedback ok">Doğru tahmin! 🎯</span>}
        </div>
      </div>
    </div>
  )
}
