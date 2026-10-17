import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { arohanam, avarohanam } from '../../data/swaras'
import { Swara } from '../common/Swara'

export function ScaleDirections() {
  return <div className="scale-directions" aria-label="Ascending and descending scale diagrams">
    {[
      { title: 'Arohanam', meaning: 'The ascent', description: 'The swaras of a raga sung in ascending order, from a lower pitch to a higher pitch.', notes: arohanam, ascending: true },
      { title: 'Avarohanam', meaning: 'The descent', description: 'The swaras of a raga sung in descending order, from a higher pitch to a lower pitch.', notes: avarohanam, ascending: false },
    ].map(scale => <figure className="surface scale-card" key={scale.title}>
      <figcaption><div><h3>{scale.title}</h3><span>{scale.meaning}</span></div>{scale.ascending ? <ArrowUpRight size={25} /> : <ArrowDownRight size={25} />}</figcaption>
      <div className="scale-staircase" role="img" aria-label={scale.title + ': ' + (scale.ascending ? 'Sa, Ri one, Ga three, Ma one, Pa, Dha one, Ni three, upper Sa' : 'Upper Sa, Ni three, Dha one, Pa, Ma one, Ga three, Ri one, Sa')}>
        <svg viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true"><polyline points={scale.notes.map((_, i) => (25 + i * 50) + ',' + (scale.ascending ? 142 - i * 15 : 37 + i * 15)).join(' ')} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" /></svg>
        {scale.notes.map((note, i) => <span aria-hidden="true" className="scale-tone" key={i} style={{ bottom: (scale.ascending ? i : 7 - i) * 15 + 5 }}><Swara note={note} /><span className="scale-tone-dot" /></span>)}
      </div>
      <p>{scale.description}</p>
      <small>Mayamalavagowla · a schematic of pitch direction</small>
    </figure>)}
  </div>
}
