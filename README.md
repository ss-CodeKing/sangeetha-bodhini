# Sangeetha Bodhini

An interactive Carnatic music foundation for students and teachers. Step 1 implements the theory page and typed curriculum; audio synthesis and the notation player are intentionally deferred pending review.

## Run locally in WSL

Node.js 22.12+ (verified: 22.22.1) and npm (verified: 9.2.0). pnpm is optional and was not installed.

```bash
cd /home/sudarsan_s/projects/sangeetha_bodhini
npm install
npm run dev
```

Open the localhost URL printed by Vite, normally http://localhost:5173. WSL localhost forwarding allows access from Windows. Stop with Ctrl+C. The lockfile pins the installed versions; use `npm ci` for reproducible clean installs.

```bash
npm run test:data
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
- `src/components/common/`: navigation, swara notation and heritage tribute.
- `src/index.css`: Tailwind v4 `@theme` palette and typography tokens.
- `src/assets/Tanpura.tsx`: original vector illustration, no remote asset dependency.

The project uses Vite + React + TypeScript, Tailwind v4's Vite plugin, Lucide React, Framer Motion and the Vite template's Oxlint. Fonts use local Palatino/Georgia and Segoe UI/system fallbacks, so rendering has no font network dependency.

The chapter labels are enlarged. Arohanam/avarohanam diagrams explain pitch direction, and the kaalam guide compares 1, 2 and 4 swaras per steady beat. Double octave dots are rendered side by side using explicit visual marks. Shruti offers all 12 chromatic tonics from C3 to B3 (including flat aliases), defaulting to G♯3 / A♭3 (207.65 Hz).

Select any pitch, toggle the raga highlights, step through the eight kriyas, compare sthayis and change the tonic. The Practice Studio navigation shows a curriculum preview. There is no audio playback yet: note audition, drone synthesis, the scheduler and synchronized three-speed player belong to Step 2.

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

## Review boundary

Review the three data files and Introduction page before implementing the Web Audio engine and the synchronized notation studio. See `TODO.md` for completed and deferred tasks.
