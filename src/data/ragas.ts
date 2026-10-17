import type { Raga, RagaId, SwaraId, SwaraNote } from '../types/carnatic'
import { swaras } from './swaras'

export const swaraRatios = Object.fromEntries(swaras.flatMap(position =>
  position.names.map(name => [name.id, position.ratio]))) as Record<SwaraId, number>

function scale(ids: readonly SwaraId[], descending = false): readonly SwaraNote[] {
  return ids.map((swara, i) => ({ swara, octave: (descending ? i === 0 : i === ids.length - 1) && swara === 'S' ? 1 : 0 }))
}
function raga(id: RagaId, name: string, ascent: SwaraId[], descent = [...ascent].reverse()): Raga {
  return { id, name, arohanam: scale(ascent), avarohanam: scale(descent, true),
    pitches: Object.fromEntries([...ascent, ...descent].map(s => [s[0].toLowerCase(), s])) as Raga['pitches'] }
}
export const ragas: Record<RagaId, Raga> = {
  mayamalavagowla: raga('mayamalavagowla', 'Mayamalavagowla', ['S','R1','G3','M1','P','D1','N3','S']),
  malahari: raga('malahari', 'Malahari', ['S','R1','M1','P','D1','S'], ['S','D1','P','M1','G3','R1','S']),
  mohanam: raga('mohanam', 'Mohanam', ['S','R2','G3','P','D2','S']),
  suddhaSaveri: raga('suddhaSaveri', 'Suddha Saveri', ['S','R2','M1','P','D2','S']),
  kalyani: raga('kalyani', 'Kalyani', ['S','R2','G3','M2','P','D2','N3','S']),
  arabhi: raga('arabhi', 'Arabhi', ['S','R2','M1','P','D2','S'], ['S','N3','D2','P','M1','G3','R2','S']),
  // Bhashanga Dha is explicit per note (d1 / d2), never inferred from direction.
  bhairavi: raga('bhairavi', 'Bhairavi', ['S','G2','R2','G2','M1','P','D2','S'], ['S','N2','D1','P','M1','G2','R2','S']),
}
