import { useMemo } from 'react'
import { kriyas } from '../data/talas'
import { getChapter } from '../data/curriculum'
import { lessonTala } from '../data/lessonMetadata'
import { notesPerBeat } from '../audio/transport'
import type { PlaybackSnapshot } from '../audio/transport'

// Audio output time is the only clock for notes, syllables, kriyas and counts.
export function useTalamTimer(snapshot: PlaybackSnapshot) {
  return useMemo(() => {
    const tala = lessonTala(getChapter(snapshot.chapterId).lessons[snapshot.lessonNumber - 1])
    const beat = tala.beats[snapshot.beat - 1]
    return {
      tala, beat: beat.akshara, kriya: kriyas.find(k => k.id === beat.kriya)!,
      progress: snapshot.beatProgress, subdivision: snapshot.subdivision,
      notesPerBeat: notesPerBeat(snapshot.kaalam), avartanam: snapshot.avartanam,
    }
  }, [snapshot.chapterId, snapshot.lessonNumber, snapshot.beat, snapshot.beatProgress, snapshot.subdivision, snapshot.kaalam, snapshot.avartanam])
}
