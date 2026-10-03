import { useEffect, useRef, useState } from 'react'
import { ALL_LEVELS, findLevel, levelXp } from '../content'
import { earnedBadges, type Badge } from '../content/badges'
import { progress, useProgress } from '../engine/progress'
import { TASK_LABEL } from '../engine/types'
import { computeStars } from '../engine/stars'
import { isUnlocked } from '../engine/unlock'
import { sfx } from '../engine/sound'
import { go } from '../router'
import { CodeView } from '../components/CodeView'
import { Rich } from '../components/Rich'
import { inline } from '../components/inline'
import { Confetti } from '../components/Confetti'
import { QuizTask } from '../components/tasks/QuizTask'
import { PredictTask } from '../components/tasks/PredictTask'
import { FillTask } from '../components/tasks/FillTask'
import { CodeTask } from '../components/tasks/CodeTask'
import { BugTask } from '../components/tasks/BugTask'
import { OrderTask } from '../components/tasks/OrderTask'
import { TreeTask } from '../components/tasks/TreeTask'
import { BuildTask } from '../components/tasks/BuildTask'
import { MatchTask } from '../components/tasks/MatchTask'
import { SqlTask } from '../components/tasks/SqlTask'


export function LevelScreen({ id }: { id: string }) {
  const ref = findLevel(id)
  const s = useProgress()
  if (!ref) {
    return (
      <div className="panel task-area">
        <h2>Seviye bulunamadı</h2>
        <a className="btn" href="#/harita">Haritaya dön</a>
      </div>
    )
  }
  if (!isUnlocked(s, id)) {
    return (
      <div className="panel task-area" style={{ textAlign: 'center' }}>
        <h2>🔒 Bu seviye henüz kilitli</h2>
        <p className="muted">Önce önceki seviyeleri tamamlamalısın.</p>
        <a className="btn primary" href="#/harita">Haritaya dön</a>
      </div>
    )
  }
  return <LevelPlayer key={id} id={id} />
}

