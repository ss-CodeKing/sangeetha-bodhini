import { defaultShrutiIndex, shrutiKeys } from '../data/swaras'
import type { Kaalam, SwaraNote } from '../types/carnatic'
import { createWarmVoice } from './voice'
import type { Voice } from './voice'
import { cursorAt, DRONE_STRINGS, lessonUnits, noteFrequency, notesPerBeat, resolveNote, unitDuration, wrapPosition } from './transport'
import type { LoopMode, PlaybackSnapshot } from './transport'

export interface EngineRuntime {
  createContext: () => AudioContext
  setTimer: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>
  clearTimer: (id: ReturnType<typeof setTimeout>) => void
}
const browserRuntime: EngineRuntime = {
  createContext: () => {
    if (!window.AudioContext) throw new Error('This browser does not support Web Audio.')
    return new AudioContext({ latencyHint: 'interactive' })
  },
  setTimer: (callback, ms) => setTimeout(callback, ms),
  clearTimer: id => clearTimeout(id),
}
const LOOK_AHEAD = 0.12
const START_LEAD = 0.025
const WAKE_MS = 25

export class CarnaticAudioEngine {
  private runtime: EngineRuntime
  private context: AudioContext | null = null
  private destination: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private samples = new Float32Array(256)
  private listeners = new Set<() => void>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private melodyVoices = new Set<Voice>()
  private droneVoices = new Set<Voice>()
  private auditionVoices = new Set<Voice>()
  private anchorTime = 0
  private anchorPosition = 0
  private pausedPosition = 0
  private scheduleCursor = 0
  private rangeStart = 0
  private rangeEnd = 16
  private droneAnchor = 0
  private dronePluck = 0
  private playRequest = 0
  private droneRequest = 0
  private auditionRequest = 0
  private state: PlaybackSnapshot = {
    status: 'idle', lessonNumber: 1, kaalam: 1, bpm: 60,
    baseHz: shrutiKeys[defaultShrutiIndex].hz, loopMode: 'off', drone: false,
    unitIndex: 0, position: 0, beat: 1, subdivision: 0, avartanam: 1,
    beatProgress: 0, note: { swara: 'S', octave: 0 },
    hz: shrutiKeys[defaultShrutiIndex].hz, outputLevel: 0,
    contextState: 'uninitialized', error: null,
  }

  constructor(runtime: EngineRuntime = browserRuntime) { this.runtime = runtime }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  getSnapshot = () => this.state

  private get units() { return lessonUnits(this.state.lessonNumber, this.state.kaalam) }
  private get step() { return unitDuration(this.state.bpm, this.state.kaalam) }
  private renderNow() { return this.context?.currentTime ?? 0 }
  private audibleNow() {
    const context = this.context
    if (!context) return 0
    // UI follows the output device position when available, compensating latency.
    const { contextTime = 0, performanceTime = 0 } = context.getOutputTimestamp?.() ?? {}
    if (contextTime > 0 && performanceTime > 0) {
      return Math.min(context.currentTime, contextTime + Math.max(0, performance.now() - performanceTime) / 1000)
    }
    return Math.max(0, context.currentTime - (context.baseLatency || 0) - (context.outputLatency || 0))
  }
  private rawPosition(time: number) {
    return this.anchorPosition + Math.max(0, time - this.anchorTime) / this.step
  }
  private position(time = this.audibleNow()) {
    if (this.state.status !== 'playing') return this.pausedPosition
    const raw = this.rawPosition(time)
    return this.state.loopMode === 'off'
      ? Math.min(raw, this.rangeEnd)
      : wrapPosition(raw, this.rangeStart, this.rangeEnd)
  }
  private publish(patch: Partial<PlaybackSnapshot> = {}) {
    const position = patch.position ?? this.position()
    const cursor = cursorAt(position, this.state.kaalam, this.units.length)
    const note = resolveNote(this.units, cursor.unitIndex)
    let outputLevel = 0
    if (this.analyser && this.context?.state === 'running' && ((patch.status ?? this.state.status) === 'playing' || (patch.drone ?? this.state.drone) || this.auditionVoices.size > 0)) {
      this.analyser.getFloatTimeDomainData(this.samples)
      outputLevel = Math.sqrt(this.samples.reduce((sum, sample) => sum + sample * sample, 0) / this.samples.length)
    }
    this.state = {
      ...this.state, ...cursor, note, hz: noteFrequency(note, this.state.baseHz),
      outputLevel, contextState: this.context?.state ?? 'uninitialized', ...patch,
    }
    this.listeners.forEach(listener => listener())
  }
  private async unlock() {
    if (!this.context || this.context.state === 'closed') {
      this.context = this.runtime.createContext()
      const master = this.context.createGain()
      master.gain.value = 0.75
      const compressor = this.context.createDynamicsCompressor()
      compressor.threshold.value = -18
      compressor.ratio.value = 3
      compressor.attack.value = 0.02
      compressor.release.value = 0.18
      this.analyser = this.context.createAnalyser()
      this.analyser.fftSize = 256
      master.connect(compressor)
      compressor.connect(this.analyser)
      this.analyser.connect(this.context.destination)
      this.destination = master
      this.context.onstatechange = () => {
        if (this.context && this.context.state !== 'running' && this.state.status === 'playing') {
          this.pause()
          this.publish({ error: 'Audio was interrupted. Press Play to resume.' })
        }
      }
    }
    await this.context.resume()
    if (this.context.state !== 'running') throw new Error('Audio could not start. Press Play to try again.')
  }
  private cancel(voices: Set<Voice>) {
    const now = this.renderNow()
    voices.forEach(voice => voice.cancel(now))
    voices.clear()
  }
  private voice(hz: number, start: number, duration: number, group: Set<Voice>, drone = false) {
    if (!this.context || !this.destination || duration < 0.005) return
    let voice: Voice
    voice = createWarmVoice(this.context, this.destination, hz, start, duration, drone ? 0.075 : 0.23, drone, () => group.delete(voice))
    group.add(voice)
  }
  private updateRange(position: number) {
    const cycle = 8 * notesPerBeat(this.state.kaalam)
    this.rangeStart = this.state.loopMode === 'avartanam' ? Math.floor(position / cycle) * cycle : 0
    this.rangeEnd = this.state.loopMode === 'avartanam' ? this.rangeStart + cycle : this.units.length
  }
  private rebase(position: number) {
    this.cancel(this.melodyVoices)
    this.updateRange(Math.min(position, this.units.length - 1))
    this.anchorPosition = Math.max(this.rangeStart, Math.min(position, this.rangeEnd - 1e-7))
    this.anchorTime = this.renderNow() + START_LEAD
    this.scheduleCursor = this.anchorPosition
    this.pausedPosition = this.anchorPosition
    this.tick()
  }

