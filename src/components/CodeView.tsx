import { highlightLine } from './highlight'

interface Props {
  code: string
  lang?: 'cs' | 'sql'
  numbers?: boolean
  onLineClick?: (line: number) => void
  lineClass?: (line: number) => string
}

export function CodeView({ code, lang = 'cs', numbers = true, onLineClick, lineClass }: Props) {
  const lines = code.replace(/\n$/, '').split('\n')
  return (
    <pre className={`code ${numbers ? '' : 'no-numbers'} ${onLineClick ? 'clickable' : ''}`}>
      {lines.map((ln, i) => (
        <div
          key={i}
          className={`ln ${lineClass?.(i + 1) ?? ''}`}
          onClick={onLineClick ? () => onLineClick(i + 1) : undefined}
          role={onLineClick ? 'button' : undefined}
          tabIndex={onLineClick ? 0 : undefined}
          onKeyDown={onLineClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onLineClick(i + 1)) : undefined}
        >
          {numbers && <span className="no">{i + 1}</span>}
          <span className="src">
            {highlightLine(ln, lang).map((p, j) => (p.cls ? <span key={j} className={p.cls}>{p.text}</span> : p.text))}
            {ln === '' ? ' ' : null}
          </span>
        </div>
      ))}
    </pre>
  )
}
