import assert from 'node:assert/strict'
import { test } from 'node:test'
import { swaras, arohanam, avarohanam, frequency, formatSwara, shrutiKeys, defaultShrutiIndex } from '../src/data/swaras'
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




test('shruti covers all 12 pitch classes and defaults to G sharp', () => {
  assert.equal(shrutiKeys.length, 12)
  assert.equal(shrutiKeys[defaultShrutiIndex].label, 'G♯3 / A♭3')
  assert.equal(shrutiKeys[defaultShrutiIndex].hz.toFixed(2), '207.65')
  assert.ok(shrutiKeys.every((key, i) => i === 0 || key.hz > shrutiKeys[i - 1].hz))
  assert.equal(formatSwara({ swara: 'S', octave: -2 }), 'S\u0324')
  assert.equal(formatSwara({ swara: 'S', octave: 2 }), 'S\u0308')
})

test('all modern aliases use the audited JI ratios and matching rational labels', () => {
  const expected = [
    [['S'], 1, '1/1'], [['R1'], 16/15, '16/15'], [['R2', 'G1'], 9/8, '9/8'],
    [['R3', 'G2'], 6/5, '6/5'], [['G3'], 5/4, '5/4'], [['M1'], 4/3, '4/3'],
    [['M2'], 45/32, '45/32'], [['P'], 3/2, '3/2'], [['D1'], 8/5, '8/5'],
    [['D2', 'N1'], 5/3, '5/3'], [['D3', 'N2'], 9/5, '9/5'], [['N3'], 15/8, '15/8'],
  ] as const
  swaras.forEach((position, i) => {
    assert.deepEqual(position.names.map(name => name.id), expected[i][0])
    assert.equal(position.ratio, expected[i][1])
    assert.equal(position.ratioLabel, expected[i][2])
    const [numerator, denominator] = position.ratioLabel.split('/').map(Number)
    assert.equal(position.ratio, numerator / denominator)
  })
})

test('Mayamalavagowla resolves every note and octave to the required ratios', () => {
  const resolve = (note: (typeof arohanam)[number], baseHz: number) => {
    const position = swaras.find(s => s.names.some(name => name.id === note.swara))
    assert.ok(position)
    return frequency(position.ratio, baseHz, note.octave)
  }
  assert.deepEqual(arohanam.map(note => resolve(note, 1)), [1, 16/15, 5/4, 4/3, 3/2, 8/5, 15/8, 2])
  // Independent Hz fixtures at the 240 Hz reference used in Sambamoorthy's chart.
  assert.deepEqual(arohanam.map(note => resolve(note, 240)), [240, 256, 300, 320, 360, 384, 450, 480])
  assert.deepEqual(avarohanam.map(note => resolve(note, 240)), [480, 450, 384, 360, 320, 300, 256, 240])
})

test('all twelve unrounded A440 anchors and octave transpositions match reference frequencies', () => {
  const referenceHz = [
    130.8127826502993, 138.59131548843604, 146.8323839587038, 155.56349186104043,
    164.81377845643496, 174.61411571650194, 184.9972113558172, 195.99771799087463,
    207.65234878997256, 220, 233.08188075904496, 246.94165062806206,
  ]
  const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, actual + ' ≠ ' + expected)
  shrutiKeys.forEach((anchor, i) => {
    near(anchor.hz, referenceHz[i])
    near(frequency(1, anchor.hz, -1), referenceHz[i] / 2)
    near(frequency(1, anchor.hz, 0), referenceHz[i])
    near(frequency(1, anchor.hz, 1), referenceHz[i] * 2)
    // Ratio and register compose: lower Pa and upper Pa remain pure fifths.
    near(frequency(3/2, anchor.hz, -1), referenceHz[i] * 3/4)
    near(frequency(3/2, anchor.hz, 1), referenceHz[i] * 3)
  })
  const baseHz = shrutiKeys[defaultShrutiIndex].hz
  near(frequency(1, baseHz, -1), 103.82617439498628)
  near(frequency(1, baseHz, 0), 207.65234878997256)
  near(frequency(1, baseHz, 1), 415.3046975799451)
})
