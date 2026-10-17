import type { CurriculumLesson } from '../types/carnatic'
import { ragas } from './ragas'
import { adiTalam, talas } from './talas'

export const lessonRaga = (lesson: CurriculumLesson) => ragas[lesson.ragaId ?? 'mayamalavagowla']
export const lessonTala = (lesson: CurriculumLesson) => lesson.talaId ? talas[lesson.talaId] : adiTalam
