# Sangeetha Bodhini

An interactive Carnatic music foundation for students and teachers. The Theory page and Practice Studio include 14 Sarali Varisai exercises, 9 Janta Varisai exercises, direct swara audition, a sustained harmonium-style electronic shruti box, three-kaalam playback and synchronized Adi Talam guidance.

## Run locally in WSL

Node.js 22.12+ (verified: 22.22.1) and npm (verified: 9.2.0). pnpm is optional and was not installed.

```bash
cd /home/sudarsan_s/projects/sangeetha_bodhini
npm install
npm run dev
```

Open the localhost URL printed by Vite, normally http://localhost:5173. WSL localhost forwarding allows access from Windows. Stop with Ctrl+C. The lockfile pins the installed versions; use `npm ci` for reproducible clean installs.

```bash
npm test
npm run test:data
npm run test:audio
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Architecture and scope

- `src/types/carnatic.d.ts`: shared domain types.
- `src/data/swaras.ts`: 12 positions, 16 names, raga scales, relative ratios, shruti keys.
- `src/data/talas.ts`: Adi's 4 + 2 + 2 angas, all eight beats and five kriyas.
- `src/data/curriculum.ts`: shared chapter catalog and lookup; chapter identity is carried by the audio transport and score.
- `src/data/saraliVarisai.ts`: Chapter 1, all 14 Sarali exercises with holds and directional or mixed sections.
- `src/data/jantaVarisai.ts`: Chapter 2, Janta exercises 1–9 with paired/triple attacks, holds and explicit ascent/descent sections.
- `src/data/notation.ts`: common notation parser and complete eight-akshara mappings for all three kaalams.
- `src/components/theory/`: swarasthana matrix, manual gesture guide and five-register chart.
- `src/components/common/`: navigation, swara notation, shared shruti/drone controls and heritage tribute.
- `src/components/studio/`: lesson selector, controls, live talam tracker and clickable notation grid.
- `src/hooks/useCarnaticAudio.ts`: shared audio engine lifecycle and external-store subscription.
- `src/hooks/useTalamTimer.ts`: beat/kriya derived from the audio-clock cursor.
- `src/audio/`: sample-clock scheduling, warm melody voices, separate additive double-reed synthesis in `shrutiVoice.ts`, holds and chapter-aware transport math.
- `src/index.css`: Tailwind v4 `@theme` palette and typography tokens.
- `src/assets/Tanpura.tsx`: original vector illustration, no remote asset dependency.

The project uses Vite + React + TypeScript, Tailwind v4's Vite plugin, Lucide React, Framer Motion and the Vite template's Oxlint. Fonts use local Palatino/Georgia and Segoe UI/system fallbacks, so rendering has no font network dependency.

The chapter labels are enlarged. Arohanam/avarohanam diagrams explain pitch direction, and the kaalam guide compares 1, 2 and 4 swaras per steady beat. Double octave dots are rendered side by side using explicit visual marks. Shruti offers all 12 chromatic tonics from C3 to B3 (including flat aliases), defaulting to G♯3 / A♭3 (207.65 Hz).

Click any swarasthana button to hear that pitch immediately; click a sthayi card to hear Sa in that register (Anumandra, Mandra, Madhya, Tara or Ati-Tara). Clicking a selected card replays it. Toggle raga highlights, step through the eight kriyas, and change the tonic. Use Start shruti box for the sustained drone. In Practice Studio, choose Sarali Varisai (14 exercises) or Janta Varisai (9 exercises), select an exercise, choose Prathama, Dwithiya or Thrithiya kaalam and press Play. Adjust tempo between 45 and 90 BPM, click a note to seek, and loop a whole lesson or the current avartanam. Pause preserves your place; Reset returns to the beginning. The drone has an independent toggle.

## Curriculum conventions and sources

The architecture is `sangeetha_bodhini_plan.md`; there is no separate `plan.md`.

The Sarali 14-exercise sequence is checked against [Shivkumar Kalyanaraman's Sarali Varisai reference](https://www.shivkumar.org/music/basics/sarali-varisai.pdf), notation credited there to Rani and Chitraveena Ravikiran. Teachers and editions use different sequences; this identifies the chosen edition rather than claiming a single universal version. Descriptions and UI prose are original.

Janta exercises 1–9 follow the traditional patterns in [Shivkumar Kalyanaraman's Janta Varisai reference](https://www.shivkumar.org/music/basics/janta-varisai.pdf), which credits Rani and Chitraveena Ravikiran. The reference includes additional exercises beyond the nine in this chapter. Exercise 1's printed ascent is completed with its mirrored descent, as shown in the reference's third-speed illustration. Exercises 2–9 move scalar windows in both directions; 6, 7 and 9 preserve the printed karvais. Repeated notes are separate attacks, while commas extend the preceding voice. Playback provides fixed-pitch articulation; vocal sphurita technique and gamakas still require teacher guidance.

- Dataset lowercase symbols are madhya; uppercase are tara. A comma is one unit of continuation (karvai), never a rest. Slashes separate eight-unit first-speed cycles.
- Obvious case slips in exercises 3 (descending phrase restarts) and 4 (ascent ending) are normalized to upper Sa.
- Ascent/descent phrases are explicit for exercises 1–9. Exercises 10–14 contain mixed phrases, so they retain phrase sections. Every lesson also includes the full raga reference scales.
- First, second and third kaalam group 1, 2 and 4 notation units per beat. Each mapping has eight beats per avartanam. When needed, a complete lesson repeats to finish a cycle; lesson 1 repeats twice at third speed. No rests are inserted and notes are never truncated. Holds remain continuations across beat and cycle boundaries.
- Octave offsets are -2 to +2; displayed dots go below/above. These lessons use madhya and tara; the model supports lower-register Dha/Ni.
- Tuning uses the selected 12-position just-intonation profile checked against Sambamoorthy, Book IV, Table V: R3/G2 = 6/5, D3/N2 = 9/5, and M2 = 45/32. Mayamalavagowla is unchanged. Western A440 anchors retain full precision, with display-only rounding. See [the tuning audit](docs/tuning-audit.md) for all ratios, historical naming differences, sources and octave checks. These fixed pitches do not model gamakas or claim universal performance intonation.
- Adi Talam is Chatusra Jathi Triputa: one four-count laghu and two two-count dhrithams. The finger illustrations are schematic; the names and text describe the movement.
- The heritage section uses Wikimedia images: a Purandara Dasa statue photograph, a historical Thyagaraja painting, and India Post stamps for Dikshitar and Syama Sastri. Sources and licences appear on the page and in `public/portraits/CREDITS.md`.

## Audio behavior and verification

Live kaalam changes preserve phrase position and regroup the notation. Switching exercises or chapters stops and resets the score, while retaining tonic, kaalam, tempo, looping preference and the independent drone. All audio stops when the browser tab is hidden.

The electronic shruti box uses simultaneous Sa (1/1), Pa (3/2) and soft lower Pa (3/4). Two additive reeds per pitch are detuned by ±2 cents and mixed at 56%/44% to retain warmth without complete cancellation. Harmonics include the fundamental, prominent second and third harmonics, and diminishing fifth, seventh and ninth overtones. A 1000 Hz low-pass filter with Q 2.4 shapes the reeds. A 0.2 Hz bellows LFO modulates amplitude and cutoff by 1.2%. A 350 ms attack and 120 ms release avoid abrupt starts/stops. The sound sustains until stopped, with no plucks or looping sample seams. It is synthesized rather than a recording of a particular instrument.

Current automated checks cover 26 tests, including every Janta exercise at all three kaalams, chapter switching, reed detuning/modulation, sustained audio, retuning and source cancellation. Typecheck, production build and lint pass.

See [audio architecture and measured verification](docs/audio-architecture.md) for scheduling, lifecycle and transport details. To run real offline-render and live audio-clock checks, open `http://localhost:5173/tests/audio-browser.html` while Vite runs, then click Run audio checks. This test harness is not included in the production build.
