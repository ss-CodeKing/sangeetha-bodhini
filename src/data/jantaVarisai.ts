import type { CurriculumLesson } from '../types/carnatic'
import { mapKaalam, parseNotation } from './notation'
import { arohanam, avarohanam } from './swaras'

// Traditional patterns 1–9 from Shivkumar Kalyanaraman's reference:
// https://www.shivkumar.org/music/basics/janta-varisai.pdf
// Exercise 1's printed ascent is completed by its mirrored descent, also
// shown in the reference's third-speed illustration. Dashes are separators.
// Each template is an eight-unit row, transposed through five scalar windows
// in each direction; every patterned row is followed by a four-note janta row.
const ascending = 's r g m p d n S'.split(' ')
const descending = [...ascending].reverse()
const pairedRow = [0, 0, 1, 1, 2, 2, 3, 3] as const
const definitions = [
  { title: 'Twin notes, up and down', objective: 'Articulate each swara twice, keeping the second attack clear and the pitch steady.', pattern: pairedRow },
  { title: 'Moving janta windows', objective: 'Move four-note pairs step by step through the ascending and descending scale.', pattern: pairedRow },
  { title: 'Zigzag pairs', objective: 'Return to the second note of each window before continuing in pairs.', pattern: [0, 0, 1, 1, 2, 2, 1, 1] },
  { title: 'Pairs and single notes', objective: 'Balance the 3 + 3 + 2 articulation against an even eight-count cycle.', pattern: [0, 0, 1, 0, 0, 1, 0, 1] },
  { title: 'Pairs with a scalar return', objective: 'Follow two pairs with a single note and a three-note return.', pattern: [0, 0, 1, 1, 2, 0, 1, 2] },
  { title: 'Holding the second attack', objective: 'Sustain the second attack in each pair without losing the underlying pulse.', pattern: [0, 0, ',', 1, 1, ',', 2, 2] },
  { title: 'Holding before the repeat', objective: 'Hold the first attack, then rearticulate the same pitch before moving onward.', pattern: [0, ',', 0, 1, ',', 1, 2, 2] },
  { title: 'Triple-note groups', objective: 'Fit three attacks, three attacks and a pair into each eight-count phrase.', pattern: [0, 0, 0, 1, 1, 1, 2, 2] },
  { title: 'Long notes and janta returns', objective: 'Hold the first and third pitches, then return to an even paired-note phrase.', pattern: [0, ',', 1, 2, ',', 0, 1, 2] },
] as const

export const jantaVarisai: readonly CurriculumLesson[] = definitions.map((definition, index) => {
  const row = (scale: string[], offset: number, pattern: readonly (number | ',')[]) =>
    pattern.map(step => step === ',' ? ',' : scale[offset + step]).join(' ')
  const direction = (scale: string[]) => {
    if (index === 0) return [row(scale, 0, pairedRow), row(scale, 4, pairedRow)]
    return Array.from({ length: 5 }, (_, offset) => index === 1
      ? [row(scale, offset, pairedRow)]
      : [row(scale, offset, definition.pattern), row(scale, offset, pairedRow)]).flat()
  }
  const ascent = direction(ascending)
  const descent = direction(descending)
  const notation = [...ascent, ...descent].join(' / ')
  const units = parseNotation(notation)
  return {
    number: index + 1, title: definition.title, objective: definition.objective,
    notation, units, arohanam, avarohanam,
    sections: [
      { label: 'Ascent phrases', units: parseNotation(ascent.join(' / ')) },
      { label: 'Descent phrases', units: parseNotation(descent.join(' / ')) },
    ],
    kaalams: { 1: mapKaalam(units, 1), 2: mapKaalam(units, 2), 3: mapKaalam(units, 4) },
  }
})
