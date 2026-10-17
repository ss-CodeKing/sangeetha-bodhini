import { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { adiTalam, kriyas } from '../../data/talas'
import { Gesture } from './Gesture'

export function TalaExplainer() {
  const [beat, setBeat] = useState(0)
  const current = kriyas.find(k => k.id === adiTalam.beats[beat].kriya)!
  return <section id="talam" className="theory-section">
    <div className="section-heading"><span className="section-number">02</span><div><p className="eyebrow">THE RHYTHM</p><h2>Find the pulse. Feel the cycle.</h2><p>Your hand is your first metronome. Follow one eight-beat avartanam.</p></div></div>
    <div className="surface tala-panel"><div className="panel-top"><div><h3>Adi Talam <span className="badge">8 AKSHARAS</span></h3><p>{adiTalam.classification} · one laghu + two dhrithams</p></div><span className="tala-equation">4 + 2 + 2 <span>= 8</span></span></div>
      <div className="angas">{adiTalam.angas.map(anga => <div key={anga.name} style={{ flex: anga.beats.length }}><div className="anga-label">{anga.name} <span>{anga.symbol}</span></div><div className="beat-group">{anga.beats.map(number => {
        const kriya = kriyas.find(k => k.id === adiTalam.beats[number - 1].kriya)!
        return <button className={'beat ' + (beat === number - 1 ? 'selected' : '')} key={number} onClick={() => setBeat(number - 1)} aria-pressed={beat === number - 1} aria-label={'Beat ' + number + ': ' + kriya.name}><span className="beat-number">{number}</span><Gesture kriya={kriya.id} /><strong>{kriya.name}</strong><small>{kriya.id === 'thattu' ? 'Clap' : kriya.id === 'veechu' ? 'Wave' : kriya.english}</small></button>
      })}</div></div>)}</div>
      <div className="gesture-detail"><div className="gesture-description" aria-live="polite"><span className="mini-label">BEAT {beat + 1} OF 8</span><h4>{current.name} <span lang="ta">{current.tamil}</span></h4><p>{current.instruction}</p></div><div className="step-controls"><button className="icon-button" onClick={() => setBeat((beat + 7) % 8)} aria-label="Previous beat"><ArrowLeft size={17} /></button><button className="primary-button" onClick={() => setBeat((beat + 1) % 8)}>Next beat <ArrowRight size={16} /></button><button className="icon-button" onClick={() => setBeat(0)} aria-label="Reset to first beat"><RotateCcw size={16} /></button></div></div>
      <p className="subtle-note">The laghu is one clap + three finger counts. Each dhritham is one clap + one wave. Keep all eight counts equally spaced.</p>
    </div>
  </section>
}

