import { curriculum, getChapter } from '../../data/curriculum'
import type { ChapterId, Kaalam } from '../../types/carnatic'

export function LessonSelector({ chapterId, onChapterChange, selected, kaalam, onSelect }: {
  chapterId: ChapterId; onChapterChange: (id: ChapterId) => void
  selected: number; kaalam: Kaalam; onSelect: (number: number) => void
}) {
  const chapter = getChapter(chapterId)
  return <aside className="surface lesson-selector" aria-label={chapter.name + ' lessons'}>
    <div className="lesson-selector-heading"><label className="eyebrow" htmlFor="curriculum-chapter">THE CURRICULUM</label>
      <select id="curriculum-chapter" value={chapterId} onChange={event => onChapterChange(event.target.value as ChapterId)}>{curriculum.map(item => <option key={item.id} value={item.id}>Chapter {item.number}: {item.name} ({item.lessons.length})</option>)}</select>
      <h2>{chapter.lessons.length} small steps.</h2><p>Mayamalavagowla · Adi Talam</p>
      {chapterId === 'janta' && <p>Sing each pair with a clear second attack. Learn sphurita articulation with your teacher.</p>}
      <a href={chapter.source} target="_blank" rel="noreferrer">Chapter notation reference ↗</a>
    </div>
    <div className="lesson-buttons">{chapter.lessons.map(lesson => <button key={lesson.number} className={'lesson-choice ' + (selected === lesson.number ? 'selected' : '')} aria-label={'Lesson ' + (lesson.label ?? lesson.number) + ': ' + lesson.title + ', ' + lesson.kaalams[kaalam].avartanams.length + (lesson.kaalams[kaalam].avartanams.length === 1 ? ' avartanam' : ' avartanams')} aria-pressed={selected === lesson.number} onClick={() => onSelect(lesson.number)}><span>{(lesson.label ?? String(lesson.number)).padStart(2, '0')}</span><span><strong>{lesson.title}</strong><small>{lesson.kaalams[kaalam].avartanams.length} {lesson.kaalams[kaalam].avartanams.length === 1 ? 'avartanam' : 'avartanams'}</small></span></button>)}</div>
  </aside>
}