function LevelPlayer({ id }: { id: string }) {
  const { chapter, level, index, order } = findLevel(id)!
  const [phase, setPhase] = useState<'cards' | 'task'>('cards')
  const [card, setCard] = useState(0)
  const [showCards, setShowCards] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hints, setHints] = useState(0)
  const [solutionShown, setSolutionShown] = useState(false)
  const [result, setResult] = useState<{ stars: number; gained: number; badges: Badge[] } | null>(null)
  const before = useRef(earnedBadges(progress.get()).map((b) => b.id))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'cards' || (e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setCard((c) => Math.min(c + 1, level.cards.length - 1))
      if (e.key === 'ArrowLeft') setCard((c) => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, level.cards.length])

  const solved = () => {
    const stars = computeStars(level.task.kind, mistakes, hints, solutionShown)
    const gained = progress.complete(level.id, stars, levelXp(level))
    const now = earnedBadges(progress.get())
    const fresh = now.filter((b) => !before.current.includes(b.id))
    setTimeout(() => {
      sfx.win()
      setResult({ stars, gained, badges: fresh })
    }, 650)
  }

  const nextRef = ALL_LEVELS[order + 1]
  const common = { onMistake: () => setMistakes((m) => m + 1), onSolved: solved, solved: false }
  const t = level.task
  const hintList = level.hints ?? []

  return (
    <>
      <div className="level-head">
        <a className="btn small ghost back" href="#/harita">← Harita</a>
        <div>
          <div className="muted" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
            {chapter.icon} {chapter.title} · {level.boss ? 'Bölüm Sonu' : `Seviye ${index + 1}`}
            {level.ref ? ` · Kitap: ${level.ref}` : ''}
          </div>
          <h1>{level.title}</h1>
        </div>
        <div className="level-meta">
          <span className="chip">{TASK_LABEL[t.kind]}</span>
          <span className="chip">🏆 {levelXp(level)} XP</span>
          {phase === 'task' && <span className="chip">❌ {mistakes} hata · 💡 {hints} ipucu</span>}
        </div>
      </div>

      {phase === 'cards' && (
        <div className="cards-stage">
          <div className="panel learn-card" key={card}>
            {level.cards[card].icon && <div className="ic">{level.cards[card].icon}</div>}
            <h2>{level.cards[card].title}</h2>
            <Rich text={level.cards[card].body} />
            {level.cards[card].code && <CodeView code={level.cards[card].code!} />}
          </div>
          <div className="dots">
            {level.cards.map((_, i) => <i key={i} className={i === card ? 'on' : ''} />)}
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => setCard(card - 1)} disabled={card === 0}>← Önceki</button>
            {card < level.cards.length - 1 ? (
              <button className="btn primary" onClick={() => setCard(card + 1)}>Sonraki →</button>
            ) : (
              <button className="btn primary" onClick={() => setPhase('task')}>Göreve Başla 🚀</button>
            )}
          </div>
        </div>
      )}

      {phase === 'task' && (
        <div className="task-wrap">
          <div className="row">
            <button className="btn small" onClick={() => setShowCards(!showCards)}>📖 {showCards ? 'Konu kartlarını gizle' : 'Konu kartlarına göz at'}</button>
            {hintList.length > 0 && (
              <button className="btn small" onClick={() => setHints((h) => Math.min(h + 1, hintList.length))} disabled={hints >= hintList.length || !!result}>
                💡 İpucu al ({hintList.length - hints} kaldı)
              </button>
            )}
          </div>
          {showCards && (
            <div className="panel task-area">
              {level.cards.map((c, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <h3>{c.icon} {c.title}</h3>
                  <Rich text={c.body} />
                  {c.code && <CodeView code={c.code} />}
                </div>
              ))}
            </div>
          )}
          {hints > 0 && (
            <div className="hintbox">
              {hintList.slice(0, hints).map((h, i) => (
                <div key={i}>💡 <code>{h}</code></div>
              ))}
            </div>
          )}
          {t.kind === 'quiz' && <QuizTask task={t} {...common} />}
          {t.kind === 'predict' && <PredictTask task={t} {...common} />}
          {t.kind === 'fill' && <FillTask task={t} {...common} />}
          {t.kind === 'code' && <CodeTask task={t} {...common} levelId={level.id} onSolutionShown={() => setSolutionShown(true)} />}
          {t.kind === 'bug' && <BugTask task={t} {...common} />}
          {t.kind === 'order' && <OrderTask task={t} {...common} />}
          {t.kind === 'tree' && <TreeTask task={t} {...common} />}
          {t.kind === 'build' && <BuildTask task={t} {...common} />}
          {t.kind === 'match' && <MatchTask task={t} {...common} />}
          {t.kind === 'sql' && <SqlTask task={t} {...common} />}
        </div>
      )}

      {result && (
        <>
          <Confetti />
          <div className="modal-back" role="dialog" aria-modal="true">
            <div className="panel modal">
              <h2>{result.stars === 3 ? 'Mükemmel! 🎉' : result.stars === 2 ? 'Harika iş! 👏' : 'Görev tamam! 💪'}</h2>
              <div className="big-stars">
                {[1, 2, 3].map((i) => (
                  <span key={i} className={i <= result.stars ? '' : 'off'}>⭐</span>
                ))}
              </div>
              <div className="gain">{result.gained > 0 ? `+${result.gained} XP` : 'Önceki en iyi sonucun korunuyor'}</div>
              {result.badges.map((b) => (
                <div key={b.id} className="new-badge">🏅 Yeni rozet: {b.icon} {b.title}</div>
              ))}
              <div className="explain">
                <b>📌 Neden?</b>
                <p style={{ margin: '6px 0 0' }}>{inline(t.explain)}</p>
              </div>
              {result.stars < 3 && <p className="muted" style={{ fontSize: '0.9rem' }}>3 yıldız için seviyeyi hatasız ve ipucusuz tekrar oynayabilirsin.</p>}
              <div className="row" style={{ justifyContent: 'center' }}>
                <button className="btn" onClick={() => go('/harita')}>🗺️ Harita</button>
                <button className="btn" onClick={() => window.location.reload()}>↻ Tekrar</button>
                {nextRef && (
                  <button className="btn primary" onClick={() => go(`/seviye/${nextRef.level.id}`)} autoFocus>
                    Sonraki Seviye →
                  </button>
                )}
                {!nextRef && <button className="btn primary" onClick={() => go('/rozetler')}>🎓 Rozetlerim</button>}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
