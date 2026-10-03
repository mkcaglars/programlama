/** Konsol çıktısı karşılaştırması için: satır başı/sonu boşlukları ve boş satırlar önemsizdir. */
export const normOutput = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join('\n')
