import { Headphones, Volume2, VolumeX } from 'lucide-react'
import { shrutiKeys } from '../../data/swaras'
import type { CarnaticAudio } from '../../hooks/useCarnaticAudio'

export function ShrutiDrone({ audio, shruti, onShrutiChange, compact = false }: {
  audio: CarnaticAudio; shruti: number; onShrutiChange: (index: number) => void; compact?: boolean
}) {
  const { snapshot, engine } = audio
  return <div className={'shruti-card ' + (compact ? 'compact-drone' : '')}>
    <div className="shruti-symbol"><Headphones size={compact ? 25 : 32} strokeWidth={1.3} /></div>
    <div className="shruti-copy"><h3>{compact ? 'Your pitch anchor' : 'Set your adhara shadjam'}</h3><p>{compact ? 'A steady Sa for your practice.' : 'Choose a comfortable tonic with your teacher.'}</p><span className="drone-notes" title="Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa">P̣ · Ṡ · S <span>Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa</span></span></div>
    <div className="shruti-select"><div className="shruti-key-control"><label htmlFor={compact ? 'studio-shruti' : 'shruti-key'}>{compact ? 'SHRUTI KEY' : 'YOUR MIDDLE SA'}</label><select id={compact ? 'studio-shruti' : 'shruti-key'} value={shruti} onChange={event => onShrutiChange(Number(event.target.value))}>{shrutiKeys.map((key, i) => <option value={i} key={key.label}>{key.label} · {key.hz.toFixed(2)} Hz</option>)}</select></div><div className="shruti-volume"><label htmlFor={compact ? 'studio-shruti-volume' : 'shruti-volume'}>SHRUTI VOLUME <output>{Math.round(snapshot.droneVolume * 100)}%</output></label><input id={compact ? 'studio-shruti-volume' : 'shruti-volume'} type="range" min="0" max="100" step="1" value={Math.round(snapshot.droneVolume * 100)} onChange={event => engine.setDroneVolume(Number(event.target.value) / 100)} /></div><button className={'drone-toggle ' + (snapshot.drone ? 'on' : '')} aria-pressed={snapshot.drone} onClick={() => void engine.setDrone(!snapshot.drone)}>{snapshot.drone ? <Volume2 size={15} /> : <VolumeX size={15} />}{snapshot.drone ? 'Stop shruti box' : 'Start shruti box'}</button></div>
  </div>
}
