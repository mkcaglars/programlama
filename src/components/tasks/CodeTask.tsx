import { useEffect, useMemo, useRef, useState } from 'react'
import type { CodeTask as C } from '../../engine/types'
import { compile, type CompileResult } from '../../engine/csharp/semantic'
import { checkRules, type RuleResult } from '../../engine/csharp/rules'
import { LazyEditor as CodeEditor } from '../LazyEditor'
import type { EditorHandle } from '../editorHandle'
import { UmlView } from '../UmlView'
import { inline } from '../inline'
import type { TaskProps } from './common'
import { sfx } from '../../engine/sound'

interface Props extends TaskProps<C> {
  levelId: string
  onSolutionShown(): void
}

const draftKey = (id: string) => `nesne-atolyesi:taslak:${id}`

export function CodeTask({ task, onMistake, onSolved, solved, levelId, onSolutionShown }: Props) {
  const [code, setCode] = useState<string>(() => {
    if (solved) return task.solution
    try {
      return localStorage.getItem(draftKey(levelId)) ?? task.starter
    } catch {
      return task.starter
    }
  })
  const [result, setResult] = useState<{ compiled: CompileResult; rules: RuleResult[] } | null>(null)
  const [tab, setTab] = useState<'goals' | 'uml' | 'out'>('goals')
  const [done, setDone] = useState(solved)
  const [fails, setFails] = useState(0)
  const editor = useRef<EditorHandle | null>(null)

  // canlı UML için gecikmeli ayrıştırma
  const [live, setLive] = useState(() => compile(code))
  useEffect(() => {
    const t = setTimeout(() => setLive(compile(code)), 350)
    return () => clearTimeout(t)
  }, [code])

  useEffect(() => {
    try {
      if (!done) localStorage.setItem(draftKey(levelId), code)
    } catch {
      // yok say
    }
  }, [code, levelId, done])

  const run = () => {
    const compiled = compile(code)
    const rules = checkRules(compiled, task.rules)
    setResult({ compiled, rules })
    const ok = compiled.ok && rules.every((r) => r.ok)
    if (ok) {
      setDone(true)
      setTab('out')
      sfx.ok()
      onSolved()
      try {
        localStorage.removeItem(draftKey(levelId))
      } catch {
        // yok say
      }
    } else {
      setFails((f) => f + 1)
      setTab('goals')
      sfx.bad()
      onMistake()
    }
  }

  const errors = result?.compiled.diagnostics.filter((d) => d.severity === 'error') ?? []
  const warnings = result?.compiled.diagnostics.filter((d) => d.severity === 'warning') ?? []
  const ruleState = useMemo(() => new Map(result?.rules.map((r) => [r.rule, r]) ?? []), [result])
  const passed = result ? result.rules.filter((r) => r.ok).length : 0

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">💻 Kod Yaz</div>
        {task.prompt.split('\n').map((l, i) => (
          <div key={i}>{inline(l)}</div>
        ))}
      </div>
      <div className="ide">
        <div>
          <div className="editor-shell">
            <div className="editor-bar">
              <span className="file">Program.cs</span>
              <span className="sp" />
              <button className="btn small ghost" onClick={() => setCode(task.starter)} disabled={done} title="Başlangıç koduna dön">
                ↺ Sıfırla
              </button>
              {fails >= 3 && !done && (
                <button
                  className="btn small ghost"
                  onClick={() => {
                    if (confirm('Örnek çözüm editöre yüklensin mi? Bu seviyeden en fazla 1 yıldız alabilirsin.')) {
                      setCode(task.solution)
                      onSolutionShown()
                    }
                  }}
                >
                  👀 Çözümü göster
                </button>
              )}
            </div>
            <CodeEditor value={code} onChange={setCode} lang="cs" handleRef={editor} onRun={done ? undefined : run} />
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={run} disabled={done}>
              ▶ Derle ve Çalıştır
            </button>
            <span className="muted" style={{ fontSize: '0.85rem' }}>Kısayol: Ctrl + Enter</span>
          </div>
        </div>
        <div className="side panel task-area">
          <div className="tabs" role="tablist">
            <button className={tab === 'goals' ? 'on' : ''} onClick={() => setTab('goals')}>
              🎯 Hedefler {result ? `${passed}/${task.rules.length}` : ''}
            </button>
            <button className={tab === 'uml' ? 'on' : ''} onClick={() => setTab('uml')}>📐 Sınıf Diyagramı</button>
            <button className={tab === 'out' ? 'on' : ''} onClick={() => setTab('out')}>🖥️ Çıktı</button>
          </div>
          {tab === 'goals' && (
            <>
              {result && errors.length > 0 && (
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>❌ Hata Listesi ({errors.length})</div>
                  <div className="diags">
                    {errors.map((d, i) => (
                      <div key={i} className="diag error" onClick={() => editor.current?.jumpTo(d.line)} title="Satıra git">
                        <span className="code-tag">{d.code}<br />satır {d.line}</span>
                        <span>{d.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result && warnings.length > 0 && (
                <div className="diags">
                  {warnings.map((d, i) => (
                    <div key={i} className="diag warning" onClick={() => editor.current?.jumpTo(d.line)}>
                      <span className="code-tag">{d.code}<br />satır {d.line}</span>
                      <span>{d.message}</span>
                    </div>
                  ))}
                </div>
              )}
              <ul className="goals">
                {task.rules.map((r, i) => {
                  const st = ruleState.get(r)
                  const cls = st ? (st.ok ? 'ok' : 'bad') : ''
                  return (
                    <li key={i} className={cls}>
                      <span className="st">{st ? (st.ok ? '✅' : '⬜') : '▫️'}</span>
                      <span>
                        {inline(r.goal)}
                        {st && !st.ok && errors.length === 0 && st.detail && <span className="detail">{st.detail}</span>}
                      </span>
                    </li>
                  )
                })}
              </ul>
              {result && errors.length > 0 && <div className="muted" style={{ fontSize: '0.85rem' }}>Önce derleme hatalarını düzelt; hedefler hatasız kodda denetlenir.</div>}
            </>
          )}
          {tab === 'uml' && <UmlView types={live.program.types} />}
          {tab === 'out' && (
            <div className="console">
              {done ? (
                <>
                  <span className="prompt-line">{'> Derleme başarılı. 0 hata.\n'}</span>
                  {task.output ? `> Program çalıştırıldı:\n\n${task.output}` : '> Sınıflar hazır. Bu görevde ekrana çıktı yazdırılmıyor.'}
                </>
              ) : (
                <span className="prompt-line">{'> Henüz başarılı bir derleme yok.\n> "Derle ve Çalıştır" düğmesine bas.'}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
