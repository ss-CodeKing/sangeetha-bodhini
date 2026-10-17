import { useState } from 'react'
import { ArrowRight, Info, MousePointer2, Volume2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { arohanam, avarohanam, formatSwara, frequency, swaras } from '../../data/swaras'
import { Swara } from '../common/Swara'
import { ScaleDirections } from './ScaleDirections'
import type { SwaraNote } from '../../types/carnatic'

export function SwarasthanaWheel({ baseHz, onAudition }: { baseHz: number; onAudition: (note: SwaraNote) => Promise<void> }) {
  const [selected, setSelected] = useState(0)
  const [ragaOnly, setRagaOnly] = useState(false)
  const reducedMotion = useReducedMotion()
  const current = swaras[selected]
  return <section id="swaras" className="theory-section">
    <div className="section-heading"><span className="section-number">01</span><div><p className="eyebrow">THE MELODY</p><h2>A world within seven notes.</h2><p>Seven swaras. Twelve pitch positions. Sixteen names to express a raga.</p></div></div>
    <div className="surface swara-panel">
      <div className="panel-top"><div><h3>The swarasthana explorer</h3><p>Select a position to discover its names and relative pitch.</p></div><button className={'toggle ' + (ragaOnly ? 'on' : '')} role="switch" aria-checked={ragaOnly} onClick={() => setRagaOnly(!ragaOnly)}><span className="toggle-track"><span /></span> Highlight our raga</button></div>
      <div className="pitch-positions" aria-label="Twelve swarasthanams">
        {swaras.map((swara, i) => <button key={swara.position} aria-pressed={selected === i} aria-label={swara.names.map(n => n.name).join(' / ')} onClick={() => setSelected(i)} className={'pitch-key ' + (selected === i ? 'selected ' : '') + (ragaOnly && !swara.mayamalavagowla ? 'muted ' : '') + (swara.mayamalavagowla ? 'raga-note' : '')}>
          <span className="key-index">{String(swara.position).padStart(2, '0')}</span><span className="key-names">{swara.names.map(name => <Swara key={name.id} note={{ swara: name.id, octave: 0 }} />)}</span><span className="key-dot" />
        </button>)}
      </div>
      <div className="keyboard-caption"><span><span className="legend-dot" /> Mayamalavagowla swaras</span><span><MousePointer2 size={13} /> Select any note to explore</span></div>
      <motion.div key={selected} initial={reducedMotion ? false : { opacity: 0.92 }} animate={{ opacity: 1 }} className="pitch-detail" aria-live="polite">
        <div className="selected-swara">{current.names.map(n => formatSwara({ swara: n.id, octave: 0 })).join(' / ')}</div><div className="note-description"><h4>{current.names.map(n => n.name).join(' / ')}</h4><p>{current.names.length > 1 ? 'One pitch position, two names. The raga determines which name we use.' : current.position === 1 ? 'The tonic. Every other note finds its place in relation to Sa.' : 'A distinct pitch position measured in relation to your chosen Sa.'}</p></div><button className="audition-button" onClick={() => void onAudition({ swara: current.names[0].id, octave: 0 })}><Volume2 size={16} /> Play swara</button><div className="pitch-value"><strong>{frequency(current.ratio, baseHz).toFixed(2)} <small>Hz</small></strong><span>{current.ratioLabel} × your Sa</span></div>
      </motion.div>
      <p className="subtle-note"><Info size={14} /> Ratios are a teaching model; tuning and gamakas vary in performance. Select Play swara to hear the chosen pitch.</p>
    </div>
    <div className="raga-strip"><div><p className="eyebrow">YOUR FIRST RAGA · MELAKARTA 15</p><h3>Mayamalavagowla</h3><p>Traditionally used for the foundational lessons associated with Purandara Dasa.</p></div><div className="scales"><div><span>AROHANAM <ArrowRight size={12} /></span>{arohanam.map((note, i) => <Swara key={i} note={note} />)}</div><div><span>AVAROHANAM <ArrowRight size={12} /></span>{avarohanam.map((note, i) => <Swara key={i} note={note} />)}</div></div></div>
    <ScaleDirections />
  </section>
}
