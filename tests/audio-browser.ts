import { CarnaticAudioEngine } from '../src/audio/CarnaticAudioEngine'
import { createWarmVoice } from '../src/audio/voice'
import { createShrutiVoice } from '../src/audio/shrutiVoice'
import { DRONE_VOICES, noteFrequency, unitDuration } from '../src/audio/transport'
import { shrutiKeys, defaultShrutiIndex } from '../src/data/swaras'
import type { Kaalam, SwaraNote } from '../src/types/carnatic'

const button = document.querySelector<HTMLButtonElement>('#run')!
const status = document.querySelector<HTMLParagraphElement>('#status')!
const results = document.querySelector<HTMLOListElement>('#results')!
const check = (condition: boolean, message: string) => { if (!condition) throw new Error(message) }
const report = (text: string) => { const li = document.createElement('li'); li.textContent = text; results.append(li) }
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function offlineCheck(note: SwaraNote) {
  const sampleRate = 48000
  const context = new OfflineAudioContext(1, sampleRate, sampleRate)
  const hz = noteFrequency(note, shrutiKeys[defaultShrutiIndex].hz)
  createWarmVoice(context, context.destination, hz, 0.02, 0.7, 0.23)
  const buffer = await context.startRendering()
  const samples = buffer.getChannelData(0)
  let peak = 0, energy = 0, jump = 0
  const crossings: number[] = []
  for (let i = 1; i < samples.length; i++) {
    peak = Math.max(peak, Math.abs(samples[i]))
    jump = Math.max(jump, Math.abs(samples[i] - samples[i - 1]))
    if (i > 4800 && i < 28800) {
      energy += samples[i] ** 2
      if (samples[i - 1] < 0 && samples[i] >= 0) crossings.push(i - 1 - samples[i - 1] / (samples[i] - samples[i - 1]))
    }
  }
  const measured = (crossings.length - 1) * sampleRate / (crossings.at(-1)! - crossings[0])
  check(Math.abs(measured - hz) < 0.15, 'Synth pitch mismatch: ' + measured + ' vs ' + hz)
  check(peak > 0.05 && peak < 0.8 && energy > 1, 'Missing or clipped synthesized output')
  check(jump < 0.05 && samples[0] === 0 && Math.abs(samples[40000]) < 1e-6, 'Envelope has a click or incomplete release')
  report('Offline ' + note.swara + ' octave ' + note.octave + ': target ' + hz.toFixed(4) + ' Hz, measured ' + measured.toFixed(4) + ' Hz; envelope and level pass.')
}

async function realtimeCheck(kaalam: Kaalam) {
  const context = new AudioContext({ latencyHint: 'interactive' })
  const starts: number[] = []
  const originalCreate = context.createOscillator.bind(context)
  let oscillatorCount = 0
  context.createOscillator = () => {
    const oscillator = originalCreate()
    const isFundamental = oscillatorCount++ % 3 === 0
    const start = oscillator.start.bind(oscillator)
    oscillator.start = (when = 0) => { if (isFundamental) starts.push(when); start(when) }
    return oscillator
  }
  const engine = new CarnaticAudioEngine({
    createContext: () => context,
    setTimer: (callback, ms) => setTimeout(callback, ms),
    clearTimer: timer => clearTimeout(timer),
  })
  let maxLevel = 0, maxLag = 0, previousIndex = -1, transitions = 0
  const unsubscribe = engine.subscribe(() => {
    const snapshot = engine.getSnapshot()
    maxLevel = Math.max(maxLevel, snapshot.outputLevel)
    if (snapshot.status === 'playing' && snapshot.unitIndex !== previousIndex) {
      previousIndex = snapshot.unitIndex
      transitions++
      if (snapshot.unitIndex > 0 && starts[snapshot.unitIndex] !== undefined) {
        const timestamp = context.getOutputTimestamp()
        const audible = timestamp.contextTime! + Math.max(0, performance.now() - timestamp.performanceTime!) / 1000
        maxLag = Math.max(maxLag, Math.abs(audible - starts[snapshot.unitIndex]))
      }
    }
  })
  try {
    engine.configure({ kaalam, loopMode: 'lesson' })
    await engine.play()
    await delay(2250)
    check(engine.getSnapshot().status === 'playing', 'Transport did not start')
    check(context.state === 'running', 'Live context is not running')
    check(maxLevel > 0.005, 'Analyser detected no live output')
    check(transitions >= 2 ** (kaalam - 1) * 2, 'Highlight did not advance at the chosen speed')
    const step = unitDuration(60, kaalam)
    for (let i = 1; i < starts.length; i++) check(Math.abs(starts[i] - starts[i - 1] - step) < 1e-5, 'Onset scheduling drift')
    check(maxLag < 0.08, 'Output/highlight lag above 80 ms: ' + maxLag)
    engine.pause()
    const paused = engine.getSnapshot().position
    await delay(120)
    check(engine.getSnapshot().position === paused, 'Paused cursor moved')
    report('Live kaalam ' + kaalam + ': ' + starts.length + ' onsets, exact ' + step.toFixed(3) + ' s spacing; peak RMS ' + maxLevel.toFixed(4) + '; maximum highlight/output lag ' + (maxLag * 1000).toFixed(1) + ' ms. Pause freezes correctly.')
  } finally {
    unsubscribe()
    engine.dispose()
  }
}

