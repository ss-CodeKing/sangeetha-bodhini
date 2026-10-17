import type { CurriculumLesson } from '../types/carnatic'
import { mapKaalam, parseAdiRow } from './notation'
import { arohanam, avarohanam } from './swaras'

interface TextbookDefinition {
  number: number
  title: string
  objective: string
  rows: readonly string[]
  sections: readonly { label: string; rowCount: number }[]
}

export function createTextbookLesson(definition: TextbookDefinition): CurriculumLesson {
  const rows = definition.rows.map(parseAdiRow)
  const units = rows.flat()
  if (definition.sections.reduce((count, section) => count + section.rowCount, 0) !== rows.length) {
    throw new Error('Textbook sections must cover every source row exactly once')
  }
  let offset = 0
  const sections = definition.sections.map(section => {
    const sectionUnits = rows.slice(offset, offset + section.rowCount).flat()
    offset += section.rowCount
    return { label: section.label, units: sectionUnits }
  })
  return {
    number: definition.number, title: definition.title, objective: definition.objective,
    notation: definition.rows.join('\n'), units, sections, arohanam, avarohanam,
    kaalams: { 1: mapKaalam(units, 1), 2: mapKaalam(units, 2), 3: mapKaalam(units, 4) },
  }
}
