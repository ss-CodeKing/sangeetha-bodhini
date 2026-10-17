import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { swaras, arohanam, avarohanam, frequency, formatSwara, shrutiKeys, defaultShrutiIndex } from '../src/data/swaras'
import { adiTalam, kriyas } from '../src/data/talas'
import { saraliVarisai, parseNotation } from '../src/data/saraliVarisai'
import type { ChapterId, Kaalam, NotationUnit, SwaraId, SwaraNote } from '../src/types/carnatic'
import { parseAdiRow } from '../src/data/notation'
import { noteFrequency } from '../src/audio/transport'
import { melsthayiVarisai } from '../src/data/melsthayiVarisai'
import { dhatuVarisai } from '../src/data/dhatuVarisai'
import { jantaVarisai } from '../src/data/jantaVarisai'
import { curriculum } from '../src/data/curriculum'

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




test('four curriculum chapters preserve all 33 exercises in printed order', () => {
  assert.deepEqual(curriculum.map(chapter => [chapter.id, chapter.lessons.length]), [['sarali', 14], ['janta', 12], ['melsthayi', 5], ['dhatu', 2]])
  assert.deepEqual(jantaVarisai.map(lesson => lesson.label), ['1', '2', '3', '4', '5', '5A', '6', '7', '8', '8A', '9', '10'])
})

test('Janta reordered patterns, extensions and holds fill complete Adi cycles at every kaalam', () => {
  const firstRows = [
    's s r r g g m m', 's s r r g g m m', 's s r s s r s r',
    's s r r g s r g', 's s r r g g r r', 'm m g g r r g g',
    's s , r r , g g', 's , s r , r g g', 's s s r r r g g',
    's , s r , r g g', 's s m m g g r r', 's , r g , s r g',
  ]
  const expectedHolds = [0, 0, 0, 0, 0, 0, 20, 20, 0, 40, 0, 20]
  const expectedLengths = [32, 80, 160, 160, 160, 160, 160, 160, 160, 320, 160, 160]
  jantaVarisai.forEach((lesson, index) => {
    assert.equal(lesson.number, index + 1)
    assert.equal(lesson.units.length, expectedLengths[index])
    assert.deepEqual(lesson.units.slice(0, 8), parseNotation(firstRows[index]))
    assert.equal(lesson.units.filter(unit => unit.kind === 'hold').length, expectedHolds[index])
    assert.deepEqual(lesson.sections.flatMap(section => section.units), lesson.units)
    if (lesson.label !== '5A') {
      assert.deepEqual(lesson.sections[1].units[0], { kind: 'note', note: { swara: 'S', octave: 1 } })
      assert.deepEqual(lesson.units.at(-1), { kind: 'note', note: { swara: 'S', octave: 0 } })
    }
    lesson.units.forEach(unit => {
      if (unit.kind === 'note') assert.ok(arohanam.some(note => note.swara === unit.note.swara && note.octave === unit.note.octave))
    })
    for (const kaalam of [1, 2, 3] as Kaalam[]) {
      const mapping = lesson.kaalams[kaalam]
      const flattened = mapping.avartanams.flatMap(cycle => {
        assert.deepEqual(cycle.beats.map(beat => beat.akshara), [1, 2, 3, 4, 5, 6, 7, 8])
        cycle.beats.forEach(beat => assert.equal(beat.units.length, 2 ** (kaalam - 1)))
        return cycle.beats.flatMap(beat => beat.units)
      })
      assert.deepEqual(flattened, Array.from({ length: mapping.repetitions }, () => lesson.units).flat())
    }
  })
  assert.deepEqual(jantaVarisai[0].units, parseNotation('s s r r g g m m / p p d d n n S S / S S n n d d p p / m m g g r r s s'))
})

test('reordered 3–5, unchanged 6–8 and moved 10 preserve their committed note sequences', () => {
  // SHA-256 fixtures captured from the full units in commit a067154, before
  // reordering. These protect every note, register and hold, not just a prefix.
  const fingerprints = {
    '3': 'e18063e922d854e323b8d4837da2f0850a1c4f55625c9d61c48f6e94bee54b81',
    '4': '13fcd1b8207a77cec2fa2629b4c7f65c0eb80e31e303eb770457933973751df0',
    '5': 'a677e6ba6b0eefde3361db1c2de3e64c2c47d497870213f65c964cb953d35455',
    '6': '0f2ec73a2e1d368ea0402df5e870c87fd7cdc89aef77400a6495abaa6c083d09',
    '7': 'ae10a2abde1e23360f82760d1a91eaf94914528217911bb8f5c9403c2fb9552c',
    '8': 'c232a15cbfcbd630789c1e209398ddd2dd1d62420f7d6da6c21e2620814a0509',
    '10': '8e2b917c17da3d37ed7490615bc59804992c8baf6a3516785fc06d1393527fa6',
  }
  Object.entries(fingerprints).forEach(([label, expected]) => {
    const lesson = jantaVarisai.find(item => item.label === label)!
    assert.equal(createHash('sha256').update(JSON.stringify(lesson.units)).digest('hex'), expected, 'Lesson ' + label)
  })
})

