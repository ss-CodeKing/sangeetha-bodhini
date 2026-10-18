import { useState } from 'react'
import { Swara } from '../common/Swara'
import { arohanam } from '../../data/swaras'

const speeds = [
  { name: 'Vilamba Kalam', label: 'First speed', count: 1 },
  { name: 'Madhyama Kalam', label: 'Second speed', count: 2 },
  { name: 'Dhurita Kalam', label: 'Third speed', count: 4 },
] as const

export function KaalamExplainer() {
  const [selected, setSelected] = useState<0 | 1 | 2>(0)
  const speed = speeds[selected]
  return <section id="kaalam" className="theory-section">
    <div className="section-heading"><span className="section-number">03</span><div><p className="eyebrow">THE SPEED · KAALAM</p><h2>One steady pulse. Three ways to sing.</h2><p>Kaalam describes how many swaras fit into each beat. The talam keeps the same tempo as the notes become faster.</p></div></div>
    <div className="surface kaalam-panel">
      <div className="kaalam-options" aria-label="Explore three speeds">{speeds.map((item, i) => <button key={item.count} aria-pressed={selected === i} className={'kaalam-option ' + (selected === i ? 'selected' : '')} onClick={() => setSelected(i as 0 | 1 | 2)}><span>{item.label}</span><h3>{item.name}</h3><strong>{item.count} <small>{item.count === 1 ? 'swara' : 'swaras'} / beat</small></strong></button>)}</div>
      <div className="kaalam-demo" aria-live="polite"><div className="kaalam-demo-heading"><h4>{speed.name}: {speed.count} {speed.count === 1 ? 'swara' : 'swaras'} in each beat</h4><span>Example: a steady 60 BPM</span></div>
        <div className="kaalam-beats">{[0, 1, 2, 3].map(beat => <div className="kaalam-beat" key={beat}><span className="kaalam-beat-label">BEAT {beat + 1}</span><div className="kaalam-beat-notes">{Array.from({ length: speed.count }, (_, subdivision) => <Swara key={subdivision} note={arohanam[(beat * speed.count + subdivision) % arohanam.length]} />)}</div><span className="kaalam-duration">1 second</span></div>)}</div>
        <p>At 60 beats per minute, every beat lasts one second: sing {speed.count === 1 ? 'one swara for 1 second' : speed.count === 2 ? 'two swaras for ½ second each' : 'four swaras for ¼ second each'}. Keep the hand movements equally spaced.</p>
      </div>
      <p className="subtle-note">This four-beat illustration repeats the ascending scale as needed. An Adi Talam avartanam still has eight beats at every kaalam.</p>
    </div>
  </section>
}
