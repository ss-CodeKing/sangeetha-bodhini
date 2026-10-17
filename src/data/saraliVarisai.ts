import type { Akshara, Avartanam, KaalamMapping, NotationUnit, SaraliLesson, SwaraId } from '../types/carnatic'
import { arohanam, avarohanam } from './swaras'

// Traditional public-domain exercises; reference edition:
// https://www.shivkumar.org/music/basics/sarali-varisai.pdf (exercises 1–14).
// Lowercase = madhya, uppercase = tara, comma = one unit of sustained sound.
// Phrase dashes in the reference are separators, never extra durations.
// Correct obvious case slips in exercises 3/4 to preserve their scalar contour.
// Editions differ; these are the 14-exercise sequence used by this reference.
const definitions = [
  ['The first ascent', 'Learn the complete scale, then return steadily to Sa.', 's r g m p d n S / S n d p m g r s'],
  ['Returning to Ri', 'Balance repeated two-note phrases in both directions.', 's r s r s r g m / s r g m p d n S / S n S n S n d p / S n d p m g r s'],
  ['Three-note phrases', 'Keep the three-note phrases even across the beat divisions.', 's r g s r g s r / s r g m p d n S / S n d S n d S n / S n d p m g r s'],
  ['Four-note phrases', 'Repeat four-note groups without breaking the talam.', 's r g m s r g m / s r g m p d n S / S n d p S n d p / S n d p m g r s'],
  ['Resting on Pa', 'Sustain Pa and Ma for two units before restarting the phrase.', 's r g m p , s r / s r g m p d n S / S n d p m , S n / S n d p m g r s'],
  ['Extending the phrase', 'Reach Dha in ascent and Ga in descent, then return.', 's r g m p d s r / s r g m p d n S / S n d p m g S n / S n d p m g r s'],
  ['Sustaining Ni and Ri', 'Hold Ni and Ri for two units while keeping a steady count.', 's r g m p d n , / s r g m p d n S / S n d p m g r , / S n d p m g r s'],
  ['Turning phrases', 'Change direction smoothly through Pa–Ma–Ga–Ri and Ma–Pa–Dha–Ni.', 's r g m p m g r / s r g m p d n S / S n d p m p d n / S n d p m g r s'],
  ['Melodic detours', 'Practice the skips Pa–Ma–Dha–Pa and Ma–Pa–Ga–Ma.', 's r g m p m d p / s r g m p d n S / S n d p m p g m / S n d p m g r s'],
  ['A long Pa', 'Sustain Pa across beats and explore the middle register.', 's r g m p , g m / p , , , p , , , / g m p d n d p m / g m p g m g r s'],
  ['Descending landings', 'Alternate sustained notes with short descending phrases.', 'S , n d n , d p / d , p m p , p , / g m p d n d p m / g m p g m g r s'],
  ['Paired notes', 'Articulate repeated Sa, Ni and Dha without changing their pitch.', 'S S n d n n d p / d d p m p , p , / g m p d n d p m / g m p g m g r s'],
  ['Winding pathways', 'Combine directional changes with sustained Ga, Pa and Dha.', 's r g r g , g m / p m p , d p d , / m p d p d n d p / m p d p m g r s'],
  ['Bringing it together', 'Unite held notes, pairs and the upper Sa in a complete exercise.', 's r g m p , p , / d d p , m m p , / d n S , S n d p / S n d p m g r s'],
] as const

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

export const saraliVarisai: readonly SaraliLesson[] = definitions.map(([title, objective, notation], index) => {
  const units = parseNotation(notation)
  const rows = notation.split('/').map(parseNotation)
  const sections = index < 9
    ? [
        { label: 'Ascent phrases', units: rows.slice(0, rows.length / 2).flat() },
        { label: 'Descent phrases', units: rows.slice(rows.length / 2).flat() },
      ]
    : rows.map((row, i) => ({ label: 'Phrase ' + (i + 1), units: row }))
  return {
    number: index + 1, title, objective, notation, units, sections, arohanam, avarohanam,
    kaalams: { 1: mapKaalam(units, 1), 2: mapKaalam(units, 2), 3: mapKaalam(units, 4) },
  }
})

