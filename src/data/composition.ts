import type { CurriculumLesson, Kaalam, NotationUnit, RagaId, SwaraId } from '../types/carnatic'
import { mapKaalam } from './notation'
import { ragas } from './ragas'
import { talas } from './talas'

// The source's Word bold capitals have already been normalized to upper case.
// A trailing dot means mandra; explicit variants keep Bhairavi's two Dhas distinct.
export function parseRagaNotation(text: string, ragaId: RagaId): NotationUnit[] {
  return text.replace(/\|/g, ' ').trim().split(/\s+/).flatMap(token => {
    if ([',', '-', '_'].includes(token)) return [{ kind: 'hold' } as NotationUnit]
    if (token === ';') return [{ kind: 'hold' }, { kind: 'hold' }] as NotationUnit[]
    const match = token.match(/^([srgmpdnSRGMPDN])([123])?(\.)?$/)
    if (!match) throw new Error('Invalid composition token: ' + token)
    const [, letter, variant, lower] = match
    const swara = variant ? (letter.toUpperCase() + variant) as SwaraId : ragas[ragaId].pitches[letter.toLowerCase()]
    if (!swara || !(swara in swaraSet)) throw new Error('Pitch is not defined: ' + token)
    if (!Object.values(ragas[ragaId].pitches).includes(swara) &&
      ![...ragas[ragaId].arohanam, ...ragas[ragaId].avarohanam].some(n => n.swara === swara)) {
      throw new Error('Pitch outside ragam: ' + token)
    }
    return [{ kind: 'note', note: { swara, octave: lower ? -1 : letter === letter.toUpperCase() ? 1 : 0 } } as NotationUnit]
  })
}
const swaraSet = Object.fromEntries(['S','R1','R2','R3','G1','G2','G3','M1','M2','P','D1','D2','D3','N1','N2','N3'].map(s => [s, true]))

export function parseTalaRow(row: string, talaId: string, ragaId: RagaId = 'mayamalavagowla') {
  const tala = talas[talaId]
  if (!tala || !row.trim().endsWith('||')) throw new Error('Expected a known tala and closing double bar')
  const groups = row.trim().replace(/\|\|$/, '').split('|').map(group => parseRagaNotation(group, ragaId))
  if (groups.length !== tala.angas.length || groups.some((g, i) => g.length !== tala.angas[i].beats.length)) {
    throw new Error('Source row must match ' + tala.name + ': ' + tala.classification)
  }
  return groups.flat()
}

interface CompositionDefinition {
  number: number
  title: string
  objective: string
  ragaId: RagaId
  talaId: string
  source: string
  composer?: string
  composerSource?: string
  sourceNotes?: readonly string[]
  rows: readonly string[]
  sahityam?: readonly string[]
  strictBars?: boolean
}
export function createComposition(definition: CompositionDefinition): CurriculumLesson {
  const raga = ragas[definition.ragaId]
  const tala = talas[definition.talaId]
  const units = definition.rows.flatMap(row => definition.strictBars
    ? parseTalaRow(row, tala.id, raga.id) : parseRagaNotation(row, raga.id))
  if (!units.length || units[0].kind !== 'note' || units.length % tala.aksharas) throw new Error('Incomplete composition cycle: ' + definition.title)
  if (definition.sahityam && definition.sahityam.length !== units.length) throw new Error('Sahityam must align with every source unit: ' + definition.title)
  const split = definition.strictBars ? units.length / 2 : units.length
  return {
    ...definition, notation: definition.rows.join('\n'), units,
    arohanam: raga.arohanam, avarohanam: raga.avarohanam,
    sections: definition.strictBars
      ? [{ label: 'Arohanam', units: units.slice(0, split) }, { label: 'Avarohanam', units: units.slice(split) }]
      : [{ label: 'Swara and sahityam', units }],
    kaalams: Object.fromEntries(([1,2,3] as Kaalam[]).map(kaalam =>
      [kaalam, mapKaalam(units, kaalam === 1 ? 1 : kaalam === 2 ? 2 : 4, tala.aksharas)])) as CurriculumLesson['kaalams'],
  }
}
