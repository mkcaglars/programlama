
const BITS = ['⭐', '✨', '🎉', '{ }', '🟧', '🟦', '🟪', '✅']

// sözde rastgele ama sabit dağılım
const r = (i: number, k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: r(i, 1) * 100,
  delay: r(i, 2) * 0.6,
  dur: 1.8 + r(i, 3) * 1.6,
  size: 14 + r(i, 4) * 16,
  ch: BITS[i % BITS.length],
}))

export function Confetti() {
  const pieces = PIECES
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, fontSize: p.size }}>
          {p.ch}
        </i>
      ))}
    </div>
  )
}
