import { useState } from 'react'
import { ALL_LEVELS, CHAPTERS } from '../content'
import { earnedBadges } from '../content/badges'
import { progress, rankOf, totalXp, useProgress } from '../engine/progress'
import { nextLevelId } from '../engine/unlock'
import { go } from '../router'
import { CodeView } from '../components/CodeView'

const BELT = ['📺 tv1 : Televizyon', '🎓 ogr : Ogrenci', '📚 k1 : Kitap', '💻 pc : Bilgisayar', '🐱 h : Kedi', '📱 tel : AkilliTelefon', '🔷 s : Kare']

export function Home() {
  const s = useProgress()
  const [name, setName] = useState(s.name)
  const xp = totalXp(s)
  const rank = rankOf(xp)
  const done = Object.keys(s.levels).length
  const next = nextLevelId(s)
  const stars = Object.values(s.levels).reduce((a, l) => a + l.stars, 0)

  const start = () => {
    if (name.trim()) progress.setName(name.trim())
    go(next ? `/seviye/${next}` : '/harita')
  }

  return (
    <>
      <section className="hero">
        <div>
          <div className="chip" style={{ marginBottom: 12 }}>MEB 11. Sınıf · Nesne Tabanlı Programlama · C#</div>
          <h1>
            <span>Nesne Atölyesi</span>'ne hoş geldin!
          </h1>
          <p className="lead">
            Sınıf planları çiz, nesneler üret, kalıtım ağaçları kur ve veri tabanına bağlan. Her görevde yazdığın C# kodu Türkçe hata mesajları veren
            atölye derleyicisi tarafından anında denetlenir.
          </p>
          <div className="panel factory" aria-hidden="true">
            <CodeView code={'Televizyon tv = new Televizyon();\ntv.KanalDegistir(7);'} numbers={false} />
            <div style={{ overflow: 'hidden' }}>
              <div className="belt">
                {[...BELT, ...BELT].map((b, i) => (
                  <span className="obj" key={i}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="panel hero-card">
          <h2>{s.name ? `Tekrar hoş geldin, ${s.name}!` : 'Atölyeye giriş kartı'}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {rank.icon} Unvanın: <b>{rank.title}</b> · {xp} XP
          </p>
          <label htmlFor="ad" style={{ display: 'block', marginTop: 14, fontWeight: 800 }}>
            Mühendis adın
          </label>
          <input id="ad" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adını yaz" maxLength={30} onKeyDown={(e) => e.key === 'Enter' && start()} />
          <button className="btn primary" style={{ width: '100%' }} onClick={start}>
            {done === 0 ? '🚀 Maceraya Başla' : next ? '▶ Kaldığın Yerden Devam Et' : '🗺️ Haritaya Git'}
          </button>
          <button className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => go('/harita')}>
            🗺️ Bölüm haritası
          </button>
        </div>
      </section>

      <section className="stats">
        <div className="panel stat">
          <b>{done}/{ALL_LEVELS.length}</b>
          <span>Tamamlanan seviye</span>
        </div>
        <div className="panel stat">
          <b>⭐ {stars}</b>
          <span>Toplanan yıldız</span>
        </div>
        <div className="panel stat">
          <b>🏅 {earnedBadges(s).length}</b>
          <span>Kazanılan rozet</span>
        </div>
        <div className="panel stat">
          <b>{CHAPTERS.length}</b>
          <span>Bölüm · 6 öğrenme birimi</span>
        </div>
      </section>

      <section>
        <h2>Neler öğreneceksin?</h2>
        <div className="badge-grid">
          {CHAPTERS.map((c) => (
            <div key={c.id} className="panel badge" style={{ textAlign: 'left' }}>
              <div className="em" style={{ fontSize: '1.8rem' }}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.subtitle}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
