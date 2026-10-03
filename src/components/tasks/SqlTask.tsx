import { useMemo, useState } from 'react'
import type { SqlTask as S } from '../../engine/types'
import { cloneDb, execute, sameDb, sameResult, SqlError, type Database, type QueryResult, type Table } from '../../engine/sql'
import { LazyEditor as CodeEditor } from '../LazyEditor'
import { inline } from '../inline'
import type { TaskProps } from './common'
import { sfx } from '../../engine/sound'

function DataTable({ columns, rows, highlight }: { columns: string[]; rows: (string | number | null)[][]; highlight?: Set<number> }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length || 1} className="null">(kayıt yok)</td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className={highlight?.has(i) ? 'new' : ''}>
              {r.map((v, j) => (
                <td key={j} className={v === null ? 'null' : ''}>{v === null ? 'NULL' : String(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const tableRows = (t: Table) => t.rows.map((r) => t.columns.map((c) => r[c.name] ?? null))

export function SqlTask({ task, onMistake, onSolved, solved }: TaskProps<S>) {
  const [sql, setSql] = useState(solved ? task.solution : task.starter ?? '')
  const [db, setDb] = useState<Database>(() => cloneDb(task.db))
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verdict, setVerdict] = useState<'ok' | 'bad' | null>(solved ? 'ok' : null)
  const [tab, setTab] = useState(Object.keys(task.db)[0])

  const expected = useMemo(() => {
    const d = cloneDb(task.db)
    const r = execute(d, task.solution)
    return { db: d, result: r[r.length - 1] }
  }, [task])

  const run = () => {
    const fresh = cloneDb(task.db)
    setError(null)
    try {
      const res = execute(fresh, sql)
      const last = res[res.length - 1]
      setDb(fresh)
      setResult(last)
      let ok: boolean
      if (task.check === 'select') ok = last.kind === 'select' && sameResult(last, expected.result, !!task.ordered)
      else ok = sameDb(fresh, expected.db)
      if (last.kind !== 'select') {
        const changed = Object.keys(fresh).find((k) => JSON.stringify(fresh[k]) !== JSON.stringify(task.db[k]))
        if (changed) setTab(changed)
      }
      if (ok) {
        setVerdict('ok')
        sfx.ok()
        onSolved()
      } else {
        setVerdict('bad')
        sfx.bad()
        onMistake()
      }
    } catch (e) {
      setError(e instanceof SqlError ? e.message : String(e))
      setResult(null)
      setDb(cloneDb(task.db))
      setVerdict(null)
      sfx.bad()
      onMistake()
    }
  }

  const done = verdict === 'ok'
  const shown = db[tab] ?? Object.values(db)[0]

  return (
    <div className="task-wrap">
      <div className="panel prompt">
        <div className="kind chip">🗄️ SQL Sorgusu</div>
        <div>{inline(task.prompt)}</div>
      </div>
      <div className="sql-grid">
        <div>
          <div className="editor-shell">
            <div className="editor-bar">
              <span className="file">MySQL › kutuphane_db</span>
              <span className="sp" />
              <button className="btn small ghost" onClick={() => setSql(task.starter ?? '')} disabled={done}>↺ Sıfırla</button>
            </div>
            <CodeEditor value={sql} onChange={setSql} lang="sql" minHeight="160px" onRun={done ? undefined : run} />
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={run} disabled={done || !sql.trim()}>▶ Sorguyu Çalıştır</button>
            <span className="muted" style={{ fontSize: '0.85rem' }}>Ctrl + Enter</span>
          </div>
          <div style={{ marginTop: 12 }}>
            {error && <div className="feedback bad">⚠ {error}</div>}
            {result && (
              <div className="panel task-area" style={{ boxShadow: 'none' }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Sonuç: <span className="muted">{result.message}</span></div>
                {result.kind === 'select' && <DataTable columns={result.columns} rows={result.rows} />}
              </div>
            )}
            {verdict === 'bad' && (
              <div className="feedback bad" style={{ marginTop: 10 }}>
                Sorgu çalıştı ama sonuç beklenenden farklı.{' '}
                {task.check === 'select' ? `Beklenen: ${expected.result.columns.length} sütun, ${expected.result.rows.length} satır.` : 'Tablonun son hâlini kontrol et.'}
              </div>
            )}
            {done && <div className="feedback ok" style={{ marginTop: 10 }}>Sorgu doğru! 🎉</div>}
          </div>
        </div>
        <div className="panel task-area">
          <div className="tabs">
            {Object.keys(db).map((k) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>📋 {db[k].name}</button>
            ))}
          </div>
          {shown && (
            <>
              <div className="schema">{shown.columns.map((c) => `${c.name} ${c.type}${c.pk ? ' PK' : ''}${c.autoInc ? ' AI' : ''}`).join(' · ')}</div>
              <DataTable
                columns={shown.columns.map((c) => c.name)}
                rows={tableRows(shown)}
                highlight={new Set(shown.rows.map((_, i) => i).filter((i) => i >= (task.db[tab]?.rows.length ?? 0)))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
