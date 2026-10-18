import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CarnaticAudioEngine } from '../src/audio/CarnaticAudioEngine'
import type { EngineRuntime } from '../src/audio/CarnaticAudioEngine'
import { DRONE_VOICES, noteFrequency, unitDuration } from '../src/audio/transport'
import type { Kaalam } from '../src/types/carnatic'
import { BELLOWS_DEPTH, BELLOWS_HZ, REED_HARMONICS, REED_RELEASE } from '../src/audio/shrutiVoice'
import { curriculum, getChapter } from '../src/data/curriculum'

class Param {
  value = 0
  events: { kind: string; value: number; time: number }[] = []
  setValueAtTime(value: number, time: number) { this.value = value; this.events.push({ kind: 'set', value, time }) }
  linearRampToValueAtTime(value: number, time: number) { this.events.push({ kind: 'linear', value, time }) }
  cancelAndHoldAtTime(time: number) { this.events.push({ kind: 'cancel', value: this.value, time }) }
}
class Node {
  gain = new Param()
  frequency = new Param()
  detune = new Param()
  Q = new Param()
  threshold = new Param()
  ratio = new Param()
  attack = new Param()
  release = new Param()
  fftSize = 256
  type = 'sine'
  startTime = -1
  stopTimes: number[] = []
  ended = false
  onended: (() => void) | null = null
  connect() {}
  setPeriodicWave() { this.type = 'custom' }
  disconnect() {}
  start(time: number) { this.startTime = time }
  stop(time: number) { this.stopTimes.push(time) }
  getFloatTimeDomainData(samples: Float32Array) { samples.fill(0) }
}
class Context {
  currentTime = 0
  state = 'suspended'
  baseLatency = 0
  outputLatency = 0
  destination = new Node()
  oscillators: Node[] = []
  gains: Node[] = []
  filters: Node[] = []
  waves: Float32Array[] = []
  onstatechange: (() => void) | null = null
  createGain() { const node = new Node(); this.gains.push(node); return node }
  createBiquadFilter() { const node = new Node(); this.filters.push(node); return node }
  createPeriodicWave(_real: Float32Array, imaginary: Float32Array) { this.waves.push(imaginary); return {} }
  createDynamicsCompressor() { return new Node() }
  createAnalyser() { return new Node() }
  createOscillator() { const node = new Node(); this.oscillators.push(node); return node }
  async resume() { this.state = 'running' }
  async close() { this.state = 'closed' }
  retire() {
    this.oscillators.forEach(node => {
      if (!node.ended && node.stopTimes.at(-1)! <= this.currentTime) {
        node.ended = true
        node.onended?.()
      }
    })
  }
}
function setup() {
  const context = new Context()
  const timers = new Map<number, { callback: () => void; due: number }>()
  let nextId = 0
  const runtime: EngineRuntime = {
    createContext: () => context as unknown as AudioContext,
    setTimer(callback, ms) {
      const id = ++nextId
      timers.set(id, { callback, due: context.currentTime + ms / 1000 })
      return id as unknown as ReturnType<typeof setTimeout>
    },
    clearTimer(id) { timers.delete(id as unknown as number) },
  }
  const engine = new CarnaticAudioEngine(runtime)
  const wake = () => {
    const due = [...timers.entries()].filter(([, timer]) => timer.due <= context.currentTime + 1e-10)
    due.forEach(([id, timer]) => { timers.delete(id); timer.callback() })
    context.retire()
  }
  return {
    engine, context,
    advance(seconds: number) {
      const end = context.currentTime + seconds
      while (timers.size) {
        const next = Math.min(...[...timers.values()].map(timer => timer.due))
        if (next > end + 1e-10) break
        context.currentTime = next
        wake()
      }
      context.currentTime = end
      context.retire()
    },
    lateWake(seconds: number) { context.currentTime += seconds; wake() },
    fundamentals: () => context.oscillators.filter((_, i) => i % 3 === 0),
  }
}
const near = (actual: number, expected: number, epsilon = 1e-8) => assert.ok(Math.abs(actual - expected) < epsilon, actual + ' ≠ ' + expected)

