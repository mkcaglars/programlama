import { useEffect } from 'react'
import { useRoute } from './router'
import { rankOf, totalXp, useProgress } from './engine/progress'
import { Home } from './screens/Home'
import { MapScreen } from './screens/MapScreen'
import { LevelScreen } from './screens/LevelScreen'
import { BadgesScreen } from './screens/BadgesScreen'
import { GlossaryScreen } from './screens/GlossaryScreen'
import { TeacherScreen } from './screens/TeacherScreen'

const NAV = [
  { path: 'harita', label: '🗺️ Harita' },
  { path: 'sozluk', label: '📖 Sözlük' },
  { path: 'rozetler', label: '🏅 Rozetler' },
  { path: 'ayarlar', label: '⚙️ Ayarlar' },
]

export default function App() {
  const route = useRoute()
  const s = useProgress()
  const xp = totalXp(s)
  const rank = rankOf(xp)
  const pct = rank.next ? ((xp - rank.min) / (rank.next.min - rank.min)) * 100 : 100

  useEffect(() => {
    const titles: Record<string, string> = { harita: 'Harita', sozluk: 'Sözlük', rozetler: 'Rozetler', ayarlar: 'Ayarlar', seviye: 'Görev' }
    document.title = route[0] ? `${titles[route[0]] ?? ''} · Nesne Atölyesi` : 'Nesne Atölyesi'
  }, [route])

  let page: React.ReactNode
  switch (route[0]) {
    case 'harita':
      page = <MapScreen />
      break
    case 'seviye':
      page = <LevelScreen id={route[1] ?? ''} />
      break
    case 'rozetler':
      page = <BadgesScreen />
      break
    case 'sozluk':
      page = <GlossaryScreen />
      break
    case 'ayarlar':
      page = <TeacherScreen />
      break
    default:
      page = <Home />
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="brand-logo">{'{}'}</span>
          Nesne Atölyesi
        </a>
        <nav className="nav">
          {NAV.map((n) => (
            <a key={n.path} href={`#/${n.path}`} className={route[0] === n.path ? 'active' : ''}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="xpbox" title={rank.next ? `${rank.next.title} unvanına ${rank.next.min - xp} XP` : 'En yüksek unvan'}>
          <span className="rank">{rank.icon} {rank.title}</span>
          <span className="xpbar"><i style={{ width: `${pct}%` }} /></span>
          <span className="xpnum">{xp} XP</span>
        </div>
      </header>
      <main>{page}</main>
      <footer className="footer">Nesne Atölyesi · MEB 11. sınıf Nesne Tabanlı Programlama dersi için eğitsel oyun · C#</footer>
    </div>
  )
}
