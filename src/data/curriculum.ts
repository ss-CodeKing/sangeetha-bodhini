import type { ChapterId, CurriculumChapter } from '../types/carnatic'
import { saraliVarisai } from './saraliVarisai'
import { jantaVarisai } from './jantaVarisai'

export const curriculum: readonly CurriculumChapter[] = [
  { id: 'sarali', number: 1, name: 'Sarali Varisai', lessons: saraliVarisai, source: 'https://www.shivkumar.org/music/basics/sarali-varisai.pdf' },
  { id: 'janta', number: 2, name: 'Janta Varisai', lessons: jantaVarisai, source: 'https://www.shivkumar.org/music/basics/janta-varisai.pdf' },
]

export function getChapter(id: ChapterId): CurriculumChapter {
  const chapter = curriculum.find(item => item.id === id)
  if (!chapter) throw new Error('Unknown curriculum chapter: ' + id)
  return chapter
}
