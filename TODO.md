# Sangeetha Bodhini
Architecture: `sangeetha_bodhini_plan.md` (`plan.md` is absent).

## Step 1 — foundations (complete)
- [x] Read architecture and verify WSL Node/npm.
- [x] Scaffold Vite, React, TypeScript, Tailwind, Lucide and Framer Motion.
- [x] Configure palette and typography tokens.
- [x] Define reusable Carnatic types.
- [x] Add 12 pitch positions / 16 names and relative ratios.
- [x] Add Adi Talam anatomy, eight beats and five gestures.
- [x] Add 14 Sarali Varisai lessons, holds and eight-beat mappings for three speeds.
- [x] Build responsive Theory page: pitch explorer, gestures, sthayis, shruti setup and heritage tribute.
- [x] Document sources, notation and local run instructions.
- [x] Verify data, TypeScript, lint, build and running Vite server.
- [x] User review of data and Introduction page; tuning audit accepted.

## Step 2 — practice studio (complete)
- [x] Web Audio synthesis and swara audition; drone upgraded to an electronic shruti box below.
- [x] Look-ahead scheduler, talam clock and 45–90 BPM controls.
- [x] Studio lesson selector and notation grid.
- [x] Three-kaalam playback with synchronized notes and kriyas.
- [x] Pause/reset, speed changes and lesson/avartanam loops.
- [x] Browser audio/timing verification and static deployment readiness.



## Introduction review refinements
- [x] Enlarge first-step navigation and section numbers.
- [x] Add ascending/descending scale diagrams and explanations.
- [x] Explain three kaalams with an interactive subdivision comparison.
- [x] Render both octave dots horizontally above/below the swara.
- [x] Offer all 12 shruti keys with G♯3 as the default.
- [x] Replace symbolic silhouettes with attributed internet images.

## Tuning audit
- [x] Check the selected 12-position JI profile against Sambamoorthy's 22-shruti chart.
- [x] Correct R3/G2 to 6/5 and D3/N2 to 9/5; document M2 and historical naming variants.
- [x] Verify Mayamalavagowla through Tara Sa at 2/1.
- [x] Calculate full-precision C3–B3 anchors from A440; retain G♯3 default.
- [x] Add ratio, frequency and octave regression tests plus source notes.

## Direct playback and kalam labels (complete)
- [x] Play swaras directly when clicking explorer notes; remove the separate Play swara button.
- [x] Audition Sa from all five sthayi cards, including repeated selections.
- [x] Display Prathama, Dwithiya and Thrithiya kaalam in lesson controls and metadata.

## Initial electronic shruti box and Chapter 2 (superseded by corrections below)
- [x] Add a separate additive reed voice with fundamental, second, third and gently diminishing odd overtones.
- [x] Add ±2 cent double reeds, a resonant 1000 Hz low-pass filter (Q 2.4), and 0.2 Hz bellows modulation at 1.2% depth.
- [x] Sustain Sa and Pa with a softer lower Pa; add smooth attack, stop and retuning ramps.
- [x] Introduce shared curriculum types, chapter catalog, notation parsing and kaalam mapping.
- [x] Preserve Chapter 1's 14 Sarali exercises and add Chapter 2's 9 sourced Janta exercises.
- [x] Preserve paired attacks, triple-note patterns and karvais in ascending and descending sections.
- [x] Add Studio chapter navigation, chapter-aware score and transport; reset safely when changing chapters.
- [x] Update landing-page curriculum copy, chapter source links and README.
- [x] Add tests for every Janta exercise in all three kaalams, chapter switching and reed lifecycle.
- [x] Run 26 automated tests, typecheck, production build and lint.
- [x] Complete browser audio/UI verification: all 12 tonics sustain without clipping, five octave cards replay, both chapters navigate correctly, Janta playback advances, and the drone stops independently. Measurements are recorded in docs/audio-architecture.md.

## Chapter 2 corrections and Panchama drone (2026-10-17)
- [x] Follow the explicit 12-item sequence: 1, 2, 3, 4, 5, 5A, 6, 7, 8, 8A, 9, 10. The requested numeric total of 11 conflicts with the named list; all named exercises are retained.
- [x] Reorder 3/4/5 from former 4/5/3; verify complete note sequences against commit a067154.
- [x] Add 5A's reverse symmetric four-note windows in both directions.
- [x] Preserve Lessons 6, 7 and 8 exactly, including notes, registers and karvais.
- [x] Add 8A's supplied held/paired/triple patterns, five ascending windows through tara Sa and symmetric descent.
- [x] Add the complete textbook leap-pattern Lesson 9 and move previous 9 unchanged to 10.
- [x] Keep printed lesson labels separate from playback ordinals; show 5A and 8A in the selector and active heading.
- [x] Regroup every exercise into complete eight-beat cycles at 1/2/4 units per beat; verify every onset and hold duration without timing drift.
- [x] Change sustained voicing to mandra Pa, pure tara Sa, tara Sa at +3.5 cents, and madhya Sa; rebalance reed levels and harmonics.
- [x] Update both shared drone badges/tooltips to P̣ · Ṡ · S (Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa).
- [x] Pass all 30 tests, typecheck, build and lint; browser checks pass for all 12 tonics, ordered lesson labels, 5A/8A headings, 8A live playback with 40 holds, and the updated badge/tooltip.

## Chapters 3 and 4 — exact textbook notation (2026-10-17)
- [x] Fetch and inspect the requested Melsthayi and Dhatu HTML references; retain all 80 source rows with URLs and text-view line numbers in a regression fixture.
- [x] Add all five Melsthayi exercises (4/6/8/10/12 printed avartanams), preserving uppercase registers, both upper-Sa karvais, mixed phrases and final descent.
- [x] Add both Dhatu exercises, each with ten ascending and ten descending source rows.
- [x] Validate every source row's 4 + 2 + 2 grouping; ignore printed phrase dashes without adding timing units.
- [x] Add both chapters to the typed catalog and shared Studio selector; update landing copy and documentation for 33 total exercises.
- [x] Reset score scrolling on chapter/exercise changes; verify transport, playhead, active note and queued voice reset across every chapter pair.
- [x] Test all new exercises' parsing, registers, holds, beat mappings, exact audio onsets and completion in all three kaalams.
- [x] Pass upper-Sa–Pa browser pitch checks and render all seven exercises at all three speeds without clipping or release leakage; verify the four chapter options, live playback, dots and smooth navigation reset.

- [x] Pass all 46 tests, typecheck, lint, production build and a separate TypeScript check of test/browser harness files.

## Remaining scope
- [ ] User listening review of the synthesized reed timbre on their own speakers/headphones.
- [ ] Expressive vocal sphurita/gamaka modeling; current Janta playback uses separately articulated fixed pitches.
- [ ] Additional curriculum chapters beyond Sarali, Janta, Melsthayi and Dhatu.
