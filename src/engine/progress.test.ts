import { describe, expect, it } from 'vitest'
import { nameFromUrl, storageKey } from './progress'

describe('URL ile isim', () => {
  it('isim parametresini okur ve düzenler', () => {
    expect(nameFromUrl('?isim=Mustafa%20Kemal%20%C3%87a%C4%9Flar')).toBe('Mustafa Kemal Çağlar')
    expect(nameFromUrl('?isim=++Ali+++Can++')).toBe('Ali Can')
    expect(nameFromUrl('?isim=')).toBeNull()
    expect(nameFromUrl('')).toBeNull()
    expect(nameFromUrl('?isim=' + 'a'.repeat(80))?.length).toBe(40)
  })

  it('her öğrenciye ayrı ilerleme anahtarı verir', () => {
    expect(storageKey(null)).toBe('nesne-atolyesi:v1')
    expect(storageKey('Mustafa Kemal Çağlar')).toBe(storageKey('MUSTAFA KEMAL ÇAĞLAR'))
    expect(storageKey('Ali')).not.toBe(storageKey('Ayşe'))
  })
})
