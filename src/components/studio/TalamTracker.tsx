import { motion, useReducedMotion } from 'framer-motion'
import { kriyas } from '../../data/talas'
import { useTalamTimer } from '../../hooks/useTalamTimer'
import type { PlaybackSnapshot } from '../../audio/transport'
import { Gesture } from '../theory/Gesture'
import { Swara } from '../common/Swara'

export function TalamTracker({ snapshot }: { snapshot: PlaybackSnapshot }) {
  const talam = useTalamTimer(snapshot)
  const angaColumns = { gridTemplateColumns: talam.tala.angas.map(a => a.beats.length + 'fr').join(' ') }
  const reduced = useReducedMotion()
  return <section className="surface live-talam" aria-label="Live talam tracker" data-beat={talam.beat} data-subdivision={talam.subdivision}>
    <div className="live-gesture"><motion.div key={talam.beat} initial={false} animate={snapshot.status === 'playing' && !reduced ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 0.18 }}><Gesture kriya={talam.kriya.id} /></motion.div><div><span className="eyebrow">BEAT {talam.beat} OF {talam.tala.aksharas}</span><h3>{talam.kriya.name}</h3><p>{talam.kriya.english}</p></div></div>
    <div className="live-beats"><div className="tracker-angas" style={angaColumns} aria-hidden="true">{talam.tala.angas.map((anga, i) => <span key={i}>{anga.name}</span>)}</div><div className="tracker-beat-row" style={{ gridTemplateColumns: "repeat(" + talam.tala.aksharas + ", 1fr)" }}>{talam.tala.beats.map(beat => <span key={beat.akshara} className={'tracker-count ' + (beat.akshara === talam.beat ? 'selected' : '')} aria-label={'Beat ' + beat.akshara + ': ' + kriyas.find(k => k.id === beat.kriya)!.name} aria-current={beat.akshara === talam.beat ? 'step' : undefined}>{beat.akshara}</span>)}</div><div className="beat-progress"><span style={{ transform: 'scaleX(' + talam.progress + ')' }} /></div><p>{talam.notesPerBeat} {talam.notesPerBeat === 1 ? 'swara' : 'swaras'} per beat · subdivision {talam.subdivision + 1} of {talam.notesPerBeat}</p></div>
    <div className="current-swara"><span className="eyebrow">{snapshot.status === 'complete' ? 'LESSON COMPLETE' : 'CURRENT SWARA'}</span><Swara note={snapshot.note} /><small>{snapshot.hz.toFixed(2)} Hz</small></div>
  </section>
}
