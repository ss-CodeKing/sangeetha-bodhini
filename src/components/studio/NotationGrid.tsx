import { useEffect, useMemo, useRef } from 'react'
import { getChapter } from '../../data/curriculum'
import { formatSwara } from '../../data/swaras'
import { notesPerBeat } from '../../audio/transport'
import type { PlaybackSnapshot } from '../../audio/transport'
import { Swara } from '../common/Swara'

export function NotationGrid({ snapshot, onSeek }: { snapshot: PlaybackSnapshot; onSeek: (index: number) => void }) {
  const mapping = useMemo(() => getChapter(snapshot.chapterId).lessons[snapshot.lessonNumber - 1].kaalams[snapshot.kaalam], [snapshot.chapterId, snapshot.lessonNumber, snapshot.kaalam])
  const activeRow = useRef<HTMLDivElement>(null)
  const scrollArea = useRef<HTMLDivElement>(null)
  const playing = snapshot.status === 'playing'
  useEffect(() => {
    scrollArea.current?.scrollTo({ left: 0, top: 0, behavior: 'instant' })
  }, [snapshot.chapterId, snapshot.lessonNumber])
  useEffect(() => {
    const container = scrollArea.current
    const row = activeRow.current
    const note = row?.querySelector<HTMLElement>('[data-active="true"]')
    if (!playing || !container || !row || !note) return
    // Follow within the score, never scroll the whole page away from controls.
    const box = container.getBoundingClientRect()
    const noteBox = note.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    let left = container.scrollLeft, top = container.scrollTop
    if (noteBox.left < box.left) left += noteBox.left - box.left - 10
    if (noteBox.right > box.right) left += noteBox.right - box.right + 10
    if (rowBox.top < box.top) top += rowBox.top - box.top - 5
    if (rowBox.bottom > box.bottom) top += rowBox.bottom - box.bottom + 5
    container.scrollTo({ left, top, behavior: 'instant' })
  }, [snapshot.unitIndex, playing])
  const perBeat = notesPerBeat(snapshot.kaalam)
  return <section className="surface score-panel" aria-label="Lesson notation">
    <div className="score-heading"><div><h3>Follow the swaras</h3><p>Click any swara to begin there. A comma holds the preceding note.</p></div><span>{mapping.avartanams.length} {mapping.avartanams.length === 1 ? 'AVARTANAM' : 'AVARTANAMS'}</span></div>
    {mapping.repetitions > 1 && <p className="score-repeat">The exercise repeats {mapping.repetitions} times to complete an eight-beat cycle at this speed.</p>}
    <div className="score-scroll" ref={scrollArea}><div className={'score-grid density-' + perBeat}><div className="score-angas"><span>Laghu · I</span><span>Dhritham · O</span><span>Dhritham · O</span></div><div className="score-counts">{[1,2,3,4,5,6,7,8].map(beat => <span key={beat}>BEAT {beat}</span>)}</div>
      {mapping.avartanams.map(cycle => <div className={'notation-cycle ' + (snapshot.avartanam === cycle.number ? 'current-cycle' : '')} key={cycle.number} ref={snapshot.avartanam === cycle.number ? activeRow : undefined} data-avartanam={cycle.number}><div className="cycle-label">AVARTANAM {cycle.number}</div><div className="notation-row">{cycle.beats.map(beat => <div className={'notation-beat ' + (snapshot.avartanam === cycle.number && snapshot.beat === beat.akshara ? 'current-beat' : '')} key={beat.akshara}>{beat.units.map((unit, subdivision) => {
        const index = (cycle.number - 1) * 8 * perBeat + (beat.akshara - 1) * perBeat + subdivision
        const active = snapshot.unitIndex === index
        return <button className={'notation-note ' + (active ? 'active-note ' : '') + (active && playing ? 'sounding-note' : '')} key={subdivision} aria-current={active ? 'step' : undefined} aria-label={'Avartanam ' + cycle.number + ', beat ' + beat.akshara + ', subdivision ' + (subdivision + 1) + ': ' + (unit.kind === 'hold' ? 'hold preceding swara' : formatSwara(unit.note))} onClick={() => onSeek(index)} data-unit-index={index} data-active={active ? 'true' : 'false'}>{unit.kind === 'hold' ? <span className="hold-symbol" aria-hidden="true">,</span> : <Swara note={unit.note} />}</button>
      })}</div>)}</div></div>)}
    </div></div><div className="score-legend"><span><i /> Active swara</span><span><strong>,</strong> Karvai · sustain</span><span>Dots above / below mark the register</span></div>
  </section>
}
