import type { ChapterId, CurriculumChapter } from '../types/carnatic'
import { saraliVarisai } from './saraliVarisai'
import { jantaVarisai } from './jantaVarisai'
import { melsthayiSource, melsthayiVarisai } from './melsthayiVarisai'
import { dhatuSource, dhatuVarisai } from './dhatuVarisai'

export const curriculum: readonly CurriculumChapter[] = [
  { id: 'sarali', number: 1, name: 'Sarali Varisai', lessons: saraliVarisai, source: 'https://www.shivkumar.org/music/basics/sarali-varisai.htm' },
  { id: 'janta', number: 2, name: 'Janta Varisai', lessons: jantaVarisai, source: 'https://www.shivkumar.org/music/basics/janta-varisai.htm' },
  { id: 'melsthayi', number: 3, name: 'Melsthayi Varisai', lessons: melsthayiVarisai, source: melsthayiSource },
  { id: 'dhatu', number: 4, name: 'Dhatu Varisai', lessons: dhatuVarisai, source: dhatuSource },
]

export function getChapter(id: ChapterId): CurriculumChapter {
  const chapter = curriculum.find(item => item.id === id)
  if (!chapter) throw new Error('Unknown curriculum chapter: ' + id)
  return chapter
}