for (const kaalam of [1, 2, 3] as Kaalam[]) {
  test('audio-clock notes, talam cursor and completion at kaalam ' + kaalam, async () => {
    const { engine, advance, fundamentals } = setup()
    engine.configure({ kaalam })
    await engine.play()
    const step = unitDuration(60, kaalam)
    advance(3.7)
    const snapshot = engine.getSnapshot()
    const index = Math.floor((3.7 - 0.025) / step)
    assert.equal(snapshot.unitIndex, index)
    assert.equal(snapshot.beat, Math.floor(index / (2 ** (kaalam - 1))) % 8 + 1)
    assert.equal(snapshot.subdivision, index % (2 ** (kaalam - 1)))
    fundamentals().forEach((node, i) => near(node.startTime, 0.025 + i * step))
    // Lesson 1 is repeated twice at third kaalam to complete its talam.
    const length = kaalam === 3 ? 32 : 16
    advance(length * step + 0.2 - 3.7)
    assert.equal(engine.getSnapshot().status, 'complete')
    assert.equal(fundamentals().length, length)
    engine.dispose()
  })
}

test('karvai is one sustained voice across holds and beat boundaries', async () => {
  const { engine, advance, fundamentals } = setup()
  engine.selectLesson(10)
  await engine.play()
  advance(15.9)
  const notes = fundamentals()
  assert.equal(notes.length, 9) // 16 units minus 7 holds
  const pa = notes.find(note => Math.abs(note.startTime - 8.025) < 1e-8)!
  assert.ok(pa)
  near(pa.stopTimes[0], 12.035) // four units plus oscillator cleanup tail
  assert.ok(!notes.some(note => note.startTime > 8.025 && note.startTime < 12.025))
  engine.dispose()
})

test('pause cancels queued voices, freezes position, and resume retains fractional note progress', async () => {
  const { engine, advance, context, fundamentals } = setup()
  await engine.play()
  advance(0.7)
  engine.pause()
  const paused = engine.getSnapshot().position
  near(paused, 0.675)
  assert.ok(context.oscillators.every(node => node.stopTimes.at(-1)! <= 0.72))
  advance(2)
  near(engine.getSnapshot().position, paused)
  await engine.play()
  advance(0.5)
  const resumed = fundamentals().slice(1)
  near(resumed[0].startTime, 2.725)
  near(resumed[1].startTime, 3.05)
  assert.equal(engine.getSnapshot().unitIndex, 1)
  engine.reset()
  assert.equal(engine.getSnapshot().unitIndex, 0)
  assert.equal(engine.getSnapshot().status, 'idle')
  engine.dispose()
})

test('live speed/tempo/pitch changes cancel old schedules and preserve the current phrase position', async () => {
  const { engine, advance, context, fundamentals } = setup()
  await engine.play()
  advance(2.4)
  const position = engine.getSnapshot().position
  const oldCount = context.oscillators.length
  engine.configure({ kaalam: 3, bpm: 90, baseHz: 220 })
  near(engine.getSnapshot().position, position)
  assert.equal(engine.getSnapshot().unitIndex, 2)
  assert.equal(engine.getSnapshot().kaalam, 3)
  near(engine.getSnapshot().hz, 275)
  assert.ok(context.oscillators.slice(0, oldCount).every(node => node.ended || node.stopTimes.at(-1)! <= 2.42))
  advance(0.4)
  const newNotes = fundamentals().filter(node => node.startTime >= 2.425 - 1e-8)
  near(newNotes[0].frequency.value, 275)
  near(newNotes[1].startTime, 2.425 + (3 - position) / 6)
  engine.configure({ bpm: 45 })
  assert.equal(engine.getSnapshot().bpm, 45)
  engine.configure({ bpm: 91 })
  assert.equal(engine.getSnapshot().bpm, 45)
  engine.dispose()
})

test('a delayed JavaScript wake-up recovers without accumulating drift or bursting stale notes', async () => {
  const { engine, lateWake, advance, context, fundamentals } = setup()
  engine.configure({ kaalam: 3 })
  await engine.play()
  lateWake(1.31)
  const recent = fundamentals().filter(node => node.startTime >= 1.31)
  assert.equal(recent.length, 1)
  near(recent[0].startTime, 1.315)
  advance(1.2)
  const grid = fundamentals().filter(node => node.startTime > 1.4)
  grid.forEach(node => near((node.startTime - 0.025) / 0.25, Math.round((node.startTime - 0.025) / 0.25)))
  assert.ok(engine.getSnapshot().unitIndex >= 9)
  assert.ok(context.oscillators.every(node => node.startTime >= 0))
  engine.dispose()
})

