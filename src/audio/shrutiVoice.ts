import type { Voice } from './voice'

// Normalized harmonic amplitudes, shared by two slightly detuned free reeds.
// A prominent octave and fifth sit above the fundamental; odd overtones decay.
export const REED_HARMONICS = [0, 0.46, 0.26, 0.16, 0, 0.065, 0, 0.03, 0, 0.015] as const
export const BELLOWS_HZ = 0.2
export const BELLOWS_DEPTH = 0.012
export const REED_RELEASE = 0.12

export function createShrutiVoice(
  context: BaseAudioContext, destination: AudioNode, hz: number,
  start: number, volume: number, onEnd: () => void = () => {},
): Voice {
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0, start)
  envelope.gain.linearRampToValueAtTime(volume, start + 0.35)
  const pressure = context.createGain()
  pressure.gain.value = 1
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1000, start)
  filter.Q.value = 2.4
  filter.connect(pressure)
  pressure.connect(envelope)
  envelope.connect(destination)

  const wave = context.createPeriodicWave(
    new Float32Array(REED_HARMONICS.length), new Float32Array(REED_HARMONICS),
    { disableNormalization: true },
  )
  const reeds = [-2, 2].map((cents, index) => {
    const source = context.createOscillator()
    source.setPeriodicWave(wave)
    source.frequency.setValueAtTime(hz, start)
    source.detune.setValueAtTime(cents, start)
    const level = context.createGain()
    level.gain.value = index === 0 ? 0.56 : 0.44
    source.connect(level)
    level.connect(filter)
    source.start(start)
    return { source, level }
  })
  const bellows = context.createOscillator()
  bellows.frequency.setValueAtTime(BELLOWS_HZ, start)
  const amplitudeDepth = context.createGain()
  amplitudeDepth.gain.value = BELLOWS_DEPTH
  bellows.connect(amplitudeDepth)
  amplitudeDepth.connect(pressure.gain)
  const cutoffDepth = context.createGain()
  cutoffDepth.gain.value = 1000 * BELLOWS_DEPTH
  bellows.connect(cutoffDepth)
  cutoffDepth.connect(filter.frequency)
  bellows.start(start)

  const sources = [...reeds.map(reed => reed.source), bellows]
  sources[0].onended = () => {
    sources.forEach(source => source.disconnect())
    reeds.forEach(reed => reed.level.disconnect())
    for (const node of [amplitudeDepth, cutoffDepth, filter, pressure, envelope]) node.disconnect()
    onEnd()
  }
  let cancelled = false
  return {
    start, end: Infinity, hz,
    cancel(when) {
      if (cancelled) return
      cancelled = true
      envelope.gain.cancelAndHoldAtTime(when)
      // Anchor the sustain explicitly so the release ramp cannot interpolate
      // all the way from the attack endpoint when stopped at a future time.
      envelope.gain.setValueAtTime(volume * Math.max(0, Math.min(1, (when - start) / 0.35)), when)
      envelope.gain.linearRampToValueAtTime(0, when + REED_RELEASE)
      sources.forEach(source => source.stop(when + REED_RELEASE + 0.005))
    },
  }
}
