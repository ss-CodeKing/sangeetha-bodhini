import { swaraRatios } from '../../data/ragas'
import type { NotationUnit, Raga, SwaraNote } from '../../types/carnatic'

// Log-frequency coordinates: an octave always occupies twelve pitch units.
export const pitchLevel = (note: SwaraNote) => 12 * (Math.log2(swaraRatios[note.swara]) + note.octave)

export function contourPitches(units: readonly NotationUnit[]) {
  let pitch = 0
  return units.map(unit => {
    if (unit.kind === 'note') pitch = pitchLevel(unit.note)
    return pitch
  })
}

// Cubic Hermite easing keeps pitch continuous, with zero slope at either end.
const ease = (t: number) => t * t * (3 - 2 * t)
export function contourAt(pitches: readonly number[], units: readonly NotationUnit[], position: number) {
  if (!pitches.length) return 0
  const p = Math.max(0, Math.min(position, pitches.length - 1e-7))
  const index = Math.floor(p)
  const phase = p - index
  const current = pitches[index]
  const previous = pitches[Math.max(0, index - 1)]
  const next = pitches[Math.min(index + 1, pitches.length - 1)]
  let pitch = current
  const shoulder = 0.45
  if (phase < shoulder && index > 0) {
    pitch = previous + (current - previous) * ease((phase + shoulder) / (2 * shoulder))
  } else if (phase > 1 - shoulder && index + 1 < pitches.length) {
    pitch = current + (next - current) * ease((phase - (1 - shoulder)) / (2 * shoulder))
  }
  // Repeated attacks get a small dip; holds breathe without a fresh attack.
  pitch += 0.018 * Math.sin(Math.PI * phase) ** 2
  if (units[index].kind === 'note' && index > 0 && current === previous && phase < 0.45) {
    pitch -= 0.13 * Math.sin(Math.PI * phase / 0.45) ** 2
  }
  return pitch
}

export function pitchRacks(raga: Raga, units: readonly NotationUnit[]) {
  const notes = units.flatMap(unit => unit.kind === 'note' ? [unit.note] : [])
  const low = Math.min(0, ...notes.map(pitchLevel))
  const high = Math.max(12, ...notes.map(pitchLevel))
  const swaras = [...new Set([...raga.arohanam, ...raga.avarohanam].map(note => note.swara))]
  const racks: SwaraNote[] = []
  for (let octave = -2; octave <= 2; octave++) {
    for (const swara of swaras) {
      const note = { swara, octave } as SwaraNote
      const pitch = pitchLevel(note)
      if (pitch >= low - 1e-8 && pitch <= high + 1e-8) racks.push(note)
    }
  }
  // Include explicit lesson pitches as well as both directions of a vakra scale.
  return [...new Map([...racks, ...notes].map(note => [note.swara + ':' + note.octave, note])).values()]
    .sort((a, b) => pitchLevel(a) - pitchLevel(b))
}

export function visibleBeats(width: number, perBeat: number, aksharas: number) {
  return Math.max(2, Math.min(aksharas, Math.floor(Math.max(1, width - 80) / (38 * perBeat))))
}