test('lesson and current-avartanam loops wrap on the sample-clock boundary', async () => {
  const { engine, advance, fundamentals } = setup()
  engine.configure({ bpm: 60, loopMode: 'lesson' })
  await engine.play()
  advance(16.3)
  assert.equal(engine.getSnapshot().status, 'playing')
  assert.equal(engine.getSnapshot().unitIndex, 0)
  near(fundamentals()[16].startTime, 16.025)
  engine.seek(8)
  engine.configure({ loopMode: 'avartanam' })
  advance(8.3)
  assert.equal(engine.getSnapshot().avartanam, 2)
  assert.equal(engine.getSnapshot().unitIndex, 8)
  engine.selectLesson(14)
  assert.equal(engine.getSnapshot().status, 'idle')
  assert.equal(engine.getSnapshot().lessonNumber, 14)
  assert.equal(engine.getSnapshot().unitIndex, 0)
  engine.dispose()
})

test('shruti box sustains simultaneous reed tones and stops independently', async () => {
  const { engine, advance, context } = setup()
  assert.deepEqual(DRONE_VOICES.map(voice => noteFrequency(voice.note, 200)), [150, 400, 400, 200])
  engine.configure({ baseHz: 200 })
  await engine.setDrone(true)
  advance(30)
  const reeds = () => context.oscillators.filter(node => node.type === 'custom')
  assert.deepEqual(reeds().map(node => node.frequency.value), [150, 400, 400, 200])
  reeds().forEach(node => near(node.startTime, 0.025))
  assert.deepEqual(reeds().map(node => node.detune.value), [0, 0, 3.5, 0])
  near(reeds()[2].frequency.value * 2 ** (reeds()[2].detune.value / 1200), 400 * 2 ** (3.5 / 1200))
  assert.deepEqual(context.oscillators.filter(node => node.type === 'sine').map(node => node.frequency.value), [BELLOWS_HZ, BELLOWS_HZ, BELLOWS_HZ, BELLOWS_HZ])
  assert.ok(BELLOWS_DEPTH < 0.015)
  context.filters.forEach(filter => { assert.equal(filter.frequency.value, 1000); assert.equal(filter.Q.value, 2.4) })
  context.waves.forEach(wave => assert.deepEqual(wave, new Float32Array(REED_HARMONICS)))
  assert.ok(context.oscillators.every(node => node.stopTimes.length === 0))
  const envelopes = context.gains.filter(node => node.gain.events.length > 0)
  assert.equal(envelopes.length, 4)
  envelopes.forEach((node, index) => {
    assert.equal(node.gain.events.length, 2) // Only a soft attack, no decay or repeated plucks.
    assert.deepEqual(node.gain.events.map(event => event.value), [0, [0.075, 0.045, 0.035, 0.06][index]])
  })
  await engine.setDrone(true)
  assert.equal(reeds().length, 4)
  const droneSources = [...context.oscillators]
  await engine.play()
  engine.pause()
  assert.equal(engine.getSnapshot().drone, true)
  assert.ok(droneSources.every(node => node.stopTimes.length === 0))
  await engine.setDrone(false)
  assert.equal(engine.getSnapshot().drone, false)
  assert.ok(droneSources.every(node => node.stopTimes.at(-1) === context.currentTime + REED_RELEASE + 0.005))
  engine.dispose()
})

test('changing shruti replaces the sustained drone and stop cancels every source', async () => {
  const { engine, context, advance } = setup()
  await engine.setDrone(true)
  advance(0.5)
  const oldSources = [...context.oscillators]
  engine.configure({ baseHz: 220 })
  assert.ok(oldSources.every(node => node.stopTimes.at(-1) === 0.5 + REED_RELEASE + 0.005))
  const reeds = () => context.oscillators.filter(node => node.type === 'custom')
  assert.deepEqual(reeds().slice(4).map(node => node.frequency.value), [165, 440, 440, 220])
  assert.deepEqual(reeds().slice(4).map(node => node.detune.value), [0, 0, 3.5, 0])
  advance(10)
  assert.equal(reeds().length, 8)
  engine.stopAll()
  assert.ok(context.oscillators.every(node => node.stopTimes.length > 0))
  engine.dispose()
})

test('audition plays Sa in all five registers and replaces the previous note', async () => {
  const { engine, context, fundamentals } = setup()
  engine.configure({ baseHz: 200 })
  for (const octave of [-2, -1, 0, 1, 2] as const) {
    const previous = [...context.oscillators]
    await engine.audition({ swara: 'S', octave })
    near(fundamentals().at(-1)!.frequency.value, 200 * 2 ** octave)
    assert.ok(previous.every(node => node.stopTimes.at(-1) === context.currentTime + 0.02))
  }
  engine.dispose()
})