  play = async () => {
    if (this.state.status === 'playing' || this.state.status === 'loading') return
    const request = ++this.playRequest
    const previous = this.state.status
    this.publish({ status: 'loading', error: null })
    try {
      await this.unlock()
      if (request !== this.playRequest) return
      if (previous === 'complete' || this.pausedPosition >= this.units.length) this.pausedPosition = 0
      this.state = { ...this.state, status: 'playing', error: null }
      this.rebase(this.pausedPosition)
    } catch (error) {
      if (request === this.playRequest) this.publish({ status: 'paused', error: String(error instanceof Error ? error.message : error) })
    }
  }
  pause = () => {
    ++this.playRequest
    const position = this.position()
    this.cancel(this.melodyVoices)
    this.pausedPosition = position
    this.publish({ status: this.state.status === 'idle' ? 'idle' : this.state.status === 'complete' ? 'complete' : 'paused', position })
    this.keepTimer()
  }
  reset = () => {
    this.pause()
    this.pausedPosition = 0
    this.updateRange(0)
    this.publish({ status: 'idle', position: 0, error: null })
  }
  selectLesson = (number: number) => {
    if (number < 1 || number > 14 || !Number.isInteger(number)) return
    this.reset()
    this.state = { ...this.state, lessonNumber: number }
    this.updateRange(0)
    this.publish({ status: 'idle', position: 0 })
  }
  seek = (unitIndex: number) => {
    if (!Number.isFinite(unitIndex)) return
    const position = Math.max(0, Math.min(unitIndex, this.units.length - 1))
    if (this.state.status === 'playing') this.rebase(position)
    else { this.pausedPosition = position; this.updateRange(position); this.publish({ status: 'paused', position }) }
  }
  configure = (patch: { bpm?: number; kaalam?: Kaalam; baseHz?: number; loopMode?: LoopMode }) => {
    if (patch.bpm !== undefined && (!Number.isFinite(patch.bpm) || patch.bpm < 45 || patch.bpm > 90)) return
    if (patch.baseHz !== undefined && (!Number.isFinite(patch.baseHz) || patch.baseHz <= 0)) return
    const position = this.position()
    const oldLength = this.units.length
    this.state = { ...this.state, ...patch }
    const mapped = position >= oldLength ? this.units.length : position % this.units.length
    this.pausedPosition = mapped
    this.updateRange(Math.min(mapped, this.units.length - 1))
    if (this.state.status === 'playing') this.rebase(mapped)
    else this.publish({ position: mapped })
    if (patch.baseHz !== undefined && this.state.drone) {
      this.cancel(this.droneVoices)
      this.droneAnchor = this.renderNow() + START_LEAD
      this.dronePluck = 0
      this.tick()
    }
    if (patch.baseHz !== undefined) this.cancel(this.auditionVoices)
  }
  setDrone = async (enabled: boolean) => {
    const request = ++this.droneRequest
    if (!enabled) {
      this.cancel(this.droneVoices)
      this.publish({ drone: false })
      this.keepTimer()
      return
    }
    try {
      await this.unlock()
      if (request !== this.droneRequest) return
      this.droneAnchor = this.renderNow() + START_LEAD
      this.dronePluck = 0
      this.publish({ drone: true, error: null })
      this.tick()
    } catch (error) {
      if (request === this.droneRequest) this.publish({ drone: false, error: String(error instanceof Error ? error.message : error) })
    }
  }
  audition = async (note: SwaraNote) => {
    const request = ++this.auditionRequest
    try {
      await this.unlock()
      if (request !== this.auditionRequest) return
      this.cancel(this.auditionVoices)
      this.voice(noteFrequency(note, this.state.baseHz), this.renderNow() + 0.01, 0.9, this.auditionVoices)
      this.publish({ error: null })
      this.keepTimer()
    } catch (error) {
      this.publish({ error: String(error instanceof Error ? error.message : error) })
    }
  }

