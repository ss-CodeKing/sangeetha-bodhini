import scores from './alankaraScores.json'
import { createComposition } from './composition'
import { talas } from './talas'

export const alankaraSource = 'https://www.shivkumar.org/music/basics/alankaram.htm'
export const alankaras = scores.map((score, i) => createComposition({
  ...score, number: i + 1, title: talas[score.talaId].name + (i === 7 ? ' · Version 1' : ''),
  objective: 'Keep the tala steady while singing the source ascent and descent in three kaalams.',
  ragaId: 'mayamalavagowla', source: alankaraSource, strictBars: true,
}))
