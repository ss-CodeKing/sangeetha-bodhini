# Audio, transport and curriculum

## One clock

`CarnaticAudioEngine` owns one lazily created AudioContext. A 25 ms recursive timeout wakes a 120 ms look-ahead scheduler. Onsets derive from an AudioContext epoch and musical position, never from timer callback counts. Late wakes rejoin the current phrase rather than playing a backlog. See [Web Audio scheduling](https://web.dev/articles/audio-scheduling) and [scheduled source start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start).

The UI cursor follows the same timeline. It uses [getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp) to follow the output device, with reported latency as a fallback. The talam hook derives beat, subdivision and gesture from that cursor; it has no independent interval.

## Sound

Every swara uses the audited ratios in `swaras.ts`. A voice mixes 72% sine, 23% triangle and 5% second harmonic through a low-pass filter and a gentle envelope. A comma extends that voice's duration, including across beats. It never inserts a rest or a new attack.

The shared `DRONE_VOICES` configuration in `transport.ts` defines four sustained reeds: mandra Pa (3/4, gain 0.075), pure tara Sa (2/1, gain 0.045), tara Sa at +3.5 cents (2/1 before detuning, gain 0.035), and madhya Sa (1/1, gain 0.06). The pure and sharpened upper reeds create the chorus; bass and middle tonic remain unison. `shrutiVoice.ts` applies each reed's specified detuning and an additive harmonic profile. Amplitudes at 1f/2f/3f/5f/7f/9f are 0.52/0.23/0.14/0.065/0.03/0.015. The low-pass filter is 1000 Hz with Q 2.4. A 0.2 Hz LFO modulates amplitude and filter cutoff by 1.2%; it does not modulate the reference pitch. Gain rises over 350 ms, sustains, then fades over 120 ms before all reed and LFO sources stop and disconnect. The release explicitly anchors the current envelope value, including during an attack or a future scheduled stop. There are no plucks or sample-loop seams. Retuning fades old voices and starts the new chord. The hook owns lifecycle; the engine and voice factories own synthesis.

Selecting any swarasthana directly auditions its pitch. Each sthayi button auditions Sa in that register, from anumandra through ati-tara; selecting the same button again replays it. Lesson speed buttons use the names Prathama kaalam, Dwithiya kaalam and Thrithiya kaalam.

Melody, drone and audition voices are tracked independently. Cancellation fades sounding voices and stops queued sources. A master compressor limits combined levels. Graphs disconnect after each voice, and the context closes on unmount.

## Transport behavior

- Play resumes the current phrase; completion offers Play again. Pause preserves fractional note progress. Resume uses a soft attack for the remaining duration.
- Reset stops melody and returns to the beginning. The drone has its own on/off button.
- Tempo is 45–90 BPM, initially 60. Three speeds place 1, 2 or 4 notation units in each beat.
- Live speed/tempo/pitch changes cancel queued melody and rebase the current musical position with a 25 ms scheduling lead. Speed changes regroup the score and its talam indices at that position; they do not wait for the end of a lesson. The remaining fraction of the current note uses the new duration.
- Whole-lesson looping wraps the mapped score. Current-avartanam looping captures the cycle containing the current cursor; seeking selects a new cycle.
- Selecting another exercise or chapter stops and resets melody. Chapter changes select exercise 1 and retain kaalam, tempo, tonic, loop preference and the independent drone. Theory navigation pauses melody. The drone may continue across Theory/Studio navigation.
- Hiding the browser tab stops all audio to avoid throttled background scheduling. Return and use Play or Start shruti box to resume.
- A browser interruption pauses melody; failures are visible in an alert. Context creation/resume occurs only after a user gesture.
- The grid follows the active note inside its own scroll area, keeping the page controls in place.

## Curriculum

`curriculum.ts` catalogs Sarali (14 exercises), Janta (12 exercises, printed as 1–10 plus 5A and 8A), Melsthayi (5 exercises) and Dhatu (2 exercises). Printed lesson labels are separate from one-based playback ordinals so extensions remain in the requested order. A chapter ID and exercise number travel together through engine state, score lookup, seeking, looping and completion. Common parsing and full eight-beat mappings live in `notation.ts`. All four chapters use the same scheduling path. Melsthayi and Dhatu preserve every fetched source row in `tests/fixtures/textbook-notation.json`. `parseAdiRow` verifies the printed 4 + 2 + 2 bars before `textbook.ts` builds lesson sections and three-kaalam mappings. Melsthayi keeps the initial scale, upper-Sa karvais, mixed upper-register phrases and final descent separate; Dhatu splits ten ascending and ten descending rows. Its lesson order follows the book: source exercise 2 becomes lesson 1, and source exercise 1 becomes lesson 2; the fetched fixture remains in original reference order. Uppercase S/R/G/M/P remain octave +1. Chapter/exercise selection also resets the notation scroll so the first active note remains visible. Janta pairs/triples are individual attacks; commas are sustained karvais. The Janta order and extensions follow the teacher's corrections to the traditional reference linked from the Studio. Lessons 3/4/5 are the former 4/5/3; 6–8 are unchanged; previous 9 is now 10. In 5A, the motif reverses within each four-note window while window positions traverse both directions. The supplied 8A 16-unit lines each fill an eight-beat avartanam at second kaalam; all units, holds and attacks regroup without padding or truncation at first/third kaalam. Five windows reach tara Sa without adding pitches above it. Fixed-pitch playback does not reproduce the full vocal sphurita ornament.

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
