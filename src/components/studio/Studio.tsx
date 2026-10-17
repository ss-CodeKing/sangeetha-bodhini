import { BookOpen, Music2 } from 'lucide-react'
import { saraliVarisai } from '../../data/saraliVarisai'
import type { CarnaticAudio } from '../../hooks/useCarnaticAudio'
import { ShrutiDrone } from '../common/ShrutiDrone'
import { LessonSelector } from './LessonSelector'
import { AudioControls } from './AudioControls'
import { TalamTracker } from './TalamTracker'
import { NotationGrid } from './NotationGrid'
import './studio.css'

export function Studio({ audio, shruti, onShrutiChange, onTheory }: {
  audio: CarnaticAudio; shruti: number; onShrutiChange: (index: number) => void; onTheory: () => void
}) {
  const { engine, snapshot } = audio
  const lesson = saraliVarisai[snapshot.lessonNumber - 1]
  return <section className="studio-page content-width" data-status={snapshot.status} data-unit-index={snapshot.unitIndex} data-context-state={snapshot.contextState} data-frequency={snapshot.hz} data-output-level={snapshot.outputLevel}>
    <div className="studio-introduction"><div><p className="eyebrow"><Music2 size={15} /> THE PRACTICE STUDIO</p><h1>A little practice.<br /><em>A deeper connection.</em></h1><p>Let your voice follow the swaras, and your hand follow the pulse.</p></div><button className="outline-button" onClick={onTheory}><BookOpen size={15} /> Revisit the foundations</button></div>
    <div className="studio-layout"><LessonSelector selected={lesson.number} kaalam={snapshot.kaalam} onSelect={engine.selectLesson} /><div className="studio-workspace"><div className="lesson-heading"><p className="eyebrow">SARALI VARISAI · LESSON {String(lesson.number).padStart(2, '0')}</p><h2>{lesson.title}</h2><p>{lesson.objective}</p><div className="lesson-meta"><span>Mayamalavagowla</span><span>Adi Talam · 4 + 2 + 2</span><span>{['First', 'Second', 'Third'][snapshot.kaalam - 1]} kaalam</span></div></div>
      <TalamTracker snapshot={snapshot} />
      <AudioControls audio={audio} />
      <div className="playback-status" role="status">{snapshot.status === 'playing' ? 'Playing' : snapshot.status === 'paused' ? 'Paused · ready when you are' : snapshot.status === 'complete' ? 'Well practiced. Play again when you are ready.' : snapshot.status === 'loading' ? 'Preparing your sound…' : 'Choose your speed, then press Play.'}<span className="sound-meter" aria-label="Audio output level"><i style={{ transform: 'scaleX(' + Math.min(1, snapshot.outputLevel * 12) + ')' }} /></span></div>
      <NotationGrid snapshot={snapshot} onSeek={engine.seek} />
      <ShrutiDrone audio={audio} shruti={shruti} onShrutiChange={onShrutiChange} compact />
      <p className="studio-help">Pause keeps your place; Reset returns to the beginning. Change kaalam to regroup the current phrase at a new speed. Selecting a lesson stops playback. Audio pauses when you leave this tab.</p>
    </div></div>
  </section>
}
