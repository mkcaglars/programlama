import { progress } from './progress'

let ctx: AudioContext | null = null

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  if (!ctx) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(gain, ctx.currentTime + start)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur)
  o.connect(g).connect(ctx.destination)
  o.start(ctx.currentTime + start)
  o.stop(ctx.currentTime + start + dur)
}

function ready(): boolean {
  if (!progress.get().sound) return false
  try {
    ctx ??= new AudioContext()
    return true
  } catch {
    return false
  }
}

export const sfx = {
  ok() {
    if (ready()) {
      tone(660, 0, 0.12, 'triangle')
      tone(880, 0.1, 0.18, 'triangle')
    }
  },
  bad() {
    if (ready()) tone(180, 0, 0.22, 'sawtooth', 0.05)
  },
  win() {
    if (ready()) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, 'triangle'))
  },
  click() {
    if (ready()) tone(440, 0, 0.04, 'square', 0.02)
  },
}
