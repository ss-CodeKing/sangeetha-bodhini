import { getChapter } from '../data/curriculum'
import { frequency } from '../data/swaras'
import type { ChapterId, Kaalam, NotationUnit, SwaraNote } from '../types/carnatic'

import { ragas, swaraRatios } from '../data/ragas'
import type { RagaId } from '../types/carnatic'

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
  droneVolume: number
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
export function noteFrequency(note: SwaraNote, baseHz: number, ragaId?: RagaId) {
  if (ragaId) {
    const raga = ragas[ragaId]
    if (![...raga.arohanam, ...raga.avarohanam].some(n => n.swara === note.swara)) throw new Error('Swara outside active ragam: ' + note.swara)
  }
  const ratio = swaraRatios[note.swara]
  if (!ratio) throw new Error('Unknown swara: ' + note.swara)
  return frequency(ratio, baseHz, note.octave)
}
export function wrapPosition(position: number, start: number, end: number) {
  return start + ((position - start) % (end - start) + end - start) % (end - start)
}
export function cursorAt(position: number, kaalam: Kaalam, length: number, aksharas = 8) {
  const perBeat = notesPerBeat(kaalam)
  const unitIndex = Math.min(Math.floor(position + 1e-8), length - 1)
  return {
    unitIndex, position,
    beat: Math.floor(unitIndex / perBeat) % aksharas + 1,
    subdivision: unitIndex % perBeat,
    avartanam: Math.floor(unitIndex / (aksharas * perBeat)) + 1,
    beatProgress: (position / perBeat) % 1,
  }
}

// Panchama shruti: bass Pa, pure upper Sa, shimmering upper Sa, middle Sa.
// Shared by live playback and offline verification so voicing stays identical.
export const DRONE_VOICES: readonly { note: SwaraNote; detuneCents: number; volume: number }[] = [
  { note: { swara: 'P', octave: -1 }, detuneCents: 0, volume: 0.075 },
  { note: { swara: 'S', octave: 1 }, detuneCents: 0, volume: 0.045 },
  { note: { swara: 'S', octave: 1 }, detuneCents: 3.5, volume: 0.035 },
  { note: { swara: 'S', octave: 0 }, detuneCents: 0, volume: 0.06 },
]
