import { Pause, Play, Repeat2, RotateCcw } from 'lucide-react'
import type { CarnaticAudio } from '../../hooks/useCarnaticAudio'
import type { Kaalam } from '../../types/carnatic'

export function AudioControls({ audio }: { audio: CarnaticAudio }) {
  const { snapshot, engine } = audio
  const playing = snapshot.status === 'playing'
  return <div className="audio-controls">
    <div className="transport-buttons"><button className="primary-button play-button" disabled={snapshot.status === 'loading'} onClick={() => playing ? engine.pause() : void engine.play()}>{playing ? <Pause size={17} /> : <Play size={17} />}{snapshot.status === 'loading' ? 'Starting…' : playing ? 'Pause' : snapshot.status === 'paused' ? 'Resume' : snapshot.status === 'complete' ? 'Play again' : 'Play'}</button><button className="outline-button" onClick={engine.reset}><RotateCcw size={15} /> Reset</button></div>
    <fieldset className="speed-control"><legend>Kaalam · notes per beat</legend>{([1, 2, 3] as Kaalam[]).map((kaalam, i) => <button key={kaalam} aria-label={['Prathama kaalam', 'Dwithiya kaalam', 'Thrithiya kaalam'][i]} aria-pressed={snapshot.kaalam === kaalam} className={snapshot.kaalam === kaalam ? 'selected' : ''} onClick={() => engine.configure({ kaalam })}>{['Prathama', 'Dwithiya', 'Thrithiya'][i]}<span>{'kaalam'}</span></button>)}</fieldset>
    <div className="tempo-control"><label htmlFor="tempo">Talam tempo <strong>{snapshot.bpm} BPM</strong></label><input id="tempo" type="range" min="45" max="90" step="1" value={snapshot.bpm} onChange={event => engine.configure({ bpm: Number(event.target.value) })} /><div><span>45</span><span>90</span></div></div>
    <div className="loop-control"><button aria-pressed={snapshot.loopMode !== 'off'} className={'loop-toggle ' + (snapshot.loopMode !== 'off' ? 'selected' : '')} onClick={() => engine.configure({ loopMode: snapshot.loopMode === 'off' ? 'lesson' : 'off' })}><Repeat2 size={16} /> Loop {snapshot.loopMode === 'off' ? 'off' : 'on'}</button><label className="sr-only" htmlFor="loop-scope">Loop scope</label><select id="loop-scope" aria-label="Loop scope" disabled={snapshot.loopMode === 'off'} value={snapshot.loopMode === 'avartanam' ? 'avartanam' : 'lesson'} onChange={event => engine.configure({ loopMode: event.target.value === 'avartanam' ? 'avartanam' : 'lesson' })}><option value="lesson">Whole lesson</option><option value="avartanam">Current avartanam</option></select></div>
  </div>
}
