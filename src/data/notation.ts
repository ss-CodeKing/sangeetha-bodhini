import type { Akshara, Avartanam, KaalamMapping, NotationUnit, SwaraId } from '../types/carnatic'

const pitch: Record<string, SwaraId> = { s: 'S', r: 'R1', g: 'G3', m: 'M1', p: 'P', d: 'D1', n: 'N3' }
export function parseNotation(notation: string): NotationUnit[] {
  return notation.trim().split(/\s+/).filter(token => !['/', '|', '||', '-'].includes(token)).map(token => {
    if (token === ',') return { kind: 'hold' }
    const swara = pitch[token.toLowerCase()]
    if (!swara || token.length !== 1) throw new Error('Invalid notation token: ' + token)
    return { kind: 'note', note: { swara, octave: token === token.toUpperCase() ? 1 : 0 } }
  })
}

// Textbook bars delimit Adi's 4 + 2 + 2 units at first kaalam; a phrase dash
// separates notes without adding duration. Reject incomplete or shifted rows.
export function parseAdiRow(row: string): NotationUnit[] {
  const match = row.trim().match(/^([^|]+)\|([^|]+)\|([^|]+)\|\|$/)
  if (!match) throw new Error('Expected an Adi row with 4 | 2 | 2 || grouping')
  const groups = match.slice(1).map(parseNotation)
  if (groups.some((group, index) => group.length !== [4, 2, 2][index])) {
    throw new Error('Adi row must contain 4 | 2 | 2 notation units')
  }
  const units = groups.flat()
  if (units[0].kind !== 'note') throw new Error('Textbook rows must start with a swara')
  return units
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

// Repeat the complete exercise only when needed to finish a full tala cycle.
// No artificial rests or truncation. Holds occupy one subdivision, just like notes.
export function mapKaalam(units: readonly NotationUnit[], notesPerBeat: 1 | 2 | 4, aksharas = 8): KaalamMapping {
  if (units.length === 0) throw new Error('Cannot map an empty lesson')
  if (!Number.isInteger(aksharas) || aksharas < 1) throw new Error('Invalid cycle length')
  const unitsPerCycle = aksharas * notesPerBeat
  const repetitions = unitsPerCycle / gcd(units.length, unitsPerCycle)
  const expanded = Array.from({ length: repetitions }, () => units).flat()
  const avartanams: Avartanam[] = []
  for (let offset = 0; offset < expanded.length; offset += unitsPerCycle) {
    avartanams.push({
      number: avartanams.length + 1,
      beats: Array.from({ length: aksharas }, (_, i) => ({
        akshara: (i + 1) as Akshara,
        units: expanded.slice(offset + i * notesPerBeat, offset + (i + 1) * notesPerBeat),
      })),
    })
  }
  return { notesPerBeat, repetitions, avartanams }
}