for (const chapterId of ['janta', 'melsthayi', 'dhatu', 'alankaras', 'geethams'] as const) {
  for (const kaalam of [1, 2, 3] as Kaalam[]) {
    test(chapterId + ' exercises articulate notes and preserve holds at kaalam ' + kaalam, async () => {
      for (const lesson of getChapter(chapterId).lessons) {
        const { engine, advance, fundamentals } = setup()
        engine.selectChapter(chapterId)
        engine.selectLesson(lesson.number)
        engine.configure({ kaalam })
        await engine.play()
        const mapping = lesson.kaalams[kaalam]
        const units = mapping.avartanams.flatMap(cycle => cycle.beats.flatMap(beat => beat.units))
        const step = unitDuration(60, kaalam)
        advance(units.length * step + 0.2)
        assert.equal(engine.getSnapshot().status, 'complete')
        assert.equal(fundamentals().length, units.filter(unit => unit.kind === 'note').length)
        let voiceIndex = 0
        units.forEach((unit, index) => {
          if (unit.kind === 'hold') return
          const voice = fundamentals()[voiceIndex++]
          near(voice.frequency.value, noteFrequency(unit.note, engine.getSnapshot().baseHz))
          near(voice.startTime, 0.025 + index * step)
          let end = index + 1
          while (end < units.length && units[end].kind === 'hold') end++
          near(voice.stopTimes[0], 0.025 + end * step + 0.01)
        })
        engine.dispose()
      }
    })
  }
}

test('chapter changes cancel pending playback, reset the score/tempo/loop and retain drone/shruti/kaalam', async () => {
  const { engine } = setup()
  engine.selectLesson(14)
  engine.configure({ kaalam: 3, bpm: 75, loopMode: 'avartanam' })
  await engine.setDrone(true)
  const pendingPlay = engine.play()
  engine.selectChapter('janta')
  await pendingPlay
  assert.equal(engine.getSnapshot().status, 'idle')
  assert.equal(engine.getSnapshot().chapterId, 'janta')
  assert.equal(engine.getSnapshot().lessonNumber, 1)
  assert.equal(engine.getSnapshot().unitIndex, 0)
  assert.equal(engine.getSnapshot().drone, true)
  assert.equal(engine.getSnapshot().kaalam, 3)
  assert.equal(engine.getSnapshot().bpm, 60)
  assert.equal(engine.getSnapshot().loopMode, 'off')
  engine.selectLesson(12)
  engine.selectLesson(13)
  assert.equal(engine.getSnapshot().lessonNumber, 12)
  engine.selectChapter('sarali')
  engine.selectLesson(14)
  assert.equal(engine.getSnapshot().lessonNumber, 14)
  engine.dispose()
})

test('pause during context unlock prevents a stale async Play from starting audio', async () => {
  const { engine, fundamentals } = setup()
  const play = engine.play()
  engine.pause()
  await play
  assert.equal(engine.getSnapshot().status, 'paused')
  assert.equal(fundamentals().length, 0)
  engine.dispose()
})


test('initial cleanup keeps the transport idle and unavailable audio reports an error', async () => {
  const idle = setup()
  idle.engine.dispose()
  assert.equal(idle.engine.getSnapshot().status, 'idle')
  const engine = new CarnaticAudioEngine({
    createContext() { throw new Error('Web Audio unavailable') },
    setTimer: callback => setTimeout(callback, 25), clearTimer: clearTimeout,
  })
  await engine.play()
  assert.equal(engine.getSnapshot().status, 'paused')
  assert.equal(engine.getSnapshot().error, 'Web Audio unavailable')
  engine.dispose()
})

test('every chapter transition resets the audio clock, cursor and active note without queued voices', async () => {
  for (const from of curriculum) {
    for (const to of curriculum) {
      if (from.id === to.id) continue
      const { engine, context, advance } = setup()
      engine.selectChapter(from.id)
      engine.selectLesson(from.lessons.length)
      engine.configure({ kaalam: 3, loopMode: 'lesson', baseHz: 220 })
      await engine.play()
      advance(1.4)
      const oldSources = [...context.oscillators]
      engine.selectChapter(to.id)
      const snapshot = engine.getSnapshot()
      assert.equal(snapshot.chapterId, to.id)
      assert.equal(snapshot.lessonNumber, 1)
      assert.equal(snapshot.status, 'idle')
      assert.equal(snapshot.position, 0)
      assert.equal(snapshot.unitIndex, 0)
      assert.equal(snapshot.beat, 1)
      assert.equal(snapshot.subdivision, 0)
      assert.equal(snapshot.avartanam, 1)
      assert.deepEqual(snapshot.note, to.lessons[0].units[0].kind === 'note' ? to.lessons[0].units[0].note : null)
      assert.ok(oldSources.every(source => source.stopTimes.at(-1)! <= context.currentTime + 0.02))
      const count = context.oscillators.length
      advance(0.5)
      assert.equal(context.oscillators.length, count)
      await engine.play()
      near(context.oscillators[count].startTime, context.currentTime + 0.025)
      engine.dispose()
    }
  }
})

