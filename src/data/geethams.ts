import scores from './geethamScores.json'
import { createComposition } from './composition'
import type { RagaId } from '../types/carnatic'

const metadata: readonly { title: string; ragaId: RagaId; talaId: string; composer: string; composerSource?: string }[] = [
  { title: 'Sri Gananatha (Lambodara)', ragaId: 'malahari', talaId: 'rupaka', composer: 'Purandara Dasa' },
  { title: 'Kunda Goura', ragaId: 'malahari', talaId: 'rupaka', composer: 'Purandara Dasa', composerSource: 'https://www.karnatik.com/c1807.shtml' },
  { title: 'Keraya Neeranu', ragaId: 'malahari', talaId: 'triputa', composer: 'Purandara Dasa' },
  { title: 'Padumanabha', ragaId: 'malahari', talaId: 'triputa', composer: 'Purandara Dasa' },
  { title: 'Analekara', ragaId: 'suddhaSaveri', talaId: 'triputa', composer: 'Not specified in reference' },
  { title: 'Vara Veena', ragaId: 'mohanam', talaId: 'rupaka', composer: 'Appayya Dikshitar', composerSource: 'https://www.karnatik.com/c1734.shtml' },
  { title: 'Kamalajadala', ragaId: 'kalyani', talaId: 'triputa', composer: 'Purandara Dasa', composerSource: 'https://www.karnatik.com/c3550.shtml' },
  { title: 'Re Re Srirama Chandra', ragaId: 'arabhi', talaId: 'triputa', composer: 'Paidala Gurumurti Sastri', composerSource: 'https://karnatik.com/co1118.shtml' },
  { title: 'Sri Ramachandra', ragaId: 'bhairavi', talaId: 'dhruva', composer: 'Purandara Dasa', composerSource: 'https://www.karnatik.com/c3556.shtml' },
]
export const geethamSource = 'https://www.shivkumar.org/music/varnams/lambodara-geetham.htm'
export const geethams = scores.map((score, i) => createComposition({
  ...score, ...metadata[i], number: i + 1,
  objective: 'Sing the written swaras and sahityam together, keeping each karvai within its tala.',
  sourceNotes: [
    'Written notation in source order; parenthesized return cues are not expanded.',
    'Source capitals are madhya, bold capitals are tara, and lowercase notes are mandra. Unmarked registers are retained as printed.',
    'Scale metadata follows the requested modern swara variants; conflicting source-header subscripts are corrected.',
    ...(i === 2 || i === 3 ? ['The source heading says Chathurasra Triputa; its 3 + 2 + 2 notation is retained as Tisra Triputa.'] : []),
    ...(i === 6 ? ['The source labels Misra Chapu (Triputa). This lesson uses the requested Tisra Triputa 3 + 2 + 2 teaching count; the source prints 3 + 4.',
      'Split ma la and naa - for lyric alignment. The dash between D P and M in the final line is a phrase separator, not an extra beat.'] : []),
    ...(i === 8 ? ['Dhruva 4 + 2 + 4 + 4 follows the source and the confirmed tala correction. Both D1 and D2 are explicit.'] : []),
    ...(i === 3 ? ['Split ksha ka over the two final swaras of the Yadukulottama line.'] : []),
    ...(i === 4 ? ['Split sthra pu across D and P in the shastrapurana phrase.'] : []),
    ...(i === 5 ? ['Split nchi tha across D and literal S in the vanchitha phrase.'] : []),
  ],
}))
