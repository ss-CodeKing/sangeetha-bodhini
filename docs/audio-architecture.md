# Audio, transport and curriculum

## Clock and lifecycle

`src/audio/CarnaticAudioEngine.ts` owns one lazily created AudioContext with interactive latency. A recursive 25 ms timeout wakes a 120 ms look-ahead scheduler; onsets derive from an AudioContext epoch and notation position. Timer callbacks do not count musical beats. Late wakes rejoin the current phrase without playing a backlog. Playback rebases with a 25 ms scheduling lead.

The UI uses `getOutputTimestamp()` when available, extrapolated with performance time and clamped to currentTime. Otherwise it subtracts reported baseLatency and outputLatency. `src/hooks/useTalamTimer.ts` derives beat, subdivision and kriya from that output-compensated cursor without a separate metronome timer. `getPlaybackPosition()` provides fractional reads between store updates without publishing React state.

`src/hooks/useCarnaticAudio.ts` owns engine lifetime and the shared external-store subscription. AudioContext creation/resume follows a user gesture. The engine survives Theory/Studio navigation, pauses melody on return to Theory, stops all audio when the tab is hidden, and closes the context on unmount. Interruptions and unlock failures surface through the app alert.

## Node graph and synthesis

```text
Melody/audition: partial oscillators → partial gains → envelope → low-pass ┐
                                                                       ├→ master gain → compressor → analyser → output
Shruti reeds: periodic oscillator → low-pass → pressure → envelope       │
                                                       → drone gain ───┘
Bellows oscillator → depth gains → pressure gain and reed filter cutoff
```

`src/audio/voice.ts` mixes a fundamental sine (0.72), fundamental triangle (0.23) and second-harmonic sine (0.05). The melody filter is low-pass at 2600 Hz, Q 0.3. Attack is at most 25 ms and release at most 65 ms, shortened for brief notes; sustain is 80% of the initial peak. Melody/audition voice level is 0.23. Cancellation holds the in-flight envelope, fades over 15 ms and stops sources after 20 ms. A karvai extends the preceding voice rather than inserting a rest or another attack.

`src/audio/transport.ts` defines the shared `DRONE_VOICES` mix used in live and offline rendering:

| Reed | Ratio to Sa | Detuning | Gain | Hz at default G♯3 Sa |
| --- | --- | --- | --- | --- |
| Mandra Pa | 3/4 | 0 cents | 0.075 | 155.7393 |
| Tara Sa | 2/1 | 0 cents | 0.045 | 415.3047 |
| Tara Sa chorus | 2/1 | +3.5 cents | 0.035 | 416.1452 |
| Madhya Sa | 1/1 | 0 cents | 0.060 | 207.6523 |

The badge is P̣ · Ṡ · S: Panchama Shruti, Mandra Pa · Tara Sa · Madhya Sa. The two tara reeds create the chorus; the bass and middle reeds are not detuned. Frequencies use full precision: baseHz × ratio × 2^octave × 2^(cents/1200).

`src/audio/shrutiVoice.ts` uses an unnormalized PeriodicWave with amplitudes 0.52/0.23/0.14/0.065/0.03/0.015 at harmonics 1/2/3/5/7/9. Each reed passes through a 1000 Hz low-pass filter, Q 2.4. Its 0.2 Hz bellows LFO modulates pressure by 0.012 and cutoff by 12 Hz; pitch stays fixed. The envelope rises over 350 ms, sustains until stopped, then releases over 120 ms. Sources stop 5 ms after release and disconnect on ended. The release anchors the envelope at the cancellation time, including a future stop or a stop during attack. Retuning fades old reeds and starts the new chord.

Drone volume uses a separate gain before the master, defaults to 1 and ramps to 0–1 over 30 ms without restarting voices. Melody and auditions bypass it. Master gain is 0.75; the dynamics compressor has threshold −18 dB, ratio 3, attack 20 ms and release 180 ms. The output analyser has fftSize 256. Melody, drone and audition sources are tracked and cancelled independently.

Ratios originate in `src/data/swaras.ts` and resolve through `src/data/ragas.ts`. The default tonic is G♯3 / A♭3, 207.652348790 Hz. All 12 chromatic C3–B3 anchors use A4 = 440 Hz; octave scaling is applied once. See [tuning audit](tuning-audit.md) for the 12-position / 16-name subset of the 22-shruti framework. The engine does not synthesize gamakas or infer Bhairavi D1/D2 from direction.

## Transport and notation

