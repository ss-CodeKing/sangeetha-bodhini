import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CarnaticAudioEngine } from '../src/audio/CarnaticAudioEngine'
import type { EngineRuntime } from '../src/audio/CarnaticAudioEngine'
import { DRONE_STRINGS, noteFrequency, unitDuration } from '../src/audio/transport'
import type { Kaalam } from '../src/types/carnatic'

class Param {
  value = 0
  events: { kind: string; value: number; time: number }[] = []
  setValueAtTime(value: number, time: number) { this.value = value; this.events.push({ kind: 'set', value, time }) }
  linearRampToValueAtTime(value: number, time: number) { this.events.push({ kind: 'linear', value, time }) }
  exponentialRampToValueAtTime(value: number, time: number) { this.events.push({ kind: 'exponential', value, time }) }
  cancelAndHoldAtTime(time: number) { this.events.push({ kind: 'cancel', value: this.value, time }) }
}
class Node {
  gain = new Param()
  frequency = new Param()
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
  onstatechange: (() => void) | null = null
  createGain() { return new Node() }
  createBiquadFilter() { return new Node() }
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

test('drone uses lower Pa, upper Sa, tonic Sa, tonic Sa and stops independently', async () => {
  const { engine, advance, fundamentals } = setup()
  assert.deepEqual(DRONE_STRINGS.map(note => noteFrequency(note, 200)), [150, 400, 200, 200])
  engine.configure({ baseHz: 200 })
  await engine.setDrone(true)
  advance(3)
  assert.deepEqual(fundamentals().map(node => node.frequency.value), [150, 400, 200, 200])
  fundamentals().forEach((node, i) => near(node.startTime, 0.025 + i * 0.85))
  await engine.play()
  engine.pause()
  assert.equal(engine.getSnapshot().drone, true)
  await engine.setDrone(false)
  assert.equal(engine.getSnapshot().drone, false)
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
