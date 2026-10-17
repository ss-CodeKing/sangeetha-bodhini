import type { Akshara, Avartanam, KaalamMapping, NotationUnit, SwaraId } from '../types/carnatic'

const pitch: Record<string, SwaraId> = { s: 'S', r: 'R1', g: 'G3', m: 'M1', p: 'P', d: 'D1', n: 'N3' }
export function parseNotation(notation: string): NotationUnit[] {
  return notation.trim().split(/\s+/).filter(token => token !== '/').map(token => {
    if (token === ',') return { kind: 'hold' }
    const swara = pitch[token.toLowerCase()]
    if (!swara || token.length !== 1) throw new Error('Invalid notation token: ' + token)
    return { kind: 'note', note: { swara, octave: token === token.toUpperCase() ? 1 : 0 } }
  })
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

// Repeat the complete exercise only when needed to finish a full eight-beat cycle.
// No artificial rests or truncation. Holds occupy one subdivision, just like notes.
export function mapKaalam(units: readonly NotationUnit[], notesPerBeat: 1 | 2 | 4): KaalamMapping {
  if (units.length === 0) throw new Error('Cannot map an empty lesson')
  const unitsPerCycle = 8 * notesPerBeat
  const repetitions = unitsPerCycle / gcd(units.length, unitsPerCycle)
  const expanded = Array.from({ length: repetitions }, () => units).flat()
  const avartanams: Avartanam[] = []
  for (let offset = 0; offset < expanded.length; offset += unitsPerCycle) {
    avartanams.push({
      number: avartanams.length + 1,
      beats: Array.from({ length: 8 }, (_, i) => ({
        akshara: (i + 1) as Akshara,
        units: expanded.slice(offset + i * notesPerBeat, offset + (i + 1) * notesPerBeat),
      })),
    })
  }
  return { notesPerBeat, repetitions, avartanams }
}
