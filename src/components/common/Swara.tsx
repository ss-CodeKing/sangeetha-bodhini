import type { SwaraNote } from '../../types/carnatic'

export function Swara({ note }: { note: SwaraNote }) {
  const [letter, variant = ''] = note.swara
  const register = note.octave < 0 ? 'below' : 'above'
  return <span className="swara" aria-label={note.swara + ', octave ' + note.octave}>
    <span className="swara-letter" aria-hidden="true">{letter}{note.octave !== 0 && <span className={'octave-dots ' + register}>{Array.from({ length: Math.abs(note.octave) }, (_, i) => <i key={i} />)}</span>}</span>
    {variant && <sub className="swara-variant" aria-hidden="true">{variant}</sub>}
  </span>
}
