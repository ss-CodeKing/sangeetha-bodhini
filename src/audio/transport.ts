import { getChapter } from '../data/curriculum'
import { frequency, swaras } from '../data/swaras'
import type { ChapterId, Kaalam, NotationUnit, SwaraNote } from '../types/carnatic'

export type LoopMode = 'off' | 'lesson' | 'avartanam'
export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'complete'
export interface PlaybackSnapshot {
  status: PlaybackStatus
  chapterId: ChapterId
  lessonNumber: number
  kaalam: Kaalam
  bpm: number
  baseHz: number
  loopMode: LoopMode
  drone: boolean
  unitIndex: number
  position: number
  beat: number
  subdivision: number
  avartanam: number
  beatProgress: number
  note: SwaraNote
  hz: number
  outputLevel: number
  contextState: string
  error: string | null
}

export const notesPerBeat = (kaalam: Kaalam): 1 | 2 | 4 => kaalam === 1 ? 1 : kaalam === 2 ? 2 : 4
export const unitDuration = (bpm: number, kaalam: Kaalam) => 60 / bpm / notesPerBeat(kaalam)
export function lessonUnits(lessonNumber: number, kaalam: Kaalam, chapterId: ChapterId = 'sarali'): readonly NotationUnit[] {
  return getChapter(chapterId).lessons[lessonNumber - 1].kaalams[kaalam].avartanams.flatMap(c => c.beats.flatMap(b => b.units))
}
export function resolveNote(units: readonly NotationUnit[], index: number): SwaraNote {
  for (let i = Math.min(index, units.length - 1); i >= 0; i--) {
    const unit = units[i]
    if (unit.kind === 'note') return unit.note
  }
  throw new Error('A phrase must begin with a swara.')
}
export function noteFrequency(note: SwaraNote, baseHz: number) {
  const position = swaras.find(s => s.names.some(name => name.id === note.swara))
  if (!position) throw new Error('Unknown swara: ' + note.swara)
  return frequency(position.ratio, baseHz, note.octave)
}
export function wrapPosition(position: number, start: number, end: number) {
  return start + ((position - start) % (end - start) + end - start) % (end - start)
}
export function cursorAt(position: number, kaalam: Kaalam, length: number) {
  const perBeat = notesPerBeat(kaalam)
  const unitIndex = Math.min(Math.floor(position + 1e-8), length - 1)
  return {
    unitIndex, position,
    beat: Math.floor(unitIndex / perBeat) % 8 + 1,
    subdivision: unitIndex % perBeat,
    avartanam: Math.floor(unitIndex / (8 * perBeat)) + 1,
    beatProgress: (position / perBeat) % 1,
  }
}

// Sa and its pure fifth, with a soft lower Pa for body.
export const DRONE_NOTES: readonly SwaraNote[] = [
  { swara: 'S', octave: 0 }, { swara: 'P', octave: 0 },
  { swara: 'P', octave: -1 },
]
