import type { Kriya, Tala } from '../types/carnatic'

export const kriyas: readonly Kriya[] = [
  { id: 'thattu', name: 'Thattu', tamil: 'தட்டு', english: 'Clap / downward stroke', instruction: 'Bring your open palm gently down onto your thigh or opposite palm.' },
  { id: 'kanishta', name: 'Kanishta', tamil: 'சுண்டு விரல்', english: 'Little finger', instruction: 'After the clap, count by touching the little finger with your thumb.' },
  { id: 'anamika', name: 'Anamika', tamil: 'மோதிர விரல்', english: 'Ring finger', instruction: 'Move your thumb to your ring finger for the third count.' },
  { id: 'madhyama', name: 'Madhyama', tamil: 'நடு விரல்', english: 'Middle finger', instruction: 'Touch your middle finger with your thumb to complete the four-count laghu.' },
  { id: 'tarjani', name: 'Tarjani', tamil: 'ஆள்காட்டி விரல்', english: 'Index finger', instruction: 'Count the index finger, then the thumb for a longer laghu.' },
  { id: 'angushta', name: 'Angushta', tamil: 'கட்டை விரல்', english: 'Thumb', instruction: 'Count the thumb, then return to the little finger for the next count.' },
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


const laghuKriyas = ['thattu', 'kanishta', 'anamika', 'madhyama', 'tarjani', 'angushta', 'kanishta', 'anamika', 'madhyama'] as const

function createTala(id: string, name: string, lengths: number[], symbols: string[]): Tala {
  let offset = 0
  const angas = lengths.map((length, i) => ({
    name: symbols[i] === 'I' ? 'Laghu' : symbols[i] === 'U' ? 'Anudhritham' : 'Dhritham',
    symbol: symbols[i], beats: Array.from({ length }, () => ++offset),
  }))
  return { id, name, classification: lengths.join(' + '), aksharas: offset, angas,
    beats: angas.flatMap(anga => anga.beats.map((akshara, i) => ({
      akshara, kriya: anga.symbol === 'I' ? laghuKriyas[i] : i === 0 ? 'thattu' as const : 'veechu' as const,
    }))) }
}
export const talas: Record<string, Tala> = {
  adi: adiTalam,
  dhruva: createTala('dhruva', 'Chatushra Jaati Dhruva', [4,2,4,4], ['I','O','I','I']),
  matya: createTala('matya', 'Chatushra Jaati Matya', [4,2,4], ['I','O','I']),
  rupaka: createTala('rupaka', 'Chatushra Jaati Rupaka', [2,4], ['O','I']),
  jhampa: createTala('jhampa', 'Mishra Jaati Jhampa', [7,1,2], ['I','U','O']),
  triputa: createTala('triputa', 'Tisra Jaati Triputa', [3,2,2], ['I','O','O']),
  ata: createTala('ata', 'Khanda Jaati Ata', [5,5,2,2], ['I','I','O','O']),
  eka: createTala('eka', 'Chatushra Jaati Eka', [4], ['I']),
  sankeernaEka: createTala('sankeernaEka', 'Sankeerna Jaati Eka', [9], ['I']),
}
