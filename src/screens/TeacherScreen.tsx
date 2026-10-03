import { useRef, useState } from 'react'
import { CHAPTERS } from '../content'
import { progress, totalXp, useProgress } from '../engine/progress'

export function TeacherScreen() {
  const s = useProgress()
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const download = () => {
    const blob = new Blob([progress.exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `nesne-atolyesi-${(s.name || 'ogrenci').replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const upload = async (f: File) => {
    try {
      progress.importJson(await f.text())
      setMsg('İlerleme dosyası yüklendi.')
    } catch {
      setMsg('Dosya okunamadı. Geçerli bir ilerleme dosyası seçin.')
    }
  }

  return (
    <div className="settings">
      <h1>⚙️ Ayarlar ve Öğretmen Paneli</h1>
      <div className="panel">
        <h2>Oyun ayarları</h2>
        <label className="switch">
          <input type="checkbox" checked={s.sound} onChange={(e) => progress.setSound(e.target.checked)} />
          🔊 Ses efektleri
        </label>
        <label className="switch" style={{ marginTop: 10 }}>
          <input type="checkbox" checked={s.unlockAll} onChange={(e) => progress.setUnlockAll(e.target.checked)} />
          👩‍🏫 Öğretmen modu: tüm seviyelerin kilidini aç (derste istenen konuya doğrudan geçmek için)
        </label>
      </div>

      <div className="panel">
        <h2>İlerleme raporu — {s.name || 'İsimsiz'}</h2>
        <p className="muted">Toplam {totalXp(s)} XP · {Object.keys(s.levels).length} seviye tamamlandı</p>
        <table className="report">
          <thead>
            <tr>
              <th>Bölüm</th>
              <th>Birim</th>
              <th>Tamamlanan</th>
              <th>Yıldız</th>
            </tr>
          </thead>
          <tbody>
            {CHAPTERS.map((c) => (
              <tr key={c.id}>
                <td>{c.icon} {c.title}</td>
                <td>{c.unit}</td>
                <td>{c.levels.filter((l) => s.levels[l.id]).length}/{c.levels.length}</td>
                <td>⭐ {c.levels.reduce((a, l) => a + (s.levels[l.id]?.stars ?? 0), 0)}/{c.levels.length * 3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>İlerlemeyi kaydet / taşı</h2>
        <p className="muted">
          İlerleme bu tarayıcıda saklanır. Öğrenciler dosyayı indirip öğretmene teslim edebilir veya başka bir bilgisayarda yükleyerek kaldığı yerden devam edebilir.
        </p>
        <div className="row">
          <button className="btn" onClick={download}>⬇ İlerleme dosyasını indir</button>
          <button className="btn" onClick={() => file.current?.click()}>⬆ Dosyadan yükle</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button
            className="btn"
            style={{ borderColor: 'var(--bad)', color: 'var(--bad)' }}
            onClick={() => confirm('Tüm ilerleme silinsin mi? Bu işlem geri alınamaz.') && progress.reset()}
          >
            🗑 İlerlemeyi sıfırla
          </button>
        </div>
        {msg && <p className="feedback ok" style={{ marginTop: 10 }}>{msg}</p>}
      </div>

      <div className="panel">
        <h2>Atölye derleyicisi hakkında</h2>
        <p className="muted" style={{ margin: 0 }}>
          Kod görevleri tarayıcıda çalışan kurallı bir C# denetleyicisi ile kontrol edilir. Denetleyici; sözdizimi hatalarını (eksik ;, kapanmamış parantez),
          erişim belirleyici ihlallerini, kalıtım/arayüz kurallarını, static kullanımını, yapıcı metot uyumsuzluklarını ve basit tür hatalarını Visual Studio'ya benzer
          hata kodlarıyla Türkçe olarak raporlar. Gerçek bir derleyici değildir; programları çalıştırmaz.
        </p>
      </div>
    </div>
  )
}
