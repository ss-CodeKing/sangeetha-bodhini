export interface Voice {
  start: number
  end: number
  hz: number
  cancel: (when: number) => void
}

// Shared by live and offline rendering. Each attack has its own envelope;
// a karvai extends this duration rather than triggering another oscillator.
export function createWarmVoice(
  context: BaseAudioContext, destination: AudioNode, hz: number,
  start: number, duration: number, volume: number, drone = false,
  onEnd: () => void = () => {},
): Voice {
  const envelope = context.createGain()
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(drone ? 1800 : 2600, start)
  filter.Q.value = 0.3
  envelope.connect(filter)
  filter.connect(destination)
  const attack = Math.min(drone ? 0.035 : 0.025, duration * 0.15)
  envelope.gain.setValueAtTime(0, start)
  envelope.gain.linearRampToValueAtTime(volume, start + attack)
  if (drone) {
    envelope.gain.exponentialRampToValueAtTime(Math.max(volume * 0.28, 0.0001), start + duration * 0.3)
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.04)
  } else {
    const release = Math.min(0.065, duration * 0.2)
    envelope.gain.linearRampToValueAtTime(volume * 0.8, start + attack + Math.min(0.07, duration * 0.15))
    envelope.gain.setValueAtTime(volume * 0.8, start + duration - release)
  }
  envelope.gain.linearRampToValueAtTime(0, start + duration)
  const sources: OscillatorNode[] = []
  const gains: GainNode[] = []
  const partials: { type: OscillatorType; weight: number; multiplier: number }[] = [
    { type: 'sine', weight: 0.72, multiplier: 1 },
    { type: 'triangle', weight: 0.23, multiplier: 1 },
    { type: 'sine', weight: 0.05, multiplier: 2 },
  ]
  for (const partial of partials) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = partial.type
    oscillator.frequency.setValueAtTime(hz * partial.multiplier, start)
    gain.gain.value = partial.weight
    oscillator.connect(gain)
    gain.connect(envelope)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.01)
    sources.push(oscillator)
    gains.push(gain)
  }
  sources[0].onended = () => {
    sources.forEach(source => source.disconnect())
    gains.forEach(gain => gain.disconnect())
    envelope.disconnect()
    filter.disconnect()
    onEnd()
  }
  let cancelled = false
  return {
    start, end: start + duration, hz,
    cancel(when) {
      if (cancelled) return
      cancelled = true
      // cancelAndHold avoids a discontinuity in an attack/decay already in flight.
      envelope.gain.cancelAndHoldAtTime(when)
      envelope.gain.linearRampToValueAtTime(0, when + 0.015)
      sources.forEach(source => source.stop(when + 0.02))
    },
  }
}
