import { Headphones, Volume2, VolumeX } from 'lucide-react'
import { shrutiKeys } from '../../data/swaras'
import type { CarnaticAudio } from '../../hooks/useCarnaticAudio'

export function ShrutiDrone({ audio, shruti, onShrutiChange, compact = false }: {
  audio: CarnaticAudio; shruti: number; onShrutiChange: (index: number) => void; compact?: boolean
}) {
  const { snapshot, engine } = audio
  return <div className={'shruti-card ' + (compact ? 'compact-drone' : '')}>
    <div className="shruti-symbol"><Headphones size={compact ? 25 : 32} strokeWidth={1.3} /></div>
    <div className="shruti-copy"><h3>{compact ? 'Your pitch anchor' : 'Set your adhara shadjam'}</h3><p>{compact ? 'A continuous harmonium-style shruti box to keep your Sa close.' : 'Choose a comfortable tonic with your teacher for your continuous shruti box.'}</p><span className="drone-notes" title="Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa">P̣ · Ṡ · S <span>Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa</span></span></div>
    <div className="shruti-select"><label htmlFor={compact ? 'studio-shruti' : 'shruti-key'}>{compact ? 'SHRUTI KEY' : 'YOUR MIDDLE SA'}</label><select id={compact ? 'studio-shruti' : 'shruti-key'} value={shruti} onChange={event => onShrutiChange(Number(event.target.value))}>{shrutiKeys.map((key, i) => <option value={i} key={key.label}>{key.label} · {key.hz.toFixed(2)} Hz</option>)}</select><button className={'drone-toggle ' + (snapshot.drone ? 'on' : '')} aria-pressed={snapshot.drone} onClick={() => void engine.setDrone(!snapshot.drone)}>{snapshot.drone ? <Volume2 size={15} /> : <VolumeX size={15} />}{snapshot.drone ? 'Stop shruti box' : 'Start shruti box'}</button></div>
  </div>
}
