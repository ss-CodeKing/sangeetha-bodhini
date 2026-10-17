import { useMemo } from 'react'
import { adiTalam, kriyas } from '../data/talas'
import { notesPerBeat } from '../audio/transport'
import type { PlaybackSnapshot } from '../audio/transport'

// Derive the kriya from the same output-clock cursor that highlights the note.
// There is deliberately no independent metronome interval to drift out of sync.
export function useTalamTimer(snapshot: PlaybackSnapshot) {
  return useMemo(() => {
    const beat = adiTalam.beats[snapshot.beat - 1]
    return {
      beat: beat.akshara,
      kriya: kriyas.find(k => k.id === beat.kriya)!,
      progress: snapshot.beatProgress,
      subdivision: snapshot.subdivision,
      notesPerBeat: notesPerBeat(snapshot.kaalam),
      avartanam: snapshot.avartanam,
    }
  }, [snapshot.beat, snapshot.beatProgress, snapshot.subdivision, snapshot.kaalam, snapshot.avartanam])
}
