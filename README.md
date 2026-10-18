# Sangeetha Bodhini

An interactive Carnatic music foundation for students and teachers. The Theory page and Practice Studio include 50 lessons: 14 Sarali, 12 Janta, 5 Melsthayi, 2 Dhatu, 8 Sapta Tala Alankaras and 9 Geethams, direct swara audition, a sustained harmonium-style electronic shruti box, three-kaalam playback and seven ragam profiles, synchronized multi-tala guidance and aligned Geetham lyrics.

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
- `src/data/talas.ts`: Adi plus Dhruva, Matya, Rupaka, Jhampa, Triputa, Ata and two Eka jatis; generated angas and six gesture types.
- `src/data/curriculum.ts`: shared chapter catalog and lookup; chapter identity is carried by the audio transport and score.
- `src/data/saraliVarisai.ts`: Chapter 1, all 14 Sarali exercises with holds and directional or mixed sections.
- `src/data/jantaVarisai.ts`: Chapter 2, 12 Janta exercises labelled 1–10 plus 5A and 8A, with paired/triple attacks, holds and explicit directional sections.
- `src/data/melsthayiVarisai.ts`: Chapter 3, five exact textbook exercises reaching upper Pa, including upper-Sa holds.
- `src/data/dhatuVarisai.ts`: Chapter 4, both exact textbook step/skip sequences and descending phrases.
- `src/data/notation.ts`, `textbook.ts` and `composition.ts`: foundation/source parsers, raga-aware swara variants, mandra/tara notation, hold durations, strict tala-bar validation, and complete variable-length cycles at all three kaalams.
- `src/data/ragas.ts` and `lessonMetadata.ts`: seven asymmetric scale profiles, audited JI ratios, and foundation defaults.
- `src/data/alankaras.ts` / `alankaraScores.json`: Chapter 5, eight source exercises; Sankeerna Eka uses Version 1 only.
- `src/data/geethams.ts` / `geethamScores.json`: Chapter 6, nine ordered compositions, metadata, source notes and one aligned lyric token per notation unit.
- `tests/fixtures/advanced-notation.json`: raw source swaras/sahityam and HTML-derived registers. `scripts/fetch-curriculum.py` refreshes the review fixture using Python 3 and curl in WSL; production transcriptions require review before updating.
- `tests/fixtures/textbook-notation.json`: fetched reference notation with source URLs and text-view line numbers.
- `src/components/theory/`: swarasthana matrix, manual gesture guide and five-register chart.
- `src/components/common/`: navigation, swara notation, shared shruti/drone controls and heritage tribute.
- `src/components/studio/`: lesson selector, controls, live talam tracker and clickable notation grid.
- `src/hooks/useCarnaticAudio.ts`: shared audio engine lifecycle and external-store subscription.
- `src/hooks/useTalamTimer.ts`: beat/kriya derived from the audio-clock cursor.
- `src/audio/`: sample-clock scheduling, warm melody voices, additive reed synthesis in `shrutiVoice.ts`, holds and chapter-aware transport math.
- `src/index.css`: Tailwind v4 `@theme` palette and typography tokens.
- `src/assets/Tanpura.tsx`: original vector illustration, no remote asset dependency.

The project uses Vite + React + TypeScript, Tailwind v4's Vite plugin, Lucide React, Framer Motion and the Vite template's Oxlint. Fonts use local Palatino/Georgia and Segoe UI/system fallbacks, so rendering has no font network dependency.

The chapter labels are enlarged. Arohanam/avarohanam diagrams explain pitch direction, and the kaalam guide compares 1, 2 and 4 swaras per steady beat. Double octave dots are rendered side by side using explicit visual marks. Shruti offers all 12 chromatic tonics from C3 to B3 (including flat aliases), defaulting to G♯3 / A♭3 (207.65 Hz).

