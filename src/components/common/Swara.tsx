import { formatSwara } from '../../data/swaras'
import type { SwaraNote } from '../../types/carnatic'

export function Swara({ note }: { note: SwaraNote }) {
  return <span className="swara" aria-label={note.swara + ', octave ' + note.octave}>{formatSwara(note)}</span>
}

