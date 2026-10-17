import { useState } from 'react'
import { frequency } from '../../data/swaras'
import type { Octave, SwaraNote } from '../../types/carnatic'
import { Swara } from '../common/Swara'

const registers: { name: string; octave: Octave; description: string; notation: string }[] = [
  { name: 'Anumandra', octave: -2, description: 'Two octaves below', notation: 'Two dots below' },
  { name: 'Mandra', octave: -1, description: 'Lower octave', notation: 'One dot below' },
  { name: 'Madhya', octave: 0, description: 'Middle octave', notation: 'No dots' },
  { name: 'Tara', octave: 1, description: 'Upper octave', notation: 'One dot above' },
  { name: 'Ati-Tara', octave: 2, description: 'Two octaves above', notation: 'Two dots above' },
]
export function SthayiChart({ baseHz, onAudition }: { baseHz: number; onAudition: (note: SwaraNote) => Promise<void> }) {
  const [selected, setSelected] = useState<Octave>(0)
  return <section id="sthayis" className="theory-section">
    <div className="section-heading"><span className="section-number">04</span><div><p className="eyebrow">THE REGISTER</p><h2>The same swara. A different sky.</h2><p>A sthayi is a pitch register. Every octave upward doubles the frequency.</p></div></div>
    <div className="surface sthayi-panel"><div className="registers">{registers.map(register => <button key={register.name} onClick={() => { setSelected(register.octave); void onAudition({ swara: 'S', octave: register.octave }) }} aria-pressed={selected === register.octave} className={'register ' + (selected === register.octave ? 'selected' : '')}><span className="register-note"><Swara note={{ swara: 'S', octave: register.octave }} /></span><h3>{register.name}</h3><p>{register.description}</p><small>{register.notation}</small><span className="register-frequency">{frequency(1, baseHz, register.octave).toFixed(2)} Hz</span></button>)}</div><p className="register-explanation" aria-live="polite"><strong>{registers.find(r => r.octave === selected)!.name} Sa</strong> is {2 ** selected} × your middle Sa. The dots change the octave; the swara name stays the same.</p></div>
  </section>
}
