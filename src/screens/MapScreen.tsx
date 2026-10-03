import { CHAPTERS } from '../content'
import { TASK_LABEL } from '../engine/types'
import { useProgress } from '../engine/progress'
import { isUnlocked, nextLevelId } from '../engine/unlock'

export function MapScreen() {
  const s = useProgress()
  const next = nextLevelId(s)
  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>🗺️ Atölye Haritası</h1>
        {s.unlockAll && <span className="chip">👩‍🏫 Öğretmen modu: tüm seviyeler açık</span>}
      </div>
      <div className="chapters">
        {CHAPTERS.map((c) => {
          const done = c.levels.filter((l) => s.levels[l.id]).length
          const stars = c.levels.reduce((a, l) => a + (s.levels[l.id]?.stars ?? 0), 0)
          const chapterLocked = !isUnlocked(s, c.levels[0].id)
          return (
            <section key={c.id} className={`panel chapter ${chapterLocked ? 'locked' : ''}`} style={{ '--c': c.color } as React.CSSProperties}>
              <div className="chapter-head">
                <div className="chapter-icon">{c.icon}</div>
                <div>
                  <h2>{c.title}</h2>
                  <div className="sub">{c.subtitle} · {c.unit}. Öğrenme Birimi</div>
                </div>
                <div className="chapter-progress">
                  {done}/{c.levels.length} seviye<br />⭐ {stars}/{c.levels.length * 3}
                </div>
              </div>
              <div className="path">
                {c.levels.map((l, i) => {
                  const lp = s.levels[l.id]
                  const open = isUnlocked(s, l.id)
                  const cls = `node ${lp ? 'done' : ''} ${l.id === next ? 'current' : ''} ${open ? '' : 'locked'} ${l.boss ? 'boss' : ''}`
                  const inner = (
                    <>
                      {!open && <span className="lock">🔒</span>}
                      <span className="n">{l.boss ? '👑 BÖLÜM SONU' : `SEVİYE ${i + 1}`}</span>
                      <span className="t">{l.title}</span>
                      <span className="k">{TASK_LABEL[l.task.kind]}</span>
                      <span className="stars">{lp ? '⭐'.repeat(lp.stars) + '☆'.repeat(3 - lp.stars) : '☆☆☆'}</span>
                    </>
                  )
                  return open ? (
                    <a key={l.id} className={cls} href={`#/seviye/${l.id}`}>{inner}</a>
                  ) : (
                    <div key={l.id} className={cls} title="Önceki seviyeyi tamamla" aria-disabled="true">{inner}</div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
