import type { CurriculumLesson } from '../types/carnatic'
import { mapKaalam, parseNotation } from './notation'
import { arohanam, avarohanam } from './swaras'

// Teacher-defined chapter order, based on the traditional scalar-window
// patterns in https://www.shivkumar.org/music/basics/janta-varisai.htm.
// Lowercase is madhya; uppercase S is tara Sa. Commas are held subdivisions.
// Every source row is eight units. A 16-unit phrase fills eight aksharas in
// Madhyama Kalam; the same units regroup at first and third kaalam.
const ascending = 's r g m p d n S'.split(' ')
const descending = [...ascending].reverse()
type Step = number | ','
interface Definition {
  label: string
  title: string
  objective: string
  patterns: readonly (readonly Step[])[]
  mode?: 'scale' | 'windows'
}
const pairedRow = [0, 0, 1, 1, 2, 2, 3, 3] as const
const definitions: readonly Definition[] = [
  { label: '1', title: 'Twin notes, up and down', objective: 'Articulate each swara twice, keeping the second attack clear and the pitch steady.', patterns: [pairedRow], mode: 'scale' },
  { label: '2', title: 'Moving janta windows', objective: 'Move four-note pairs step by step through the ascending and descending scale.', patterns: [pairedRow] },
  { label: '3', title: 'Pairs and single notes', objective: 'Balance the 3 + 3 + 2 articulation against an even eight-count cycle.', patterns: [[0, 0, 1, 0, 0, 1, 0, 1], pairedRow] },
  { label: '4', title: 'Pairs with a scalar return', objective: 'Follow two pairs with a single note and a three-note return.', patterns: [[0, 0, 1, 1, 2, 0, 1, 2], pairedRow] },
  { label: '5', title: 'Zigzag pairs', objective: 'Return to the second note of each window before continuing in pairs.', patterns: [[0, 0, 1, 1, 2, 2, 1, 1], pairedRow] },
  { label: '5A', title: 'Reverse symmetric pairs', objective: 'Mirror each forward phrase within its four-note window, then move the window through the octave.', patterns: [[3, 3, 2, 2, 1, 1, 2, 2], [3, 3, 2, 2, 1, 1, 0, 0]] },
  { label: '6', title: 'Holding the second attack', objective: 'Sustain the second attack in each pair without losing the underlying pulse.', patterns: [[0, 0, ',', 1, 1, ',', 2, 2], pairedRow] },
  { label: '7', title: 'Holding before the repeat', objective: 'Hold the first attack, then rearticulate the same pitch before moving onward.', patterns: [[0, ',', 0, 1, ',', 1, 2, 2], pairedRow] },
  { label: '8', title: 'Triple-note groups', objective: 'Fit three attacks, three attacks and a pair into each eight-count phrase.', patterns: [[0, 0, 0, 1, 1, 1, 2, 2], pairedRow] },
  { label: '8A', title: 'Triplets and karvai extension', objective: 'Connect held repetitions, sustained second attacks and triplets in a two-avartanam phrase at second kaalam.', patterns: [
    [0, ',', 0, 1, ',', 1, 2, 2], [0, 0, ',', 1, 1, ',', 2, 2],
    [0, 0, 0, 1, 1, 1, 2, 2], pairedRow,
  ] },
  { label: '9', title: 'Four-note leaps', objective: 'Leap to the fourth note, descend in pairs, then return through the scalar janta phrase.', patterns: [[0, 0, 3, 3, 2, 2, 1, 1], pairedRow] },
  { label: '10', title: 'Long notes and janta returns', objective: 'Hold the first and third pitches, then return to an even paired-note phrase.', patterns: [[0, ',', 1, 2, ',', 0, 1, 2], pairedRow] },
]

export const jantaVarisai: readonly CurriculumLesson[] = definitions.map((definition, index) => {
  const row = (scale: string[], offset: number, pattern: readonly Step[]) =>
    pattern.map(step => step === ',' ? ',' : scale[offset + step]).join(' ')
  const direction = (scale: string[]) => definition.mode === 'scale'
    ? [row(scale, 0, pairedRow), row(scale, 4, pairedRow)]
    // Five four-note windows end at Pa–Dha–Ni–tara Sa without exceeding it.
    : Array.from({ length: 5 }, (_, offset) => definition.patterns.map(pattern => row(scale, offset, pattern))).flat()
  const ascent = direction(ascending)
  const descent = direction(descending)
  const notation = [...ascent, ...descent].join(' / ')
  const units = parseNotation(notation)
  return {
    number: index + 1, label: definition.label, title: definition.title, objective: definition.objective,
    notation, units, arohanam, avarohanam,
    sections: [
      { label: definition.label === '5A' ? 'Ascending windows of reverse phrases' : 'Ascent phrases', units: parseNotation(ascent.join(' / ')) },
      { label: definition.label === '5A' ? 'Descending windows of reverse phrases' : 'Descent phrases', units: parseNotation(descent.join(' / ')) },
    ],
    kaalams: { 1: mapKaalam(units, 1), 2: mapKaalam(units, 2), 3: mapKaalam(units, 4) },
  }
})
