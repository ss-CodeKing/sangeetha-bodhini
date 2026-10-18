# Audio, transport and curriculum

## One clock

`CarnaticAudioEngine` owns one lazily created AudioContext. A 25 ms recursive timeout wakes a 120 ms look-ahead scheduler. Onsets derive from an AudioContext epoch and musical position, never from timer callback counts. Late wakes rejoin the current phrase rather than playing a backlog. See [Web Audio scheduling](https://web.dev/articles/audio-scheduling) and [scheduled source start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start).

The UI cursor follows the same timeline. It uses [getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp) to follow the output device, with reported latency as a fallback. The talam hook derives beat, subdivision and gesture from that cursor; it has no independent interval.

## Sound

Every swara uses the audited ratios in `swaras.ts`. A voice mixes 72% sine, 23% triangle and 5% second harmonic through a low-pass filter and a gentle envelope. A comma extends that voice's duration, including across beats. It never inserts a rest or a new attack.

The shared `DRONE_VOICES` configuration in `transport.ts` defines four sustained reeds: mandra Pa (3/4, gain 0.075), pure tara Sa (2/1, gain 0.045), tara Sa at +3.5 cents (2/1 before detuning, gain 0.035), and madhya Sa (1/1, gain 0.06). The pure and sharpened upper reeds create the chorus; bass and middle tonic remain unison. `shrutiVoice.ts` applies each reed's specified detuning and an additive harmonic profile. Amplitudes at 1f/2f/3f/5f/7f/9f are 0.52/0.23/0.14/0.065/0.03/0.015. The low-pass filter is 1000 Hz with Q 2.4. A 0.2 Hz LFO modulates amplitude and filter cutoff by 1.2%; it does not modulate the reference pitch. Gain rises over 350 ms, sustains, then fades over 120 ms before all reed and LFO sources stop and disconnect. The release explicitly anchors the current envelope value, including during an attack or a future scheduled stop. There are no plucks or sample-loop seams. Retuning fades old voices and starts the new chord. The hook owns lifecycle; the engine and voice factories own synthesis.

Selecting any swarasthana directly auditions its pitch. Each sthayi button auditions Sa in that register, from anumandra through ati-tara; selecting the same button again replays it. Lesson speed buttons use the names Vilamba Kalam, Madhyama Kalam and Dhurita Kalam.

Melody, drone and audition voices are tracked independently. Cancellation fades sounding voices and stops queued sources. A master compressor limits combined levels. Graphs disconnect after each voice, and the context closes on unmount.

## Transport behavior

- Play resumes the current phrase; completion offers Play again. Pause preserves fractional note progress. Resume uses a soft attack for the remaining duration.
- Reset stops melody and returns to the beginning. The drone has its own on/off button.
- Tempo is 45–90 BPM, initially 60. Three speeds place 1, 2 or 4 notation units in each beat.
- Live speed/tempo/pitch changes cancel queued melody and rebase the current musical position with a 25 ms scheduling lead. Speed changes regroup the score and its talam indices at that position; they do not wait for the end of a lesson. The remaining fraction of the current note uses the new duration.
- Whole-lesson looping wraps the mapped score. Current-avartanam looping captures the cycle containing the current cursor; seeking selects a new cycle.
- Selecting another exercise or chapter stops and resets melody. Chapter changes select exercise 1, reset tempo to 60 BPM and turn looping off; kaalam, tonic and the independent drone are retained. Theory navigation pauses melody. The drone may continue across Theory/Studio navigation.
- Hiding the browser tab stops all audio to avoid throttled background scheduling. Return and use Play or Start shruti box to resume.
- A browser interruption pauses melody; failures are visible in an alert. Context creation/resume occurs only after a user gesture.
- The grid follows the active note inside its own scroll area, keeping the page controls in place.

## Curriculum

`curriculum.ts` catalogs Sarali (14 exercises), Janta (12 exercises, printed as 1–10 plus 5A and 8A), Melsthayi (5), Dhatu (2), Sapta Tala Alankaras (8) and Geethams (9). Printed lesson labels are separate from one-based playback ordinals so extensions remain in the requested order. A chapter ID and exercise number travel together through engine state, score lookup, seeking, looping and completion. Common parsing and variable-cycle mappings live in `notation.ts`; composition parsing lives in `composition.ts`. All six chapters use the same scheduling path. Melsthayi and Dhatu preserve every fetched source row in `tests/fixtures/textbook-notation.json`. `parseAdiRow` verifies the printed 4 + 2 + 2 bars before `textbook.ts` builds lesson sections and three-kaalam mappings. Melsthayi keeps the initial scale, upper-Sa karvais, mixed upper-register phrases and final descent separate; Dhatu splits ten ascending and ten descending rows. Its lesson order follows the book: source exercise 2 becomes lesson 1, and source exercise 1 becomes lesson 2; the fetched fixture remains in original reference order. Uppercase S/R/G/M/P remain octave +1. Chapter/exercise selection also resets the notation scroll so the first active note remains visible. Janta pairs/triples are individual attacks; commas are sustained karvais. The Janta order and extensions follow the teacher's corrections to the traditional reference linked from the Studio. Lessons 3/4/5 are the former 4/5/3; 6–8 are unchanged; previous 9 is now 10. In 5A, the motif reverses within each four-note window while window positions traverse both directions. The supplied 8A 16-unit lines each fill an eight-beat avartanam at second kaalam; all units, holds and attacks regroup without padding or truncation at first/third kaalam. Five windows reach tara Sa without adding pitches above it. Fixed-pitch playback does not reproduce the full vocal sphurita ornament.

## Verification

`npm test` runs curriculum and deterministic engine tests. A fake audio clock exercises every kaalam, exact onsets, delayed wakes, completion, holds, pause/resume, live reconfiguration, loop boundaries, sustained drone envelopes, drone retuning and cancellation, all five audition registers and async cancellation.

For real Web Audio checks, run Vite, open `/tests/audio-browser.html` and click **Run audio checks**. This developer-only page is outside the production Vite entry. It renders voices with OfflineAudioContext, estimates their fundamental pitch and checks the envelope, then plays a short phrase at each speed and measures scheduling intervals and output/highlight lag.

Earlier baseline measurements in the in-app Chromium browser:
- Seven offline pitch renders matched the requested frequencies within 0.0001 Hz; no clipping or envelope discontinuity detected by the checks.
- At 60 BPM: first, second and third kaalam onsets were 1.000, 0.500 and 0.250 seconds apart.
- Maximum measured highlight/output lag: 18.4, 22.5 and 23.9 ms respectively.
- Live output analyser RMS was nonzero at all speeds; pause froze the cursor.
- Studio controls were exercised separately: live kaalam switching, 90 BPM, shruti changes, seeking a hold, selecting a lesson, current-cycle looping and independent drone operation.

Earlier three-pitch reed and nine-exercise chapter verification on 2026-10-17 (before the corrections below):
- All 26 deterministic curriculum and engine tests pass; every Janta exercise completes at all three kaalams with the expected individual attacks and held durations.
- Typecheck, production build and lint pass with zero errors or warnings.
- Browser OfflineAudioContext checks across all 12 tonics sustain the Sa–Pa–lower-Pa chord, overlap a high Sa audition and release to silence. Raw mixed peaks range from 0.2471 to 0.2742 (full scale = 1); the largest adjacent-sample step is 0.0338. These measurements precede the master compressor.
- Seven offline melody pitch checks pass; live onsets remain exactly 1.000/0.500/0.250 s apart at 60 BPM. Maximum highlight/output lag is 25.1/25.2/24.4 ms for the three kaalams.
- Live reed output, retuning, Janta playback and independent drone stop pass; maximum observed mixed output RMS is 0.1409.
- UI checks cover all 12 note cards and all five octave cards (including replay) without audio alerts, chapter navigation, Janta exercise 9 playback, score advancement, retained drone on pause/chapter change and reset to Sarali exercise 1.
- The responsive Studio controls and score were inspected in the browser. Subjective timbre approval on the user's audio hardware remains a listening-review step.

These measurements validate scheduled audio and browser output data. Perceived timbre and hardware latency can vary by device.

## Verification after the curriculum and Panchama corrections (2026-10-17)

- All 30 tests pass, including original-data fingerprints for reordered/retained exercises, exact 5A/8A/9 fixtures, every note onset and hold duration at all three kaalams, and the four configured reed pitches/detuning/mix levels. Typecheck, production build and lint pass.
- The browser audio harness passes for all 12 tonics with the same shared four-reed configuration used by the live engine. Mixed drone/high-Sa peaks are 0.2818–0.3316, below full-scale clipping; maximum adjacent-sample step is 0.0325. Sustained output and release-to-silence checks pass.
- Live melody onsets remain 1.000/0.500/0.250 seconds apart at 60 BPM, with maximum measured highlight/output lag 11.1/24.9/25.5 ms. The live drone/retuning/Janta check reports nonzero output (peak RMS 0.1531) and an independent stop.
- The Studio dropdown lists 12 Janta exercises in the requested printed order. The 5A and 8A active headings match their selector labels. Lesson 8A plays at second kaalam, advances its score, displays all 40 karvais and produces nonzero output without alerts. The shared badge and tooltip identify Panchama Shruti: Mandra Pa · Tara Sa · Madhya Sa.

## Chapters 3–4 verification (2026-10-17)

- All 80 rows were extracted from the requested HTML pages into `tests/fixtures/textbook-notation.json`, retaining case, holds, bars and phrase dashes. Production datasets match the complete fixture, not generated variants. Each row passes strict 4 + 2 + 2 validation.
- All 46 unit tests pass. The new exercises complete at every kaalam with exact note onset and hold duration checks. Every ordered pair of distinct chapters resets transport, cursor, note and queued voices. Typecheck, lint, build and separate test-harness typechecking pass.
- Real OfflineAudioContext rendering covers all five Melsthayi and both Dhatu exercises at all three kaalams, 90 BPM and the highest B3 tonic. Melsthayi peaks are 0.2294–0.2322 with maximum adjacent-sample step 0.0437; Dhatu peaks are 0.2257–0.2304 with maximum step 0.0290. All releases reach silence; no clipping is detected.
- Upper Sa/Ri/Ga/Ma/Pa at B3 match 493.8833/526.8089/617.3541/658.5111/740.8250 Hz within 0.0002 Hz in the browser. The existing drone checks pass at all 12 tonics. Live kaalam onset spacing remains 1.000/0.500/0.250 seconds with measured maximum highlight/output lag 30.5/22.6/12.1 ms.
- UI verification confirms all four chapter counts (14/12/5/2), upper-Pa dots and 740.825 Hz playback in Melsthayi 5, Dhatu 2 score advancement with nonzero output, and chapter changes returning to idle at unit zero with score scroll reset and no audio alerts.

## Multi-ragam and multi-tala architecture (2026-10-17)

The catalog now has six chapters and 50 lessons. Foundation lessons default to Mayamalavagowla/Adi; new compositions declare ragaId/talaId explicitly. Shared lessonMetadata helpers resolve defaults for the scheduler, score, scales and tracker. The seven raga profiles separate ascent/descent and select audited SwaraId ratios; Bhairavi uses explicit D1 and D2 rather than inferring variant from local direction.

Tala definitions generate ordered angas and kriyas for arbitrary laghu counts, dhritham and anudhritham. The clock, cursorAt, current-avartanam loop range and score indices use the active tala's akshara count. mapKaalam repeats a complete lesson only as needed to close a cycle at 1/2/4 units per beat. Note durations remain AudioContext-time calculations. No extra metronome interval is introduced.

composition.ts parses normalized source notation with raga-specific variants, upper/lower registers, one-unit commas/dashes/underscores and two-unit semicolons. Strict Alankaram rows must match their tala angas. Geetham printed rows can span cycles or use different bar segmentation, so units are regrouped into the selected tala without reordering. Holds can cross beats and entire avartanams. Sahityam has one token per source unit and repeats by source index when a kaalam mapping repeats the lesson; it shares the active swara cell and output-clock cursor.

Chapter/exercise selection cancels pending Play and audition requests and fades all melody/audition sources, resets position and tempo to 60 BPM, and disables looping. Tonic, kaalam and the independently sustained shruti box remain selected.

Source provenance and all editorial decisions are documented in README and composition source notes. The fetch script retains raw text and Word bold register markup. It does not overwrite reviewed production scores. Textual reprise cues remain unexpanded; ambiguous unstyled octaves are preserved literally. Unit tests compare production swaras and lyrics against the independent raw-source fixture with explicit exceptions for the documented phrase dash and syllable splits.

### Chapters 5–6 verification

- All 95 unit tests, typecheck, lint, production build and separate test/harness TypeScript checking pass.
- The real browser audio harness passes after rendering all eight Alankarams and nine Geethams at every kaalam, 90 BPM and the highest B3 tonic. Alankaram raw peaks are 0.2258–0.2305; maximum adjacent-sample step is 0.0291. Geetham peaks are 0.2314–0.2341; maximum step is 0.0500. All note releases reach silence, with no clipping.
- The unchanged four-reed drone passes sustain/release/headroom checks at all twelve tonics. Live onset spacing remains 1.000/0.500/0.250 s; maximum measured output/highlight lag is 20.2/23.7/25.4 ms. Pause, retuning and independent drone stop pass.
- Browser UI checks confirm all six chapter options, every Alankaram's exact anga/count layout, all nine ordered Geetham titles, lyric counts 108/96/140/196/147/114/84/147/98 at first kaalam, simultaneous swara/syllable highlighting, nonzero live output, and resetting to idle/unit zero/60 BPM when switching chapters. Browser error/warning logs are empty.
- A Studio screenshot records the finished swara-and-sahityam presentation. Source ambiguities and unexpanded textual reprise cues remain explicitly documented rather than silently invented.

Shruti reeds feed a dedicated gain node before the master bus. Shared volume defaults to 100% of the existing reed mix, supports silent 0%, and ramps over 30 ms without restarting voices. The setting survives retuning and page changes; melody and auditions bypass this gain.

Verification on 2026-10-18: all 97 unit tests, typecheck, lint and build pass. Browser audio harness passes sustain, release, pitch and clipping checks; live drone peak RMS is 0.1501 and maximum cursor/output lag is 25.0 ms. Browser UI confirms 0% mute and shared volume across Theory/Studio. UI screenshot: the task visualization artifact shruti-volume.png.


## Pitch contour canvas

`getPlaybackPosition()` reads the engine's fractional musical position directly, using the same output-compensated clock as the talam cursor, without publishing store updates. `PitchWaveCanvas` uses requestAnimationFrame while playing and schedules one frame on engine updates or resize when stationary. It caches pitch/rack data per chapter, lesson and kaalam; no React state updates happen in the draw loop. ResizeObserver and devicePixelRatio keep canvas backing pixels aligned with CSS dimensions.

`pitchContour.ts` maps just-intonation ratios to logarithmic pitch coordinates and uses cubic Hermite easing around swara boundaries. Micro-articulations are visual only: repeated attacks dip by at most 0.13 semitones, while holds breathe by at most 0.018 semitones. The audio engine continues its fixed-pitch synthesis and preserves karvais. Racks combine both raga scale directions and explicit lesson notes across all required registers. The scrolling viewport keeps the bead near the first third, includes tala/anga labels and wraps to the loop destination. The trail covers the last 0.8 seconds and clears on transport discontinuities. Pause retains its score position, consistent with audio pause/resume; reset returns to zero.

Verification on 2026-10-18: all 101 tests pass, including output-latency compensation, fractional reads without store publications, short-seek invalidation, loop wrapping, live speed rebasing, spline continuity, attack/hold distinctions and register coverage for all lessons. Typecheck, lint and build pass. Browser checks confirm canvas/audio notation-unit agreement at all three speeds (including a Dhurita sample at position 14.943960 with audio unit 14), nonzero audio output, pause freezing, reset to zero, seek/loop relocation and chapter changes. The canvas fits a 390px viewport and expands for upper-register exercises. After a clean reload, no new runtime errors were recorded. Existing Vite hot-update errors from an intermediate file write were resolved by reloading. Visual synchronization is refresh-rate limited; these checks do not establish microsecond physical display accuracy.
