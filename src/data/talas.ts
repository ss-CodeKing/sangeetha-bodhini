import type { Kriya, Tala } from '../types/carnatic'

export const kriyas: readonly Kriya[] = [
  { id: 'thattu', name: 'Thattu', tamil: 'தட்டு', english: 'Clap / downward stroke', instruction: 'Bring your open palm gently down onto your thigh or opposite palm.' },
  { id: 'kanishta', name: 'Kanishta', tamil: 'சுண்டு விரல்', english: 'Little finger', instruction: 'After the clap, count by touching the little finger with your thumb.' },
  { id: 'anamika', name: 'Anamika', tamil: 'மோதிர விரல்', english: 'Ring finger', instruction: 'Move your thumb to your ring finger for the third count.' },
  { id: 'madhyama', name: 'Madhyama', tamil: 'நடு விரல்', english: 'Middle finger', instruction: 'Touch your middle finger with your thumb to complete the four-count laghu.' },
  { id: 'veechu', name: 'Veechu', tamil: 'வீச்சு', english: 'Wave / palm upward', instruction: 'Turn your open hand palm upward. The wave occupies one full beat.' },
]
export const adiTalam: Tala = {
  id: 'adi', name: 'Adi Talam', classification: 'Chatusra Jathi Triputa', aksharas: 8,
  angas: [
    { name: 'Laghu', symbol: 'I', beats: [1, 2, 3, 4] },
    { name: 'Dhritham 1', symbol: 'O', beats: [5, 6] },
    { name: 'Dhritham 2', symbol: 'O', beats: [7, 8] },
  ],
  beats: [
    { akshara: 1, kriya: 'thattu' }, { akshara: 2, kriya: 'kanishta' },
    { akshara: 3, kriya: 'anamika' }, { akshara: 4, kriya: 'madhyama' },
    { akshara: 5, kriya: 'thattu' }, { akshara: 6, kriya: 'veechu' },
    { akshara: 7, kriya: 'thattu' }, { akshara: 8, kriya: 'veechu' },
  ],
}

