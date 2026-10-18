# Sangeetha Bodhini implemented architecture

This document supersedes the original Sarali-only MVP proposal. The completed app is a static React + TypeScript application built by Vite, with 50 lessons across six chapters.

## Product and curriculum

Theory covers 12 swarasthanams / 16 swara names, Adi Talam and hand gestures, three kaalams, five sthayis, pitch audition and the electronic shruti box. Studio covers Sarali (14), Janta (12: 1–10 plus 5A/8A), Melsthayi (5), Dhatu (2), Sapta Tala Alankaras (8) and Geethams (9 with swara/sahityam).

Seven ragam profiles use the audited Just Intonation subset described in [the tuning audit](docs/tuning-audit.md). Lesson metadata selects the ragam and tala; foundation lessons default to Mayamalavagowla and Adi. Variable-length cycles support 4/6/7/8/9/10/14 beats. Karvais extend the preceding note, and complete lessons repeat only when necessary to fill a cycle at faster kaalams.

## Implementation

- `src/App.tsx`: Theory/Studio navigation using React state, shared tonic and engine lifecycle.
- `src/components/theory/`: swara explorer, gestures, sthayi chart, scale directions and kaalam explanation.
- `src/components/studio/`: chapter/lesson selection, audio controls, talam tracker, notation and pitch contour canvas.
- `src/components/common/`: navigation, swara glyphs, shared Shruti controls and heritage stamps.
- `src/data/`: typed chapter catalog, reviewed scores, notation/composition parsing, ragam ratios and tala definitions.
- `src/audio/`: clock-based scheduler, transport helpers, warm melody synthesis and additive reed synthesis.
- `src/hooks/`: shared engine lifetime/store subscription and derived talam cursor.
- `src/types/carnatic.d.ts`: shared musical domain types.
- `src/assets/Tanpura.tsx`: original inline vector illustration; `public/portraits/` contains four credited stamps.
- `tests/`: deterministic curriculum/engine regressions, source fixtures and the developer browser audio harness.

React 19, Tailwind v4, Lucide React and Framer Motion provide the UI. System fonts remove font downloads. Web Audio synthesis removes audio-sample downloads. No backend, router package, microphone input or persistence service is required.

## Audio and visualization

One lazily created AudioContext drives sample-clock onsets, talam and score highlighting. Playback offers 45–90 BPM and 1/2/4 notation units per beat, independent sustained Panchama Shruti, pause/reset/seek and lesson/current-avartanam loops. The shared engine survives Theory/Studio navigation and stops audio when the tab is hidden.

PitchWaveCanvas in `src/components/studio/PitchWaveVisualizer.tsx` draws a responsive high-DPI contour using requestAnimationFrame and the output-compensated clock. Curves illustrate written swaras without changing the fixed-pitch synthesis. See [audio architecture](docs/audio-architecture.md) for node graphs, frequencies and lifecycle behavior.

## Verification and release

Use Node.js 22.12+ and npm inside WSL. Run lint, typecheck, all tests and the production build before release. Use the browser harness for real synthesis measurements and preview the static build for asset/runtime checks. Production contains the app and credited local assets; source fixtures and the developer harness stay out of `dist/`.

[README](README.md) documents lesson sources and editorial decisions. [TODO](TODO.md) records completion and optional future work. [Deployment](docs/deployment.md) documents hosting configuration and release checks.