test('5A is the within-window inverse of 5 across both directions', () => {
  const forward = jantaVarisai.find(lesson => lesson.label === '5')!
  const inverse = jantaVarisai.find(lesson => lesson.label === '5A')!
  assert.deepEqual(inverse.units.slice(0, 16), parseNotation('m m g g r r g g / m m g g r r s s'))
  const rank = (unit: (typeof forward.units)[number]) => {
    assert.equal(unit.kind, 'note')
    if (unit.kind !== 'note') throw Error('Unexpected hold')
    return arohanam.findIndex(note => note.swara === unit.note.swara && note.octave === unit.note.octave)
  }
  forward.sections.forEach((section, direction) => {
    const mirrored = inverse.sections[direction].units
    section.units.forEach((unit, index) => {
      const window = Math.floor(index / 16)
      assert.equal(rank(unit) + rank(mirrored[index]), direction === 0 ? window * 2 + 3 : 11 - window * 2)
    })
  })
})

test('8A preserves the supplied 32-unit cycles, upper turnaround and symmetric descent', () => {
  const lesson = jantaVarisai.find(item => item.label === '8A')!
  const expectedFirstCycles = [
    's , s r , r g g / s s , r r , g g / s s s r r r g g / s s r r g g m m',
    'r , r g , g m m / r r , g g , m m / r r r g g g m m / r r g g m m p p',
    'g , g m , m p p / g g , m m , p p / g g g m m m p p / g g m m p p d d',
  ]
  expectedFirstCycles.forEach((phrase, index) => assert.deepEqual(lesson.units.slice(index * 32, (index + 1) * 32), parseNotation(phrase)))
  assert.deepEqual(lesson.sections[0].units.slice(-32), parseNotation('p , p d , d n n / p p , d d , n n / p p p d d d n n / p p d d n n S S'))
  assert.deepEqual(lesson.sections[1].units.slice(0, 32), parseNotation('S , S n , n d d / S S , n n , d d / S S S n n n d d / S S n n d d p p'))
  assert.deepEqual(lesson.sections[1].units.slice(-32), parseNotation('m , m g , g r r / m m , g g , r r / m m m g g g r r / m m g g r r s s'))
  assert.equal(lesson.kaalams[2].avartanams.length, 20) // two cycles per scalar window
})