  private scheduleMelody(now: number) {
    const units = this.units
    const horizon = now + LOOK_AHEAD
    // Recover from a late wake-up using audio time: never play a burst of stale notes.
    const due = this.anchorTime + (this.scheduleCursor - this.anchorPosition) * this.step
    if (due < now - 0.04) this.scheduleCursor = this.rawPosition(now + 0.005)
    for (let guard = 0; guard < 32; guard++) {
      const raw = this.scheduleCursor
      if (this.state.loopMode === 'off' && raw >= this.rangeEnd - 1e-7) return
      const local = this.state.loopMode === 'off' ? raw : wrapPosition(raw, this.rangeStart, this.rangeEnd)
      const index = Math.min(Math.floor(local + 1e-8), this.rangeEnd - 1)
      const when = this.anchorTime + (raw - this.anchorPosition) * this.step
      if (when > horizon) return
      let end = index + 1
      while (end < this.rangeEnd && units[end].kind === 'hold') end++
      const endTime = when + (end - local) * this.step
      const start = Math.max(when, now + 0.002)
      this.voice(noteFrequency(resolveNote(units, index), this.state.baseHz), start, endTime - start, this.melodyVoices)
      this.scheduleCursor = raw + end - local
    }
  }
  private scheduleDrone(now: number) {
    const interval = 0.85
    if (this.droneAnchor + this.dronePluck * interval < now - 0.04) {
      this.dronePluck = Math.ceil((now + 0.005 - this.droneAnchor) / interval)
    }
    while (this.droneAnchor + this.dronePluck * interval < now + LOOK_AHEAD) {
      const when = this.droneAnchor + this.dronePluck * interval
      this.voice(noteFrequency(DRONE_STRINGS[this.dronePluck % 4], this.state.baseHz), Math.max(when, now + 0.002), 3.25, this.droneVoices, true)
      this.dronePluck++
    }
  }
  // setTimeout only wakes the scheduler. Every onset is calculated from an
  // AudioContext epoch, never from the number/timing of JS timer callbacks.
  private tick = () => {
    if (this.timer !== null) { this.runtime.clearTimer(this.timer); this.timer = null }
    const now = this.renderNow()
    if (this.state.status === 'playing') {
      if (this.state.loopMode === 'off' && this.rawPosition(this.audibleNow()) >= this.rangeEnd) {
        this.pausedPosition = this.rangeEnd
        this.state = { ...this.state, status: 'complete' }
      } else this.scheduleMelody(now)
    }
    if (this.state.drone && this.context?.state === 'running') this.scheduleDrone(now)
    this.publish()
    this.keepTimer()
  }
  private keepTimer() {
    const active = this.state.status === 'playing' || this.state.drone || this.auditionVoices.size > 0
    if (active && this.timer === null) this.timer = this.runtime.setTimer(this.tick, WAKE_MS)
    if (!active && this.timer !== null) { this.runtime.clearTimer(this.timer); this.timer = null }
  }
  stopAll = () => {
    this.pause()
    void this.setDrone(false)
    ++this.auditionRequest
    this.cancel(this.auditionVoices)
    this.keepTimer()
  }
  dispose = () => {
    this.stopAll()
    const context = this.context
    if (context) {
      context.onstatechange = null
      void context.close().catch(() => {})
    }
    this.context = null
    this.destination = null
    this.analyser = null
  }
}
