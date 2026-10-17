import { createTextbookLesson } from './textbook'

export const dhatuSource = 'https://www.shivkumar.org/music/basics/dhatu-varisai.htm'

// Exact source rows fetched on 2026-10-17, retaining both printed
// directions and all 4 | 2 | 2 akshara divisions. No generated variations.
const definitions = [
  {
    number: 1, title: 'Single skips and zigzag returns',
    objective: 'Practice the printed Sa–Ma jumps and zigzag responses in both directions.',
    rows: [
      's m g m | r g | s r ||',
      's g r g | s r | g m ||',
      'r p m p | g m | r g ||',
      'r m g m | r g | m p ||',
      'g d p d | m p | g m ||',
      'g p m p | g m | p d ||',
      'm n d n | p d | m p ||',
      'm d p d | m p | d n ||',
      'p S n S | d n | p d ||',
      'p n d n | p d | n S ||',
      'S p d p | n d | S n ||',
      'S d n d | S n | d p ||',
      'n m p m | d p | n d ||',
      'n p d p | n d | p m ||',
      'd g m g | p m | d p ||',
      'd m p m | d p | m g ||',
      'p r g r | m g | p m ||',
      'p g m g | p m | g r ||',
      'm s r s | g r | m g ||',
      'm r g r | m g | r s ||',
    ],
  },
  {
    number: 2, title: 'Alternating steps and skips',
    objective: 'Alternate adjacent steps and skips before each four-note scalar return.',
    rows: [
      's r s g | r g | r m ||',
      's m g r | s r | g m ||',
      'r g r m | g m | g p ||',
      'r p m g | r g | m p ||',
      'g m g p | m p | m d ||',
      'g d p m | g m | p d ||',
      'm p m d | p d | p n ||',
      'm n d p | m p | d n ||',
      'p d p n | d n | d S ||',
      'p S n d | p d | n S ||',
      'S n S d | n d | n p ||',
      'S p d n | S n | d p ||',
      'n d n p | d p | d m ||',
      'n m p d | n d | p m ||',
      'd p d m | p m | p g ||',
      'd g m p | d p | m g ||',
      'p m p g | m g | m r ||',
      'p r g m | p m | g r ||',
      'm g m r | g r | g s ||',
      'm s r g | m g | r s ||',
    ],
  },
] as const

export const dhatuVarisai = definitions.map(definition => createTextbookLesson({
  ...definition,
  sections: [
    { label: 'Arohanam phrases', rowCount: 10 },
    { label: 'Avarohanam phrases', rowCount: 10 },
  ],
}))