test('non-Adi cursor and avartanam loops follow the active tala at every kaalam', async () => {
  for (const [chapterId, lessonNumber, beats] of [
    ['alankaras',1,14], ['alankaras',3,6], ['alankaras',5,7], ['alankaras',6,14], ['alankaras',8,9], ['geethams',9,14],
  ] as const) {
    for (const kaalam of [1,2,3] as const) {
      const { engine, advance, context } = setup()
      engine.selectChapter(chapterId)
      engine.selectLesson(lessonNumber)
      engine.configure({ kaalam, loopMode: 'avartanam' })
      await engine.play()
      advance(beats - 0.1)
      assert.equal(engine.getSnapshot().beat, beats)
      assert.equal(engine.getSnapshot().avartanam, 1)
      advance(0.25)
      assert.equal(engine.getSnapshot().beat, 1)
      assert.equal(engine.getSnapshot().avartanam, 1)
      assert.ok(engine.getSnapshot().position < 2 ** (kaalam - 1))
      engine.configure({ bpm: 90 })
      const oldSources = [...context.oscillators]
      engine.selectLesson(1)
      assert.equal(engine.getSnapshot().status, 'idle')
      assert.equal(engine.getSnapshot().bpm, 60)
      assert.equal(engine.getSnapshot().position, 0)
      assert.ok(oldSources.every(s => s.stopTimes.at(-1)! <= context.currentTime + 0.02))
      engine.dispose()
    }
  }
})

test('shruti volume is retained before startup and ramps live without restarting reeds', async () => {
  const { engine, context } = setup()
  engine.setDroneVolume(0.4)
  assert.equal(context.gains.length, 0)
  await engine.setDrone(true)
  const gain = context.gains[1]
  assert.equal(gain.gain.value, 0.4)
  const voices = context.oscillators.length
  engine.setDroneVolume(0)
  assert.deepEqual(gain.gain.events.at(-1), { kind: 'linear', value: 0, time: 0.03 })
  engine.configure({ baseHz: 220 })
  assert.equal(engine.getSnapshot().droneVolume, 0)
  engine.setDroneVolume(0.7)
  assert.equal(context.oscillators.length, voices * 2)
  assert.equal(engine.getSnapshot().drone, true)
  engine.setDroneVolume(NaN)
  assert.equal(engine.getSnapshot().droneVolume, 0.7)
  engine.setDroneVolume(2)
  assert.equal(engine.getSnapshot().droneVolume, 1)
  engine.dispose()
})

test('canvas clock reads fractional audio position without publishing and freezes on pause', async () => {
  const { engine, context } = setup()
  await engine.play()
  const snapshot = engine.getSnapshot()
  context.currentTime = 0.148456
  near(engine.getPlaybackPosition(), 0.123456)
  assert.equal(engine.getSnapshot(), snapshot)
  context.baseLatency = 0.03
  context.outputLatency = 0.02
  near(engine.getPlaybackPosition(), 0.073456)
  engine.pause()
  const paused = engine.getPlaybackPosition()
  context.currentTime += 1
  near(engine.getPlaybackPosition(), paused)
  const revision = engine.getPlaybackRevision()
  engine.seek(paused + 0.1)
  assert.ok(engine.getPlaybackRevision() > revision)
  near(engine.getPlaybackPosition(), paused + 0.1)
  engine.reset()
  assert.equal(engine.getPlaybackPosition(), 0)
  engine.dispose()
})

test('canvas clock follows loop wraps and live kaalam rebasing', async () => {
  const { engine, context, advance } = setup()
  engine.configure({ loopMode: 'avartanam' })
  await engine.play()
  advance(8.15)
  near(engine.getPlaybackPosition(), 0.125)
  for (const kaalam of [2, 3, 1] as Kaalam[]) {
    const position = engine.getPlaybackPosition()
    engine.configure({ kaalam })
    near(engine.getPlaybackPosition(), position)
    context.currentTime += 0.125
    near(engine.getPlaybackPosition(), position + 0.1 / unitDuration(60, kaalam))
  }
  engine.selectChapter('alankaras')
  assert.equal(engine.getPlaybackPosition(), 0)
  engine.dispose()
})
