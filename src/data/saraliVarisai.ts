import type { SaraliLesson } from '../types/carnatic'
import { mapKaalam, parseNotation } from './notation'
export { mapKaalam, parseNotation } from './notation'
import { arohanam, avarohanam } from './swaras'

// Traditional public-domain exercises; reference edition:
// https://www.shivkumar.org/music/basics/sarali-varisai.htm (exercises 1–14).
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

