import type { Swarasthana, SwaraNote } from '../types/carnatic'

// Illustrative just intonation, not equal temperament or fixed gamaka targets.
// D1 = 8/5 follows the project specification; some traditions use 128/81.
// Cross-reference: https://kuyil.org/shruti/faq/
export const swaras = [
  { position: 1, names: [{ id: 'S', name: 'Shadjam' }], ratio: 1, ratioLabel: '1/1', mayamalavagowla: true },
  { position: 2, names: [{ id: 'R1', name: 'Suddha Rishabham' }], ratio: 16 / 15, ratioLabel: '16/15', mayamalavagowla: true },
  { position: 3, names: [{ id: 'R2', name: 'Chathusruthi Rishabham' }, { id: 'G1', name: 'Suddha Gandharam' }], ratio: 9 / 8, ratioLabel: '9/8', mayamalavagowla: false },
  { position: 4, names: [{ id: 'R3', name: 'Shatsruthi Rishabham' }, { id: 'G2', name: 'Sadharana Gandharam' }], ratio: 32 / 27, ratioLabel: '32/27', mayamalavagowla: false },
  { position: 5, names: [{ id: 'G3', name: 'Antara Gandharam' }], ratio: 5 / 4, ratioLabel: '5/4', mayamalavagowla: true },
  { position: 6, names: [{ id: 'M1', name: 'Suddha Madhyamam' }], ratio: 4 / 3, ratioLabel: '4/3', mayamalavagowla: true },
  { position: 7, names: [{ id: 'M2', name: 'Prathi Madhyamam' }], ratio: 45 / 32, ratioLabel: '45/32', mayamalavagowla: false },
  { position: 8, names: [{ id: 'P', name: 'Panchamam' }], ratio: 3 / 2, ratioLabel: '3/2', mayamalavagowla: true },
  { position: 9, names: [{ id: 'D1', name: 'Suddha Dhaivatham' }], ratio: 8 / 5, ratioLabel: '8/5', mayamalavagowla: true },
  { position: 10, names: [{ id: 'D2', name: 'Chathusruthi Dhaivatham' }, { id: 'N1', name: 'Suddha Nishadham' }], ratio: 5 / 3, ratioLabel: '5/3', mayamalavagowla: false },
  { position: 11, names: [{ id: 'D3', name: 'Shatsruthi Dhaivatham' }, { id: 'N2', name: 'Kaisiki Nishadham' }], ratio: 16 / 9, ratioLabel: '16/9', mayamalavagowla: false },
  { position: 12, names: [{ id: 'N3', name: 'Kakali Nishadham' }], ratio: 15 / 8, ratioLabel: '15/8', mayamalavagowla: true },
] as const satisfies readonly Swarasthana[]

export const arohanam: readonly SwaraNote[] = [
  { swara: 'S', octave: 0 }, { swara: 'R1', octave: 0 }, { swara: 'G3', octave: 0 },
  { swara: 'M1', octave: 0 }, { swara: 'P', octave: 0 }, { swara: 'D1', octave: 0 },
  { swara: 'N3', octave: 0 }, { swara: 'S', octave: 1 },
]
export const avarohanam = [...arohanam].reverse()
export const shrutiKeys = [
  { label: 'C3', hz: 130.81 }, { label: 'C♯3', hz: 138.59 },
  { label: 'D3', hz: 146.83 }, { label: 'D♯3', hz: 155.56 },
] as const
export function frequency(ratio: number, baseHz: number, octave = 0) {
  return baseHz * ratio * 2 ** octave
}
export function formatSwara(note: SwaraNote): string {
  const [letter, variant = ''] = note.swara
  const dot = note.octave > 0 ? '\u0307' : '\u0323'
  return letter + (note.octave === 0 ? '' : dot.repeat(Math.abs(note.octave))) + variant.replace('1', '₁').replace('2', '₂').replace('3', '₃')
}

