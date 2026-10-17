import assert from 'node:assert/strict'
import { test } from 'node:test'
import { swaras, arohanam, avarohanam, frequency, formatSwara } from '../src/data/swaras'
import { adiTalam, kriyas } from '../src/data/talas'
import { saraliVarisai, parseNotation } from '../src/data/saraliVarisai'
import type { Kaalam } from '../src/types/carnatic'

test('12 ascending positions have 16 unique names and exactly the required raga ratios', () => {
  assert.equal(swaras.length, 12)
  const names = swaras.flatMap(s => s.names.map(n => n.id))
  assert.equal(names.length, 16)
  assert.equal(new Set(names).size, 16)
  assert.deepEqual(swaras.filter(s => s.mayamalavagowla).map(s => s.ratio), [1, 16/15, 5/4, 4/3, 3/2, 8/5, 15/8])
  assert.ok(swaras.every((s, i) => i === 0 || s.ratio > swaras[i - 1].ratio))
  assert.deepEqual(avarohanam, [...arohanam].reverse())
  assert.equal(frequency(1, 130.81, 1), 261.62)
  assert.equal(formatSwara({ swara: 'D1', octave: -1 }), 'D\u0323₁')
  assert.equal(formatSwara({ swara: 'R1', octave: 1 }), 'R\u0307₁')
})

test('Adi cycle contains the complete 4 + 2 + 2 gesture sequence', () => {
  assert.deepEqual(adiTalam.angas.map(a => a.beats.length), [4, 2, 2])
  assert.deepEqual(adiTalam.beats.map(b => b.kriya), ['thattu', 'kanishta', 'anamika', 'madhyama', 'thattu', 'veechu', 'thattu', 'veechu'])
  assert.deepEqual(adiTalam.angas.flatMap(a => a.beats), [1,2,3,4,5,6,7,8])
  assert.equal(kriyas.length, 5)
})

test('all 14 lessons preserve holds, octave transitions and complete cycles at every speed', () => {
  assert.equal(saraliVarisai.length, 14)
  // Independently counted from the reference edition, including karvais.
  const expectedHolds = [0,0,0,0,2,0,2,0,0,7,5,2,3,5]
  saraliVarisai.forEach((lesson, i) => {
    assert.equal(lesson.number, i + 1)
    assert.equal(lesson.units.length, i === 0 ? 16 : 32)
    assert.equal(lesson.units.filter(u => u.kind === 'hold').length, expectedHolds[i], 'hold count in lesson ' + lesson.number)
    assert.equal(lesson.units[0].kind, 'note')
    assert.deepEqual(lesson.units.at(-1), { kind: 'note', note: { swara: 'S', octave: 0 } })
    assert.deepEqual(lesson.sections.flatMap(s => s.units), lesson.units)
    for (const kaalam of [1, 2, 3] as Kaalam[]) {
      const mapping = lesson.kaalams[kaalam]
      assert.equal(mapping.notesPerBeat, 2 ** (kaalam - 1))
      const flattened = mapping.avartanams.flatMap(cycle => {
        assert.deepEqual(cycle.beats.map(b => b.akshara), [1,2,3,4,5,6,7,8])
        cycle.beats.forEach(beat => assert.equal(beat.units.length, mapping.notesPerBeat))
        return cycle.beats.flatMap(beat => beat.units)
      })
      assert.deepEqual(flattened, Array.from({ length: mapping.repetitions }, () => lesson.units).flat())
    }
  })
  assert.equal(saraliVarisai[0].kaalams[3].repetitions, 2)
  assert.deepEqual(saraliVarisai[2].units[19], { kind: 'note', note: { swara: 'S', octave: 1 } })
  assert.deepEqual(saraliVarisai[3].units[15], { kind: 'note', note: { swara: 'S', octave: 1 } })
  assert.throws(() => parseNotation('x'))
})