Click any swarasthana button to hear that pitch immediately; click a sthayi card to hear Sa in that register (Anumandra, Mandra, Madhya, Tara or Ati-Tara). Clicking a selected card replays it. Toggle raga highlights, step through the eight kriyas, and change the tonic. Use Start shruti box for the sustained drone. In Practice Studio, choose Sarali (14), Janta (12), Melsthayi (5) or Dhatu (2), select an exercise, choose Vilamba, Madhyama or Dhurita Kalam and press Play. Adjust tempo between 45 and 90 BPM, click a note to seek, and loop a whole lesson or the current avartanam. Pause preserves your place; Reset returns to the beginning. The drone has an independent toggle.

## Curriculum conventions and sources

The architecture is `sangeetha_bodhini_plan.md`; there is no separate `plan.md`.

The Sarali 14-exercise sequence is checked against [Shivkumar Kalyanaraman's Sarali Varisai reference](https://www.shivkumar.org/music/basics/sarali-varisai.htm), notation credited there to Rani and Chitraveena Ravikiran. Teachers and editions use different sequences; this identifies the chosen edition rather than claiming a single universal version. Descriptions and UI prose are original.

Janta uses the teacher-requested sequence: 1, 2, 3, 4, 5, 5A, 6, 7, 8, 8A, 9, 10 (12 exercises). It draws on the traditional patterns in [Shivkumar Kalyanaraman's Janta Varisai reference](https://www.shivkumar.org/music/basics/janta-varisai.htm), with custom reordering and extensions. New 3/4/5 are former 4/5/3; 6–8 are unchanged; 5A mirrors 5 within each four-note window; 8A combines the supplied held, paired and triple-note rows; 9 uses four-note leaps; former 9 is now 10. Printed labels are separate from one-based playback ordinals. Exercise 1's printed ascent is completed with its mirrored descent. Extensions use five scalar windows in each direction, ending at tara Sa without exceeding it. Each supplied 16-unit line fills eight beats at second kaalam and regroups at first/third kaalam. Repeated notes are separate attacks, while commas extend the preceding voice. Playback provides fixed-pitch articulation; vocal sphurita technique and gamakas still require teacher guidance.

Chapters 3 and 4 transcribe all rows from the [Melsthayi reference](https://www.shivkumar.org/music/basics/melsthayi-varisai.htm) and [Dhatu reference](https://www.shivkumar.org/music/basics/dhatu-varisai.htm), fetched on 2026-10-17. All 80 rows retain their note case, commas and 4 + 2 + 2 bars; phrase dashes add no duration. Melsthayi has 4/6/8/10/12 source avartanams and two four-unit upper-Sa attacks in every exercise. The maximum registers are upper Ri/Ri/Ga/Ma/Pa. Its mixed upper-register phrases remain separate from the scale ascent and final descent. Dhatu has 20 rows per exercise, split into ten ascending and ten descending phrases. To match your book, Dhatu lesson 1 is reference exercise 2 (alternating steps and skips), and lesson 2 is reference exercise 1 (single skips and zigzag returns). Uppercase S/R/G/M/P map to tara Sa/Ri/Ga/Ma/Pa and render with upper dots. At faster kaalams, complete lessons repeat only when required to fill the cycle; no holds or notes are altered.

- Dataset lowercase symbols are madhya; uppercase are tara. A comma is one unit of continuation (karvai), never a rest. Slashes separate eight-unit first-speed cycles.
- In Sarali, obvious case slips in exercises 3 (descending phrase restarts) and 4 (ascent ending) are normalized to upper Sa.
- In Sarali, ascent/descent phrases are explicit for exercises 1–9. Exercises 10–14 contain mixed phrases, so they retain phrase sections. Every lesson also includes the full raga reference scales.
- First, second and third kaalam group 1, 2 and 4 notation units per beat. Each mapping follows the lesson's tala: 4, 6, 7, 8, 9, 10 or 14 beats per avartanam. When needed, a complete lesson repeats to finish a cycle; lesson 1 repeats twice at third speed. No rests are inserted and notes are never truncated. Holds remain continuations across beat and cycle boundaries.
- Octave offsets are -2 to +2; displayed dots go below/above. Geethams also include mandra notes; printed register marks are retained.
- Tuning uses the selected 12-position just-intonation profile checked against Sambamoorthy, Book IV, Table V: R3/G2 = 6/5, D3/N2 = 9/5, and M2 = 45/32. Mayamalavagowla is unchanged. Western A440 anchors retain full precision, with display-only rounding. See [the tuning audit](docs/tuning-audit.md) for all ratios, historical naming differences, sources and octave checks. These fixed pitches do not model gamakas or claim universal performance intonation.
- Adi Talam is Chatusra Jathi Triputa: one four-count laghu and two two-count dhrithams. The finger illustrations are schematic; the names and text describe the movement.
- The heritage section uses commemorative stamps for Purandara Dasa, Thyagaraja, Dikshitar and Syama Sastri. Each image links to its Wikimedia source; attribution and licences are retained in `public/portraits/CREDITS.md`.

## Audio behavior and verification

Live kaalam changes preserve phrase position and regroup the notation. Switching exercises or chapters stops and resets the score, and restores tempo to 60 BPM with looping off, while retaining tonic, kaalam and the independent drone. Pending melody and audition voices are cancelled. All audio stops when the browser tab is hidden.

The electronic shruti box uses four additive reeds: mandra Pa (3/4), pure tara Sa (2/1), tara Sa sharpened by 3.5 cents, and madhya Sa (1/1). Their gain levels are 0.075, 0.045, 0.035 and 0.06 respectively, balancing bass body, upper-tonic shimmer and the centered tonic. The badge reads P̣ · Ṡ · S (Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa). Harmonics include the fundamental, prominent second and third harmonics, and diminishing fifth, seventh and ninth overtones. A 1000 Hz low-pass filter with Q 2.4 shapes the reeds. A 0.2 Hz bellows LFO modulates amplitude and cutoff by 1.2%. A 350 ms attack and 120 ms release avoid abrupt starts/stops. The sound sustains until stopped, with no plucks or looping sample seams. It is synthesized rather than a recording of a particular instrument.

Current automated checks cover 95 tests, including all Janta, Melsthayi, Dhatu, Alankaram and Geetham lessons at all three kaalams, chapter switching, reed detuning/modulation, sustained audio, retuning and source cancellation. Typecheck, production build and lint pass.

See [audio architecture and measured verification](docs/audio-architecture.md) for scheduling, lifecycle and transport details. To run real offline-render and live audio-clock checks, open `http://localhost:5173/tests/audio-browser.html` while Vite runs, then click Run audio checks. This test harness is not included in the production build.

## Sapta Tala Alankaras and Geethams

Chapter 5 follows the [Alankaram reference](https://www.shivkumar.org/music/basics/alankaram.htm): Dhruva 14, Matya 10, Rupaka 6, Mishra Jhampa 10, Tisra Triputa 7, Khanda Ata 14, Chatushra Eka 4 and Sankeerna Eka 9. All 76 selected source rows retain their exact anga groupings and holds.

Chapter 6 preserves the written notation and lyric lines from the nine supplied references in this order:

| Lesson | Composition / notation reference | Ragam | Tala angas |
| --- | --- | --- | --- |
| 1 | [Sri Gananatha (Lambodara)](https://www.shivkumar.org/music/varnams/lambodara-geetham.htm) | Malahari | Rupaka 2 + 4 |
| 2 | [Kunda Goura](https://www.shivkumar.org/music/varnams/kundagoura-geetham.htm) | Malahari | Rupaka 2 + 4 |
| 3 | [Keraya Neeranu](https://www.shivkumar.org/music/varnams/kerayaneeranu-geetham.htm) | Malahari | Triputa 3 + 2 + 2 |
| 4 | [Padumanabha](https://www.shivkumar.org/music/varnams/padumanabha-geetham.htm) | Malahari | Triputa 3 + 2 + 2 |
| 5 | [Analekara](https://www.shivkumar.org/music/varnams/analekara-geetham.htm) | Suddha Saveri | Triputa 3 + 2 + 2 |
| 6 | [Vara Veena](https://www.shivkumar.org/music/varnams/varaveena-geetham.htm) | Mohanam | Rupaka 2 + 4 |
| 7 | [Kamalajadala](https://www.shivkumar.org/music/varnams/kamalajathala-kalyani-geetham.htm) | Kalyani | Triputa 3 + 2 + 2 |
| 8 | [Re Re Srirama Chandra](https://www.shivkumar.org/music/varnams/reresrirama-arabhi-geetham.htm) | Arabhi | Triputa 3 + 2 + 2 |
| 9 | [Sri Ramachandra](https://www.shivkumar.org/music/varnams/srirama-bhairavi-geetham.htm) | Bhairavi | Dhruva 4 + 2 + 4 + 4 |

Sri Ramachandra uses the source's Dhruva grouping, explicitly confirmed for this project. Keraya/Padumanabha headings say Chathurasra but their notation groups 3 + 2 + 2. Kamalajadala's source calls it Misra Chapu (Triputa), printing 3 + 4; this Studio uses the requested Tisra Triputa teaching count. The score regroups sequential units without changing durations.

The Geetham HTML convention differs from the exercise pages: plain capitals are madhya, bold capitals are tara, and lowercase letters are mandra. Import preserves that formatting before normalization. Some repeated phrases omit register styling in the source; these remain as printed rather than silently inferred. Scale metadata follows the requested modern profiles (Malahari G3, Mohanam G3, Arabhi N3/G3, Bhairavi M1), correcting conflicting scale-header subscripts. Bhairavi D1/D2 remains explicit per score note.

Merged lyric syllables are split only where needed for beat alignment: Padumanabha's ksha-ka, Analekara's sthra-pu, Vara Veena's nchi-tha, and Kamalajadala's ma-la / naa-extension. Kamalajadala's final D P–M dash separates a phrase without adding a beat. The raw source fixture preserves these original forms. Parenthesized textual return cues are documented but not automatically expanded into a performed reprise.

Swara and lyric tokens share one clickable highlighted cell; holds continue the preceding synthesized voice across tala boundaries. Composer attributions absent from the notation pages are cross-checked against linked karnATik references; Analekara remains unspecified. Ragam scales, composer metadata, tala formula and composition-specific source notes appear above the tracker.

Shruti volume is adjustable from 0–100% in Theory and Studio, independently of lesson playback. Long laghus count Angushta (thumb) after Tarjani.

## Continuous pitch contour

The Studio's **The melody in motion** canvas sits directly above the notation. It draws the active ragam's ascending and descending pitch vocabulary, including any lower or upper registers required by the exercise. Octave dots and swara subscripts label logarithmically spaced pitch racks. Beat dividers follow the active tala, with anga labels and cycle markers.

A warm amber Hermite curve joins written pitches. Repeated attacks receive a subtle dip; karvais breathe gently without a fresh attack. This is a vocal-style illustration of the score, not microphone pitch detection or a transcription of performed gamakas; the audio synthesis remains unchanged. The golden bead reads the engine's output-compensated AudioContext position on each animation frame. The window scrolls continuously and displays fewer beats at Madhyama Kalam and Dhurita Kalam to retain note detail.

Pause freezes the bead at the audible position and clears its trail. Reset and chapter/lesson changes return it to the origin; seeking and loop wraps relocate it to the matching score position without a stale trail. Live tempo, speed and tonic controls remain synchronized. Canvas resolution follows its container and device pixel ratio, with animation, subscriptions and resize observation cleaned up on unmount. Synchronization is limited by display refresh and device latency; microsecond display accuracy is not physically achievable.

Studio keeps notation references in the curriculum sidebar. Ragam information uses larger text without repeated source links or transcription notes. The compact Shruti card groups tonic, volume and start/stop controls. Heritage portraits use four commemorative stamps, each linked to its source; attribution is retained in `public/portraits/CREDITS.md`.
