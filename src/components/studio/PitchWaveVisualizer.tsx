import { useEffect, useRef } from 'react'
import type { CarnaticAudio } from '../../hooks/useCarnaticAudio'
import { getChapter } from '../../data/curriculum'
import { lessonRaga, lessonTala } from '../../data/lessonMetadata'
import { lessonUnits, notesPerBeat, unitDuration } from '../../audio/transport'
import { contourAt, contourPitches, pitchLevel, pitchRacks, visibleBeats } from './pitchContour'
import type { SwaraNote } from '../../types/carnatic'

function drawLabel(ctx: CanvasRenderingContext2D, note: SwaraNote, x: number, y: number) {
  ctx.textAlign = 'right'
  ctx.font = '12px Georgia, serif'
  ctx.fillText(note.swara[0], x, y + 4)
  if (note.swara.length > 1) {
    ctx.font = '8px system-ui'
    ctx.fillText(note.swara.slice(1), x + 6, y + 7)
  }
  for (let i = 0; i < Math.abs(note.octave); i++) {
    ctx.beginPath()
    ctx.arc(x - 4 + (i - (Math.abs(note.octave) - 1) / 2) * 4, y + (note.octave > 0 ? -8 : 11), 1.1, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function PitchWaveCanvas({ audio }: { audio: CarnaticAudio }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { engine } = audio
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let frame = 0
    let disposed = false
    let width = 0
    let height = 0
    let previousRevision = engine.getPlaybackRevision()
    let previousPosition = 0
    let trailStart = 0
    let previousStatus = engine.getSnapshot().status
    let modelKey = ''
    let model: ReturnType<typeof buildModel>
    function buildModel() {
      const state = engine.getSnapshot()
      const lesson = getChapter(state.chapterId).lessons[state.lessonNumber - 1]
      const units = lessonUnits(state.lessonNumber, state.kaalam, state.chapterId)
      const raga = lessonRaga(lesson)
      return { units, pitches: contourPitches(units), racks: pitchRacks(raga, units), tala: lessonTala(lesson) }
    }
    function draw() {
      frame = 0
      if (disposed) return
      const state = engine.getSnapshot()
      const key = [state.chapterId, state.lessonNumber, state.kaalam].join(':')
      const position = engine.getPlaybackPosition()
      if (modelKey !== key) {
        modelKey = key
        model = buildModel()
        trailStart = position
      }
      const { units, pitches, racks, tala } = model
      const revision = engine.getPlaybackRevision()
      if (revision !== previousRevision || position < previousPosition || Math.abs(position - previousPosition) > 1 || state.status !== previousStatus) trailStart = position
      previousRevision = revision
      previousPosition = position
      previousStatus = state.status
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = Math.max(270, racks.length * 24 + 82)
      const dpr = window.devicePixelRatio || 1
      if (canvas!.width !== Math.round(width * dpr) || canvas!.height !== Math.round(height * dpr)) {
        canvas!.width = Math.round(width * dpr)
        canvas!.height = Math.round(height * dpr)
        canvas!.style.height = height + 'px'
      }
      if (width < 1) return
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, width, height)
      const left = 48, right = width - 16, top = 44, bottom = height - 34
      const perBeat = notesPerBeat(state.kaalam)
      const span = visibleBeats(width, perBeat, tala.aksharas) * perBeat
      const origin = Math.min(Math.max(0, units.length - span), Math.max(0, position - span * 0.3))
      const x = (unit: number) => left + (unit - origin) / span * (right - left)
      const low = pitchLevel(racks[0]) - 0.55
      const high = pitchLevel(racks[racks.length - 1]) + 0.55
      const y = (pitch: number) => bottom - (pitch - low) / (high - low) * (bottom - top)
      ctx!.lineWidth = 1
      for (const note of racks) {
        const level = y(pitchLevel(note))
        ctx!.strokeStyle = 'rgba(133, 103, 59, 0.12)'
        ctx!.beginPath()
        ctx!.moveTo(left, level)
        ctx!.lineTo(right, level)
        ctx!.stroke()
        ctx!.fillStyle = '#876a45'
        drawLabel(ctx!, note, left - 16, level)
      }
      ctx!.save()
      ctx!.beginPath()
      ctx!.rect(left, 0, right - left, height)
      ctx!.clip()
      for (let beat = Math.floor(origin / perBeat); beat <= Math.ceil((origin + span) / perBeat); beat++) {
        const beatInCycle = beat % tala.aksharas
        const cycleStart = beatInCycle === 0
        const anga = tala.angas.find(item => item.beats[0] === beatInCycle + 1)
        const at = x(beat * perBeat)
        ctx!.strokeStyle = cycleStart ? 'rgba(217, 119, 6, 0.4)' : 'rgba(133, 103, 59, 0.14)'
        ctx!.lineWidth = cycleStart ? 1.5 : 1
        ctx!.beginPath()
        ctx!.moveTo(at, top - 6)
        ctx!.lineTo(at, bottom + 5)
        ctx!.stroke()
        ctx!.fillStyle = '#998263'
        ctx!.font = '9px system-ui'
        ctx!.textAlign = 'left'
        ctx!.fillText(String(beatInCycle + 1), at + 4, bottom + 20)
        if (cycleStart) ctx!.fillText('CYCLE ' + (Math.floor(beat / tala.aksharas) + 1), at + 4, 14)
        if (anga) ctx!.fillText(anga.name.replace(/ [12]$/, '') + ' · ' + anga.symbol, at + 4, 30)
      }
      const end = Math.min(units.length, origin + span)
      const step = span / Math.max(1, Math.ceil((right - left) / 3))
      const path = new Path2D()
      path.moveTo(x(origin), y(contourAt(pitches, units, origin)))
      // Hermite cubic Béziers sampled densely enough to retain the small attacks.
      const derivative = (p: number) => (contourAt(pitches, units, p + 0.001) - contourAt(pitches, units, p - 0.001)) / 0.002
      for (let p = origin; p < end - 1e-8; p += step) {
        const q = Math.min(end, p + step)
        const third = (q - p) / 3
        path.bezierCurveTo(x(p + third), y(contourAt(pitches, units, p) + derivative(p) * third), x(q - third), y(contourAt(pitches, units, q) - derivative(q) * third), x(q), y(contourAt(pitches, units, q)))
      }
      const fill = new Path2D(path)
      fill.lineTo(x(end), bottom)
      fill.lineTo(x(origin), bottom)
      fill.closePath()
      const gradient = ctx!.createLinearGradient(0, top, 0, bottom)
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.17)')
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0.01)')
      ctx!.fillStyle = gradient
      ctx!.fill(fill)
      ctx!.strokeStyle = '#D97706'
      ctx!.lineWidth = 2
      ctx!.shadowColor = '#F59E0B'
      ctx!.shadowBlur = 5
      ctx!.stroke(path)
      ctx!.shadowBlur = 0
      const beadX = x(position), beadY = y(contourAt(pitches, units, position))
      if (state.status === 'playing') {
        const tail = Math.max(trailStart, position - 0.8 / unitDuration(state.bpm, state.kaalam), origin)
        if (position > tail) {
          ctx!.save()
          ctx!.beginPath()
          ctx!.rect(x(tail), top - 10, Math.max(0, beadX - x(tail)), bottom - top + 20)
          ctx!.clip()
          const glow = ctx!.createLinearGradient(x(tail), 0, beadX, 0)
          glow.addColorStop(0, 'rgba(245,158,11,0)'); glow.addColorStop(1, '#fbbf24')
          ctx!.strokeStyle = glow
          ctx!.lineWidth = 3.5
          ctx!.shadowColor = '#F59E0B'
          ctx!.shadowBlur = 10
          ctx!.stroke(path)
          ctx!.restore()
        }
      }
      ctx!.strokeStyle = 'rgba(217,119,6,0.18)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(beadX, top)
      ctx!.lineTo(beadX, bottom)
      ctx!.stroke()
      ctx!.fillStyle = '#fff3bf'
      ctx!.shadowColor = '#F59E0B'
      ctx!.shadowBlur = 14
      ctx!.beginPath()
      ctx!.arc(beadX, beadY, 4.5, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.shadowBlur = 0
      ctx!.restore()
      // Small diagnostic attributes permit read-only browser timing verification.
      canvas!.dataset.position = position.toFixed(6)
      canvas!.dataset.beat = String(Math.floor(Math.min(position, units.length - 1) / perBeat) % tala.aksharas + 1)
      canvas!.dataset.windowStart = origin.toFixed(6)
      canvas!.dataset.status = state.status
      canvas!.dataset.kaalam = String(state.kaalam)
      if (state.status === 'playing') frame = requestAnimationFrame(draw)
    }
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(draw) }
    const unsubscribe = engine.subscribe(schedule)
    const observer = new ResizeObserver(schedule)
    observer.observe(canvas)
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      unsubscribe()
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [engine])
  return <canvas ref={canvasRef} className="pitch-wave-canvas" role="img" aria-label="Continuous lesson pitch contour with swara pitch levels and tala beat boundaries">Your browser does not support the pitch contour canvas. Follow the swaras in the notation below.</canvas>
}

export function PitchWaveVisualizer({ audio }: { audio: CarnaticAudio }) {
  return <section className="pitch-wave-panel" aria-labelledby="pitch-wave-title">
    <div className="pitch-wave-heading"><h3 id="pitch-wave-title">The melody in motion</h3><span>SWARA · PITCH · TALAM</span></div>
    <PitchWaveCanvas audio={audio} />
    <p>A vocal-style contour of the lesson. Follow the golden bead with your voice; curves suggest movement between written swaras.</p>
  </section>
}
