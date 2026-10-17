import { useEffect, useState, useSyncExternalStore } from 'react'
import { CarnaticAudioEngine } from '../audio/CarnaticAudioEngine'

// Reed synthesis lives in audio/shrutiVoice.ts; this hook owns its lifecycle.
// One shared engine survives Theory/Studio navigation. Context creation/resume
// happens only in explicit user actions (play, drone toggle, swara audition).
export function useCarnaticAudio() {
  const [engine] = useState(() => new CarnaticAudioEngine())
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot)
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) engine.stopAll() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      engine.dispose()
    }
  }, [engine])
  return { engine, snapshot }
}
export type CarnaticAudio = ReturnType<typeof useCarnaticAudio>
