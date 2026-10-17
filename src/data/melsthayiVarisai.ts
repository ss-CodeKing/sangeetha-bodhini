import { createTextbookLesson } from './textbook'

export const melsthayiSource = 'https://www.shivkumar.org/music/basics/melsthayi-varisai.htm'

// Exact source rows fetched on 2026-10-17. Uppercase notes are tara;
// commas extend the preceding note. Printed dashes add no time.
const definitions = [
  {
    number: 1, title: 'Touching upper Ri',
    objective: 'Sustain upper Sa for two four-unit attacks, touch upper Ri, and return to middle Sa.',
    rows: [
      's r g m | p d | n S ||',
      'S , , , | S , | , , ||',
      'd n S R | S n | d p ||',
      'S n d p | m g | r s ||',
    ],
  },
  {
    number: 2, title: 'Phrases around upper Ri',
    objective: 'Balance repeated upper Sa and Ri with the printed zigzag return phrases.',
    rows: [
      's r g m | p d | n S ||',
      'S , , , | S , | , , ||',
      'd n S R | S S | R S ||',
      'S R - S n | d p | m p ||',
      'd n S R | S n | d p ||',
      'S n d p | m g | r s ||',
    ],
  },
  {
    number: 3, title: 'Reaching upper Ga',
    objective: 'Extend the range to upper Ga while retaining every upper-Ri phrase and karvai.',
    rows: [
      's r g m | p d | n S ||',
      'S , , , | S , | , , ||',
      'd n S R | G R | S R ||',
      'S R - S n | d p | m p ||',
      'd n S R | S S | R S ||',
      'S R - S n | d p | m p ||',
      'd n S R | S n | d p ||',
      'S n d p | m g | r s ||',
    ],
  },
  {
    number: 4, title: 'Reaching upper Ma',
    objective: 'Reach upper Ma, then retrace the Ga and Ri phrases before descending.',
    rows: [
      's r g m | p d | n S ||',
      'S , , , | S , | , , ||',
      'd n S R | G M | G R ||',
      'S R - S n | d p | m p ||',
      'd n S R | G R | S R ||',
      'S R - S n | d p | m p ||',
      'd n S R | S S | R S ||',
      'S R - S n | d p | m p ||',
      'd n S R | S n | d p ||',
      'S n d p | m g | r s ||',
    ],
  },
  {
    number: 5, title: 'Reaching upper Pa',
    objective: 'Reach upper Pa and descend through each printed upper-register phrase.',
    rows: [
      's r g m | p d | n S ||',
      'S , , , | S , | , , ||',
      'd n S R | G M | P M ||',
      'G R - S n | d p | m p ||',
      'd n S R | G M | G R ||',
      'S R - S n | d p | m p ||',
      'd n S R | G R | S R ||',
      'S R - S n | d p | m p ||',
      'd n S R | S S | R S ||',
      'S R - S n | d p | m p ||',
      'd n S R | S n | d p ||',
      'S n d p | m g | r s ||',
    ],
  },
] as const

export const melsthayiVarisai = definitions.map(definition => createTextbookLesson({
  ...definition,
  sections: [
    { label: 'Arohanam', rowCount: 1 },
    { label: 'Tara Sa karvai', rowCount: 1 },
    { label: 'Upper-register phrases', rowCount: definition.rows.length - 3 },
    { label: 'Avarohanam', rowCount: 1 },
  ],
}))
