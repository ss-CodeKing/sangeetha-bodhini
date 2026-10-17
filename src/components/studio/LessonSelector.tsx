import { saraliVarisai } from '../../data/saraliVarisai'
import type { Kaalam } from '../../types/carnatic'

export function LessonSelector({ selected, kaalam, onSelect }: { selected: number; kaalam: Kaalam; onSelect: (number: number) => void }) {
  return <aside className="surface lesson-selector" aria-label="Sarali Varisai lessons">
    <div className="lesson-selector-heading"><p className="eyebrow">THE CURRICULUM</p><h2>Fourteen small steps.</h2><p>Mayamalavagowla · Adi Talam</p></div>
    <div className="lesson-buttons">{saraliVarisai.map(lesson => <button key={lesson.number} className={'lesson-choice ' + (selected === lesson.number ? 'selected' : '')} aria-label={'Lesson ' + lesson.number + ': ' + lesson.title + ', ' + lesson.kaalams[kaalam].avartanams.length + ' avartanams'} aria-pressed={selected === lesson.number} onClick={() => onSelect(lesson.number)}><span>{String(lesson.number).padStart(2, '0')}</span><span><strong>{lesson.title}</strong><small>{lesson.kaalams[kaalam].avartanams.length} {lesson.kaalams[kaalam].avartanams.length === 1 ? 'avartanam' : 'avartanams'}</small></span></button>)}</div>
  </aside>
}