- Play resumes fractional progress; completed lessons restart. Pause cancels queued melody and preserves position. Reset returns to zero; the drone remains independently controlled.
- Tempo is 45–90 BPM, initially 60. Vilamba, Madhyama and Durita Kaalam (UI: “Dhurita Kalam”) place 1/2/4 notation units per beat. `unitDuration` is 60 / BPM / unitsPerBeat.
- Live tempo/kaalam/tonic changes cancel queued melody and rebase at the current phrase position. Speed changes regroup notation and talam without dropping karvais.
- Lesson looping wraps the mapped score. Avartanam looping captures the current cycle; seeking selects a new cycle.
- Selecting a chapter or exercise cancels pending Play/audition requests, stops queued melody/audition sources, resets position and tempo to 60 BPM, and turns looping off. Chapter changes select lesson 1. Tonic, kaalam, drone and drone volume remain selected.
- `src/components/studio/NotationGrid.tsx` follows the active note inside its own scroll area, resets scrolling on lesson/chapter changes and highlights swara/sahityam together.

`src/data/curriculum.ts` catalogs all 50 lessons: Sarali 14, Janta 12, Melsthayi 5, Dhatu 2, Alankaras 8 and Geethams 9. Printed Janta labels 5A/8A are distinct from playback ordinals. `lessonMetadata.ts` resolves the active ragam/tala with foundation defaults Mayamalavagowla/Adi. `talas.ts` defines nine tala configurations and seven kriya types, supporting 4/6/7/8/9/10/14-beat cycles. All chapters use the same scheduler.

`notation.ts` maps complete lessons to cycles, repeating only when necessary at a selected kaalam. `textbook.ts` validates Melsthayi/Dhatu 4 + 2 + 2 rows. `composition.ts` supports raga-specific variants, octave registers and holds; strict Alankaram rows preserve angas, while Geetham units regroup sequentially into the selected tala. Sahityam has one token per source notation unit and repeats by source index when a mapping repeats a lesson. Holds can cross beats and cycles. No padding rests or truncated phrases are introduced.

Source fixtures remain in `tests/fixtures/`; `scripts/fetch-curriculum.py` refreshes review data without overwriting production scores. [README](../README.md) records notation sources, register ambiguities, lyric splits, tala decisions and unexpanded textual reprise cues.

## Pitch contour canvas

`PitchWaveCanvas` lives in `src/components/studio/PitchWaveVisualizer.tsx`, above the notation. It uses requestAnimationFrame while playing and schedules a single frame for stationary updates/resizes. High-DPI backing pixels follow the container and devicePixelRatio. Model data is cached per chapter/lesson/kaalam; the draw loop does not set React state. Animation frames, subscriptions, ResizeObserver and window listeners are cleaned up on unmount.

`pitchContour.ts` maps JI ratios to logarithmic pitch racks from both ragam scale directions and every register needed by the lesson. Cubic Hermite transitions illustrate motion between pitches. Repeated attacks dip by at most 0.13 semitones and holds breathe by at most 0.018 semitones; these are visual effects and do not alter audio. The viewport adapts to kaalam and displays tala/anga/cycle boundaries. The bead reads the engine output clock every frame, with a 0.8-second trail cleared after transport discontinuities. Pause freezes position; reset returns to zero; seeking and looping relocate the bead.

The animation targets display refresh, typically 60 fps. Display refresh and hardware output latency bound observable synchronization; this is not microphone tracking or microsecond physical display accuracy.

## Verification

`npm run typecheck` checks app, Vite config, tests and the browser harness. `npm run test` runs 101 deterministic curriculum/engine tests: complete source sequences, lyric alignment, registers, all kaalams, exact onsets/holds, delayed wakes, pause/resume, live changes, loops, chapter reset, cancellation, drone levels and contour math. `npm run lint` and `npm run build` complete the release pipeline.

With Vite running, open `/tests/audio-browser.html` and click **Run audio checks**. This developer-only page uses real OfflineAudioContext renders for pitch, sustain, release, discontinuity and clipping checks, then measures live scheduling and cursor lag. It renders every Melsthayi, Dhatu, Alankaram and Geetham at all three speeds, 90 BPM and B3 tonic; all 12 drone tonics are checked. Tests, fixtures and the harness are outside the production entry and absent from `dist/`.

Historical browser measurements from the completed feature checks on 2026-10-17–18: melody peaks stayed below 0.235, drone/high-Sa raw mixed peaks were 0.2818–0.3316, and releases reached silence. Upper Sa/Ri/Ga/Ma/Pa at B3 matched 493.8833/526.8089/617.3541/658.5111/740.8250 Hz within 0.0002 Hz. At 60 BPM, kaalam onsets were 1.000/0.500/0.250 seconds apart. Prior observed maximum cursor/output lag was about 31 ms. These are browser measurements, not guarantees about every speaker/device or subjective timbre.

Release audit on 2026-10-18: the real browser harness passes all checks again. Live kaalam onset spacing is 1.000/0.500/0.250 seconds; maximum measured highlight/output lag is 24.2/22.0/26.0 ms. Live reed output peaks at RMS 0.1523, with successful retuning and independent stop. Production smoke checks confirm nonzero Geetham output, 108 aligned lyric cells for the first composition, canvas tracking at all three speeds, pause/reset, all six chapter counts and loaded stamps at root and subdirectory URLs. No browser warnings/errors were recorded. The canvas also fits a 390px viewport without page overflow.