test('new Lesson 9 matches every textbook leap phrase in both directions', () => {
  const lesson = jantaVarisai.find(item => item.label === '9')!
  assert.deepEqual(lesson.units, parseNotation(
    's s m m g g r r / s s r r g g m m / r r p p m m g g / r r g g m m p p / ' +
    'g g d d p p m m / g g m m p p d d / m m n n d d p p / m m p p d d n n / ' +
    'p p S S n n d d / p p d d n n S S / S S p p d d n n / S S n n d d p p / ' +
    'n n m m p p d d / n n d d p p m m / d d g g m m p p / d d p p m m g g / ' +
    'p p r r g g m m / p p m m g g r r / m m s s r r g g / m m g g r r s s',
  ))
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

const sourceFixture = JSON.parse(readFileSync(new URL('./fixtures/textbook-notation.json', import.meta.url), 'utf8')) as {
  chapters: { id: ChapterId; url: string; exercises: { number: number; sourceRows: { notation: string }[] }[] }[]
}
const notationLetters: Partial<Record<SwaraId, string>> = { S: 's', R1: 'r', G3: 'g', M1: 'm', P: 'p', D1: 'd', N3: 'n' }
function encodeUnits(units: readonly NotationUnit[]) {
  return units.map(unit => unit.kind === 'hold' ? ',' : unit.note.octave === 1
    ? notationLetters[unit.note.swara]!.toUpperCase() : notationLetters[unit.note.swara]!)
}

for (const chapter of sourceFixture.chapters) {
  for (const exercise of chapter.exercises) {
    const lessonNumber = chapter.id === 'dhatu' ? 3 - exercise.number : exercise.number
    test(chapter.id + ' lesson ' + lessonNumber + ' matches source exercise ' + exercise.number + ' and 4+2+2 grouping', () => {
      const catalogChapter = curriculum.find(item => item.id === chapter.id)!
      const lesson = catalogChapter.lessons[lessonNumber - 1]
      assert.equal(lesson.number, lessonNumber)
      assert.equal(catalogChapter.source, chapter.url)
      assert.deepEqual(lesson.notation.split('\n'), exercise.sourceRows.map(row => row.notation))
      const expectedTokens = exercise.sourceRows.flatMap(row => {
        const groups = row.notation.replace(/\|\|$/, '').split('|')
        const tokens = groups.map(group => group.trim().split(/\s+/).filter(token => token !== '-'))
        assert.deepEqual(tokens.map(group => group.length), [4, 2, 2])
        return tokens.flat()
      })
      assert.deepEqual(encodeUnits(lesson.units), expectedTokens)
      assert.deepEqual(lesson.sections.flatMap(section => section.units), lesson.units)
      assert.deepEqual(lesson.arohanam, arohanam)
      assert.deepEqual(lesson.avarohanam, avarohanam)
      const expectedRows = chapter.id === 'melsthayi' ? [4, 6, 8, 10, 12][exercise.number - 1] : 20
      assert.equal(lesson.units.length, expectedRows * 8)
      assert.equal(lesson.units.filter(unit => unit.kind === 'hold').length, chapter.id === 'melsthayi' ? 6 : 0)
      assert.deepEqual(lesson.units.at(-1), { kind: 'note', note: { swara: 'S', octave: 0 } })
      for (const kaalam of [1, 2, 3] as Kaalam[]) {
        const mapping = lesson.kaalams[kaalam]
        const perBeat = 2 ** (kaalam - 1)
        const mapped = mapping.avartanams.flatMap(cycle => {
          assert.deepEqual(cycle.beats.map(beat => beat.akshara), [1, 2, 3, 4, 5, 6, 7, 8])
          cycle.beats.forEach(beat => assert.equal(beat.units.length, perBeat))
          assert.deepEqual([cycle.beats.slice(0, 4).length, cycle.beats.slice(4, 6).length, cycle.beats.slice(6).length], [4, 2, 2])
          return cycle.beats.flatMap(beat => beat.units)
        })
        assert.equal(mapped.length, mapping.avartanams.length * 8 * perBeat)
        assert.deepEqual(mapped, Array.from({ length: mapping.repetitions }, () => lesson.units).flat())
        if (kaalam === 1) {
          assert.equal(mapping.repetitions, 1)
          assert.deepEqual(mapping.avartanams.map(cycle => encodeUnits(cycle.beats.flatMap(beat => beat.units))), exercise.sourceRows.map(row => row.notation.split(/\s+/).filter(token => !['|', '||', '-'].includes(token))))
        }
      }
    })
  }
}

test('Melsthayi retains both four-unit upper-Sa attacks and reaches Ri/Ri/Ga/Ma/Pa', () => {
  const maxima = ['R1', 'R1', 'G3', 'M1', 'P']
  melsthayiVarisai.forEach((lesson, index) => {
    assert.deepEqual(lesson.units.slice(8, 16), parseNotation('S , , , S , , ,'))
    const highest = lesson.units.filter(unit => unit.kind === 'note')
      .reduce((best, unit) => noteFrequency(unit.note, 200) > noteFrequency(best, 200) ? unit.note : best, { swara: 'S', octave: 0 } as SwaraNote)
    assert.deepEqual(highest, { swara: maxima[index], octave: 1 })
    assert.deepEqual(lesson.sections[0].units, parseNotation('s r g m p d n S'))
    assert.deepEqual(lesson.sections.at(-1)!.units, parseNotation('S n d p m g r s'))
  })
  assert.equal(dhatuVarisai.length, 2)
})

test('upper-register parsing, diacritics and frequencies preserve the textbook register', () => {
  const notes = parseNotation('S R G M P')
  const ratios = [1, 16 / 15, 5 / 4, 4 / 3, 3 / 2]
  notes.forEach((unit, index) => {
    assert.equal(unit.kind, 'note')
    if (unit.kind !== 'note') return
    assert.equal(unit.note.octave, 1)
    assert.equal(noteFrequency(unit.note, 200), 200 * 2 * ratios[index])
    assert.ok(formatSwara(unit.note).includes('\u0307'))
  })
  assert.deepEqual(parseAdiRow('S R - S n | d p | m p ||'), parseNotation('S R S n d p m p'))
  assert.throws(() => parseAdiRow('s r g | m p | d n S ||'))
  assert.throws(() => parseAdiRow('s r g m p d n S'))
  assert.throws(() => parseAdiRow(', r g m | p d | n S ||'))
  assert.throws(() => parseAdiRow('s r g x | p d | n S ||'))
})
