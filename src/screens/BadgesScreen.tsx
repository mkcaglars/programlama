import { BADGES } from '../content/badges'
import { RANKS, rankOf, totalXp, useProgress } from '../engine/progress'

export function BadgesScreen() {
  const s = useProgress()
  const xp = totalXp(s)
  const rank = rankOf(xp)
  return (
    <>
      <h1>🏅 Rozetler ve Unvanlar</h1>
      <div className="panel task-area" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>{rank.icon} {s.name || 'Mühendis'} — {rank.title}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {xp} XP{rank.next ? ` · ${rank.next.title} unvanına ${rank.next.min - xp} XP kaldı` : ' · En yüksek unvana ulaştın!'}
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          {RANKS.map((r) => (
            <span key={r.title} className="chip" style={xp >= r.min ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}>
              {r.icon} {r.title} · {r.min}+
            </span>
          ))}
        </div>
      </div>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const on = b.earned(s)
          return (
            <div key={b.id} className={`panel badge ${on ? '' : 'off'}`}>
              <div className="em">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
              {on && <p style={{ color: 'var(--ok)', fontWeight: 800, marginTop: 6 }}>✓ Kazanıldı</p>}
            </div>
          )
        })}
      </div>
    </>
  )
}