async function offlineDroneCheck(baseHz: number) {
  const rate = 48000
  const context = new OfflineAudioContext(1, rate * 5, rate)
  DRONE_VOICES.forEach(({ note, volume, detuneCents }) => {
    const voice = createShrutiVoice(context, context.destination, noteFrequency(note, baseHz), 0.02, volume, detuneCents)
    voice.cancel(4.5)
  })
  // A high register audition overlaps the chord, checking combined headroom.
  createWarmVoice(context, context.destination, baseHz * 4, 1, 0.9, 0.23)
  const samples = (await context.startRendering()).getChannelData(0)
  let peak = 0, jump = 0
  for (let i = 1; i < samples.length; i++) {
    peak = Math.max(peak, Math.abs(samples[i]))
    jump = Math.max(jump, Math.abs(samples[i] - samples[i - 1]))
  }
  check(peak > 0.03 && peak < 0.85, 'Missing or clipping reed drone / audition mix')
  check(jump < 0.12, 'Discontinuity in reed activation / release')
  for (let offset = 2; offset < 4.5; offset += 0.25) {
    const window = samples.subarray(offset * rate, (offset + 0.2) * rate)
    const rms = Math.sqrt(window.reduce((sum, value) => sum + value * value, 0) / window.length)
    check(rms > 0.002, 'Drone decayed or stopped during sustain at ' + offset + ' s: RMS ' + rms + ', tonic ' + baseHz)
  }
  check(samples.subarray(4.7 * rate).every(sample => Math.abs(sample) < 1e-6), 'Drone leaked after release')
  report('Reed drone + high Sa at ' + baseHz.toFixed(2) + ' Hz: peak ' + peak.toFixed(4) + ', max sample step ' + jump.toFixed(4) + '; continuous sustain and clean release pass.')
}

async function liveDroneCheck() {
  const engine = new CarnaticAudioEngine()
  let peakRms = 0
  const unsubscribe = engine.subscribe(() => { peakRms = Math.max(peakRms, engine.getSnapshot().outputLevel) })
  try {
    await engine.setDrone(true)
    await delay(1500)
    check(peakRms > 0.003, 'No live reed output')
    engine.configure({ baseHz: 220 })
    engine.selectChapter('janta')
    engine.configure({ kaalam: 3 })
    await engine.play()
    await delay(1800)
    check(engine.getSnapshot().unitIndex > 3, 'Janta playback did not advance')
    engine.pause()
    check(engine.getSnapshot().drone, 'Pausing Janta stopped the drone')
    await engine.setDrone(false)
    report('Live reed drone: nonzero output, retuning, Janta playback and independent stop pass; peak RMS ' + peakRms.toFixed(4) + '.')
  } finally { unsubscribe(); engine.dispose() }
}

button.addEventListener('click', async () => {
  button.disabled = true
  results.replaceChildren()
  status.textContent = 'Running real audio checks…'
  try {
    for (const note of [
      { swara: 'S', octave: 0 }, { swara: 'R1', octave: 0 }, { swara: 'G2', octave: 0 },
      { swara: 'G3', octave: 0 }, { swara: 'P', octave: -1 }, { swara: 'N2', octave: 0 }, { swara: 'S', octave: 1 },
    ] as SwaraNote[]) await offlineCheck(note)
    for (const key of shrutiKeys) await offlineDroneCheck(key.hz)
    for (const kaalam of [1, 2, 3] as Kaalam[]) await realtimeCheck(kaalam)
    await liveDroneCheck()
    status.textContent = 'All audio checks passed'
    status.dataset.result = 'passed'
  } catch (error) {
    status.textContent = 'FAILED: ' + String(error)
    status.dataset.result = 'failed'
  } finally { button.disabled = false }
})
