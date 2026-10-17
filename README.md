# Sangeetha Bodhini

An interactive Carnatic music foundation for students and teachers. The Theory page and 14-lesson Practice Studio include synthesized swaras, a Panchama tanpura drone, three-kaalam playback and synchronized Adi Talam guidance.

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
- `src/data/saraliVarisai.ts`: all 14 lessons with objectives, directional or mixed sections, and complete eight-akshara mappings for three kaalams.
- `src/components/theory/`: swarasthana matrix, manual gesture guide and five-register chart.
- `src/components/common/`: navigation, swara notation, shared shruti/drone controls and heritage tribute.
- `src/components/studio/`: lesson selector, controls, live talam tracker and clickable notation grid.
- `src/hooks/useCarnaticAudio.ts`: shared audio engine lifecycle and external-store subscription.
- `src/hooks/useTalamTimer.ts`: beat/kriya derived from the audio-clock cursor.
- `src/audio/`: sample-clock scheduling, warm voices, holds and transport math.
- `src/index.css`: Tailwind v4 `@theme` palette and typography tokens.
- `src/assets/Tanpura.tsx`: original vector illustration, no remote asset dependency.

The project uses Vite + React + TypeScript, Tailwind v4's Vite plugin, Lucide React, Framer Motion and the Vite template's Oxlint. Fonts use local Palatino/Georgia and Segoe UI/system fallbacks, so rendering has no font network dependency.

The chapter labels are enlarged. Arohanam/avarohanam diagrams explain pitch direction, and the kaalam guide compares 1, 2 and 4 swaras per steady beat. Double octave dots are rendered side by side using explicit visual marks. Shruti offers all 12 chromatic tonics from C3 to B3 (including flat aliases), defaulting to G♯3 / A♭3 (207.65 Hz).

Select any pitch, toggle the raga highlights, step through the eight kriyas, compare sthayis and change the tonic. Use Play swara to audition a selected pitch, or Start tanpura for the drone. In Practice Studio, select any of the 14 lessons, choose 1x/2x/4x and press Play. Adjust tempo between 45 and 90 BPM, click a note to seek, and loop a whole lesson or the current avartanam. Pause preserves your place; Reset returns to the beginning. The drone has an independent toggle.

## Curriculum conventions and sources

The architecture is `sangeetha_bodhini_plan.md`; there is no separate `plan.md`.

The traditional 14-exercise sequence is checked against [Shivkumar Kalyanaraman's Sarali Varisai reference](https://www.shivkumar.org/music/basics/sarali-varisai.pdf), notation credited there to Rani and Chitraveena Ravikiran. Teachers and editions use different sequences; this identifies the chosen edition rather than claiming a single universal version. Descriptions and UI prose are original.

- Dataset lowercase symbols are madhya; uppercase are tara. A comma is one unit of continuation (karvai), never a rest. Slashes separate eight-unit first-speed cycles.
- Obvious case slips in exercises 3 (descending phrase restarts) and 4 (ascent ending) are normalized to upper Sa.
- Ascent/descent phrases are explicit for exercises 1–9. Exercises 10–14 contain mixed phrases, so they retain phrase sections. Every lesson also includes the full raga reference scales.
- First, second and third kaalam group 1, 2 and 4 notation units per beat. Each mapping has eight beats per avartanam. When needed, a complete lesson repeats to finish a cycle; lesson 1 repeats twice at third speed. No rests are inserted and notes are never truncated. Holds remain continuations across beat and cycle boundaries.
- Octave offsets are -2 to +2; displayed dots go below/above. These lessons use madhya and tara; the model supports lower-register Dha/Ni.
- Tuning uses the selected 12-position just-intonation profile checked against Sambamoorthy, Book IV, Table V: R3/G2 = 6/5, D3/N2 = 9/5, and M2 = 45/32. Mayamalavagowla is unchanged. Western A440 anchors retain full precision, with display-only rounding. See [the tuning audit](docs/tuning-audit.md) for all ratios, historical naming differences, sources and octave checks. These fixed pitches do not model gamakas or claim universal performance intonation.
- Adi Talam is Chatusra Jathi Triputa: one four-count laghu and two two-count dhrithams. The finger illustrations are schematic; the names and text describe the movement.
- The heritage section uses Wikimedia images: a Purandara Dasa statue photograph, a historical Thyagaraja painting, and India Post stamps for Dikshitar and Syama Sastri. Sources and licences appear on the page and in `public/portraits/CREDITS.md`.

## Audio behavior and verification

Step 1 and its tuning audit were reviewed before Step 2. Live speed changes preserve phrase position and regroup the notation; switching lessons stops playback. All audio stops when the browser tab is hidden. The tanpura is synthesized with the lower-Pa, upper-Sa, Sa, Sa pattern.

See [audio architecture and measured verification](docs/audio-architecture.md) for scheduling, lifecycle and transport details. To run real offline-render and live audio-clock checks, open `http://localhost:5173/tests/audio-browser.html` while Vite runs, then click Run audio checks. This test harness is not included in the production build.
