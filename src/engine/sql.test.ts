import { describe, expect, it } from 'vitest'
import { cloneDb, execute, sameDb, sameResult, SqlError, type Database } from './sql'

const base: Database = {
  ogrenciler: {
    name: 'ogrenciler',
    columns: [
      { name: 'id', type: 'INT', pk: true, autoInc: true },
      { name: 'ad', type: 'VARCHAR(30)' },
      { name: 'sinif', type: 'VARCHAR(5)' },
      { name: 'puan', type: 'INT' },
    ],
    rows: [
      { id: 1, ad: 'Ali', sinif: '11A', puan: 85 },
      { id: 2, ad: 'Ayşe', sinif: '11B', puan: 92 },
      { id: 3, ad: 'Mehmet', sinif: '11A', puan: 70 },
    ],
  },
  siniflar: {
    name: 'siniflar',
    columns: [{ name: 'kod', type: 'VARCHAR(5)', pk: true }, { name: 'ogretmen', type: 'VARCHAR(30)' }],
    rows: [{ kod: '11A', ogretmen: 'Zeynep Hoca' }, { kod: '11B', ogretmen: 'Can Hoca' }],
  },
}

describe('SQL motoru', () => {
  it('SELECT / WHERE / ORDER BY', () => {
    const db = cloneDb(base)
    const [r] = execute(db, "SELECT ad, puan FROM ogrenciler WHERE sinif = '11A' ORDER BY puan DESC")
    expect(r.columns).toEqual(['ad', 'puan'])
    expect(r.rows).toEqual([['Ali', 85], ['Mehmet', 70]])
  })

  it('LIKE, IN, BETWEEN ve toplama fonksiyonları', () => {
    const db = cloneDb(base)
    expect(execute(db, "SELECT ad FROM ogrenciler WHERE ad LIKE 'A%'")[0].rows).toEqual([['Ali'], ['Ayşe']])
    expect(execute(db, 'SELECT COUNT(*) FROM ogrenciler WHERE puan BETWEEN 80 AND 100')[0].rows).toEqual([[2]])
    expect(execute(db, 'SELECT sinif, AVG(puan) AS ort FROM ogrenciler GROUP BY sinif ORDER BY sinif')[0].rows).toEqual([['11A', 77.5], ['11B', 92]])
    expect(execute(db, "SELECT * FROM ogrenciler WHERE id IN (1, 3)")[0].rows.length).toBe(2)
  })

  it('JOIN', () => {
    const db = cloneDb(base)
    const [r] = execute(db, 'SELECT o.ad, s.ogretmen FROM ogrenciler o INNER JOIN siniflar s ON o.sinif = s.kod ORDER BY o.id')
    expect(r.rows[1]).toEqual(['Ayşe', 'Can Hoca'])
  })

  it('INSERT / UPDATE / DELETE', () => {
    const db = cloneDb(base)
    execute(db, "INSERT INTO ogrenciler (ad, sinif, puan) VALUES ('Elif', '11B', 99)")
    expect(db.ogrenciler.rows[3]).toEqual({ id: 4, ad: 'Elif', sinif: '11B', puan: 99 })
    expect(execute(db, "UPDATE ogrenciler SET puan = puan + 5 WHERE sinif = '11A'")[0].affected).toBe(2)
    expect(db.ogrenciler.rows[0].puan).toBe(90)
    expect(execute(db, 'DELETE FROM ogrenciler WHERE puan < 70')[0].affected).toBe(0)
    execute(db, 'DELETE FROM ogrenciler WHERE id = 4')
    expect(db.ogrenciler.rows.length).toBe(3)
  })

  it('CREATE TABLE', () => {
    const db = cloneDb(base)
    execute(db, 'CREATE TABLE kitaplar (id INT PRIMARY KEY AUTO_INCREMENT, ad VARCHAR(50) NOT NULL, sayfa INT)')
    expect(db.kitaplar.columns.map((c) => c.name)).toEqual(['id', 'ad', 'sayfa'])
    execute(db, "INSERT INTO kitaplar (ad, sayfa) VALUES ('Nutuk', 600)")
    expect(db.kitaplar.rows[0].id).toBe(1)
  })

  it('anlaşılır hata mesajları verir', () => {
    const db = cloneDb(base)
    expect(() => execute(db, 'SELECT isim FROM ogrenciler')).toThrow(/Bilinmeyen sütun 'isim'/)
    expect(() => execute(db, 'SELECT * FROM ogrenci')).toThrow(SqlError)
    expect(() => execute(db, "INSERT INTO ogrenciler (ad) VALUES ('a', 'b')")).toThrow(/eşleşmiyor/)
    expect(() => execute(db, 'SELEC * FROM ogrenciler')).toThrow(/1064/)
  })

  it('sonuç ve veritabanı karşılaştırma', () => {
    const a = execute(cloneDb(base), 'SELECT ad FROM ogrenciler ORDER BY ad DESC')[0]
    const b = execute(cloneDb(base), 'SELECT ad FROM ogrenciler')[0]
    expect(sameResult(a, b, false)).toBe(true)
    expect(sameResult(a, b, true)).toBe(false)
    const d1 = cloneDb(base)
    const d2 = cloneDb(base)
    execute(d1, 'DELETE FROM ogrenciler WHERE id = 1')
    execute(d2, "DELETE FROM ogrenciler WHERE ad = 'Ali'")
    expect(sameDb(d1, d2)).toBe(true)
  })
})
