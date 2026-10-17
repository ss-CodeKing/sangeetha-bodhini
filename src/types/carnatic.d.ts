export type SwaraId = 'S' | 'R1' | 'R2' | 'R3' | 'G1' | 'G2' | 'G3' | 'M1' | 'M2' | 'P' | 'D1' | 'D2' | 'D3' | 'N1' | 'N2' | 'N3'
export type Octave = -2 | -1 | 0 | 1 | 2
export type Kaalam = 1 | 2 | 3
export type ChapterId = 'sarali' | 'janta' | 'melsthayi' | 'dhatu'
export type Akshara = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type KriyaId = 'thattu' | 'kanishta' | 'anamika' | 'madhyama' | 'veechu'
export interface SwaraName { id: SwaraId; name: string }
export interface Swarasthana {
  position: number
  names: readonly SwaraName[]
  ratio: number
  ratioLabel: string
  mayamalavagowla: boolean
}
export interface SwaraNote { swara: SwaraId; octave: Octave }
// A hold continues the preceding note, never a rest or a new attack.
export type NotationUnit = { kind: 'note'; note: SwaraNote } | { kind: 'hold' }
export interface BeatMapping { akshara: Akshara; units: readonly NotationUnit[] }
export interface Avartanam { number: number; beats: readonly BeatMapping[] }
export interface KaalamMapping {
  notesPerBeat: 1 | 2 | 4
  repetitions: number
  avartanams: readonly Avartanam[]
}
export interface CurriculumLesson {
  // One-based playback ordinal; the printed curriculum label may include A.
  number: number
  label?: string
  title: string
  objective: string
  sections: readonly { label: string; units: readonly NotationUnit[] }[]
  notation: string
  units: readonly NotationUnit[]
  // Ragam reference scales; mixed exercises 10–14 are not labelled pure ascent/descent.
  arohanam: readonly SwaraNote[]
  avarohanam: readonly SwaraNote[]
  kaalams: Readonly<Record<Kaalam, KaalamMapping>>
}
export type SaraliLesson = CurriculumLesson
export interface CurriculumChapter {
  id: ChapterId
  number: number
  name: string
  lessons: readonly CurriculumLesson[]
  source: string
}
export interface Kriya { id: KriyaId; name: string; tamil: string; english: string; instruction: string }
export interface Tala {
  id: string
  name: string
  classification: string
  aksharas: 8
  angas: readonly { name: string; symbol: string; beats: readonly Akshara[] }[]
  beats: readonly { akshara: Akshara; kriya: KriyaId }[]
}

