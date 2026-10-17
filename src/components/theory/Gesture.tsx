import type { KriyaId } from '../../types/carnatic'

// Schematic palm and fingers. The highlighted fingertip identifies the count.
export function Gesture({ kriya }: { kriya: KriyaId }) {
  const finger = kriya === 'kanishta' ? 0 : kriya === 'anamika' ? 1 : kriya === 'madhyama' ? 2 : -1
  return <svg viewBox="0 0 100 105" className={'gesture gesture-' + kriya} aria-hidden="true">
    <path d="M30 91V71C24 65 20 56 16 49C12 41 19 37 24 43L32 53V24C32 16 41 16 41 24V45V13C41 5 51 5 51 13V44V18C51 10 61 10 61 18V46V29C61 21 71 21 71 29V65C71 78 63 83 63 91Z" fill="currentColor" fillOpacity=".07" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    {[{ x: 66, y: 29 }, { x: 56, y: 18 }, { x: 46, y: 13 }].map((point, i) => finger === i && <g key={i}><circle cx={point.x} cy={point.y} r="9" fill="currentColor" fillOpacity=".15" /><circle cx={point.x} cy={point.y} r="4" fill="currentColor" /></g>)}
    {kriya === 'thattu' && <path d="M85 18V48M79 41L85 48L91 41M23 98H73" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />}
    {kriya === 'veechu' && <path d="M12 27C-1 69 77 99 89 58M81 61L89 57L94 67" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />}
  </svg>
}

