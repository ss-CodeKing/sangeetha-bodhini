import type { Swarasthana, SwaraNote } from '../types/carnatic'

/**
 * A modern 12-position / 16-name teaching subset of 22-shruti just intonation.
 * Ratios are relative to adhara shadjam S = 1/1, not equal-tempered semitones.
 *
 * Primary reference: P. Sambamoorthy, South Indian Music, Book IV, 2nd ed.
 * (1954), ch. V, Table V (scan PDF pp. 8–9):
 * https://anaphoria.com/shruti.pdf
 * Cross-check: Wolfgang von Schweinitz's transcription of that chart and
 * Sambamoorthy's Book V tables: https://www.plainsound.org/pdfs/srutis.pdf
 *
 * Modern aliases below must not be confused with historical shruti names:
 * e.g. Table V calls 5/3 trisruti dhaivata and 27/16 chatussruti dhaivata.
 * This is a selected tuning profile, not a literal Shadja/Madhyama-grama scale
 * or a claim that all ragas/gamakas use a single fixed set of frequencies.
 *
 * Choices: R2/G1 = 9/8 (rather than 10/9); R3/G2 = 6/5 (rather than 32/27);
 * D1 = 8/5 (rather than 128/81); D2/N1 = 5/3 (rather than 27/16);
 * D3/N2 = 9/5 (rather than 16/9). Alternatives are distinct shruti positions.
 * M2 uses 45/32, Sambamoorthy's prati madhyama. The higher 64/45 and
 * 729/512 are chyuta-panchama madhyama variants, not Kakali Nishadham;
 * N3 (Kakali Nishadham) uses 15/8. Tara Sa is 2/1 via octave scaling.
 * See docs/tuning-audit.md for source scope and the complete audit.
 */
export const swaras = [
  { position: 1, names: [{ id: 'S', name: 'Shadjam' }], ratio: 1, ratioLabel: '1/1', mayamalavagowla: true },
  { position: 2, names: [{ id: 'R1', name: 'Suddha Rishabham' }], ratio: 16 / 15, ratioLabel: '16/15', mayamalavagowla: true },
  { position: 3, names: [{ id: 'R2', name: 'Chathusruthi Rishabham' }, { id: 'G1', name: 'Suddha Gandharam' }], ratio: 9 / 8, ratioLabel: '9/8', mayamalavagowla: false },
  { position: 4, names: [{ id: 'R3', name: 'Shatsruthi Rishabham' }, { id: 'G2', name: 'Sadharana Gandharam' }], ratio: 6 / 5, ratioLabel: '6/5', mayamalavagowla: false },
  { position: 5, names: [{ id: 'G3', name: 'Antara Gandharam' }], ratio: 5 / 4, ratioLabel: '5/4', mayamalavagowla: true },
  { position: 6, names: [{ id: 'M1', name: 'Suddha Madhyamam' }], ratio: 4 / 3, ratioLabel: '4/3', mayamalavagowla: true },
  { position: 7, names: [{ id: 'M2', name: 'Prathi Madhyamam' }], ratio: 45 / 32, ratioLabel: '45/32', mayamalavagowla: false },
  { position: 8, names: [{ id: 'P', name: 'Panchamam' }], ratio: 3 / 2, ratioLabel: '3/2', mayamalavagowla: true },
  { position: 9, names: [{ id: 'D1', name: 'Suddha Dhaivatham' }], ratio: 8 / 5, ratioLabel: '8/5', mayamalavagowla: true },
  { position: 10, names: [{ id: 'D2', name: 'Chathusruthi Dhaivatham' }, { id: 'N1', name: 'Suddha Nishadham' }], ratio: 5 / 3, ratioLabel: '5/3', mayamalavagowla: false },
  { position: 11, names: [{ id: 'D3', name: 'Shatsruthi Dhaivatham' }, { id: 'N2', name: 'Kaisiki Nishadham' }], ratio: 9 / 5, ratioLabel: '9/5', mayamalavagowla: false },
  { position: 12, names: [{ id: 'N3', name: 'Kakali Nishadham' }], ratio: 15 / 8, ratioLabel: '15/8', mayamalavagowla: true },
] as const satisfies readonly Swarasthana[]

export const arohanam: readonly SwaraNote[] = [
  { swara: 'S', octave: 0 }, { swara: 'R1', octave: 0 }, { swara: 'G3', octave: 0 },
  { swara: 'M1', octave: 0 }, { swara: 'P', octave: 0 }, { swara: 'D1', octave: 0 },
  { swara: 'N3', octave: 0 }, { swara: 'S', octave: 1 },
]
export const avarohanam = [...arohanam].reverse()
// Western reference anchors only: 12-TET with A4 = 440 Hz, MIDI C3 = 48.
// f(m) = 440 * 2^((m - 69)/12); keep full precision until UI formatting.
// Source: UNSW Music Acoustics, "Note names, MIDI numbers and frequencies":
// https://newt.phys.unsw.edu.au/jw/notes.html
// Choosing an anchor transposes the JI ratios above; it does not temper them.
export const shrutiKeys = [
  'C3', 'C♯3 / D♭3', 'D3', 'D♯3 / E♭3', 'E3', 'F3',
  'F♯3 / G♭3', 'G3', 'G♯3 / A♭3', 'A3', 'A♯3 / B♭3', 'B3',
].map((label, index) => ({ label, hz: 440 * 2 ** ((48 + index - 69) / 12) }))
export const defaultShrutiIndex = 8
// Octave is relative to the selected middle Sa: mandra -1, madhya 0, tara +1.
// Multiply before rounding: f = baseHz * ratio * 2^octave.
export function frequency(ratio: number, baseHz: number, octave = 0) {
  return baseHz * ratio * 2 ** octave
}
export function formatSwara(note: SwaraNote): string {
  const [letter, variant = ''] = note.swara
  const dot = Math.abs(note.octave) === 2 ? (note.octave > 0 ? '\u0308' : '\u0324') : (note.octave > 0 ? '\u0307' : '\u0323')
  return letter + (note.octave === 0 ? '' : dot) + variant.replace('1', '₁').replace('2', '₂').replace('3', '₃')
}
