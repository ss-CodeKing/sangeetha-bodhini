# Audio, transport and curriculum

## One clock

`CarnaticAudioEngine` owns one lazily created AudioContext. A 25 ms recursive timeout wakes a 120 ms look-ahead scheduler. Onsets derive from an AudioContext epoch and musical position, never from timer callback counts. Late wakes rejoin the current phrase rather than playing a backlog. See [Web Audio scheduling](https://web.dev/articles/audio-scheduling) and [scheduled source start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start).

The UI cursor follows the same timeline. It uses [getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp) to follow the output device, with reported latency as a fallback. The talam hook derives beat, subdivision and gesture from that cursor; it has no independent interval.

## Sound

Every swara uses the audited ratios in `swaras.ts`. A voice mixes 72% sine, 23% triangle and 5% second harmonic through a low-pass filter and a gentle envelope. A comma extends that voice's duration, including across beats. It never inserts a rest or a new attack.

The electronic shruti box in `shrutiVoice.ts` sustains middle Sa (1/1), Pa (3/2) and soft lower Pa (3/4). Each pitch has two additive free reeds detuned by −2/+2 cents, mixed at 56%/44% to avoid complete phase cancellation. Harmonic amplitudes at 1f/2f/3f/5f/7f/9f are 0.46/0.26/0.16/0.065/0.03/0.015. The low-pass filter is 1000 Hz with Q 2.4. A 0.2 Hz LFO modulates amplitude and filter cutoff by 1.2%; it does not modulate the reference pitch. Gain rises over 350 ms, sustains, then fades over 120 ms before all reed and LFO sources stop and disconnect. The release explicitly anchors the current envelope value, including during an attack or a future scheduled stop. There are no plucks or sample-loop seams. Retuning fades old voices and starts the new chord. The hook owns lifecycle; the engine and voice factories own synthesis.

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

`curriculum.ts` catalogs Sarali (14 exercises) and Janta (9 exercises). A chapter ID and exercise number travel together through engine state, score lookup, seeking, looping and completion. Common parsing and full eight-beat mappings live in `notation.ts`. Both chapters use the same scheduling path. Janta pairs/triples are individual attacks; commas are sustained karvais. Exercises 1–9 follow the reference linked from the Studio, with the mirrored descent of exercise 1 documented in the README. Fixed-pitch playback does not reproduce the full vocal sphurita ornament.

## Verification

`npm test` runs curriculum and deterministic engine tests. A fake audio clock exercises every kaalam, exact onsets, delayed wakes, completion, holds, pause/resume, live reconfiguration, loop boundaries, sustained drone envelopes, drone retuning and cancellation, all five audition registers and async cancellation.

For real Web Audio checks, run Vite, open `/tests/audio-browser.html` and click **Run audio checks**. This developer-only page is outside the production Vite entry. It renders voices with OfflineAudioContext, estimates their fundamental pitch and checks the envelope, then plays a short phrase at each speed and measures scheduling intervals and output/highlight lag.

Earlier baseline measurements in the in-app Chromium browser:
- Seven offline pitch renders matched the requested frequencies within 0.0001 Hz; no clipping or envelope discontinuity detected by the checks.
- At 60 BPM: first, second and third kaalam onsets were 1.000, 0.500 and 0.250 seconds apart.
- Maximum measured highlight/output lag: 18.4, 22.5 and 23.9 ms respectively.
- Live output analyser RMS was nonzero at all speeds; pause froze the cursor.
- Studio controls were exercised separately: live kaalam switching, 90 BPM, shruti changes, seeking a hold, selecting a lesson, current-cycle looping and independent drone operation.

Reed and chapter verification on 2026-10-17:
- All 26 deterministic curriculum and engine tests pass; every Janta exercise completes at all three kaalams with the expected individual attacks and held durations.
- Typecheck, production build and lint pass with zero errors or warnings.
- Browser OfflineAudioContext checks across all 12 tonics sustain the Sa–Pa–lower-Pa chord, overlap a high Sa audition and release to silence. Raw mixed peaks range from 0.2471 to 0.2742 (full scale = 1); the largest adjacent-sample step is 0.0338. These measurements precede the master compressor.
- Seven offline melody pitch checks pass; live onsets remain exactly 1.000/0.500/0.250 s apart at 60 BPM. Maximum highlight/output lag is 25.1/25.2/24.4 ms for the three kaalams.
- Live reed output, retuning, Janta playback and independent drone stop pass; maximum observed mixed output RMS is 0.1409.
- UI checks cover all 12 note cards and all five octave cards (including replay) without audio alerts, chapter navigation, Janta exercise 9 playback, score advancement, retained drone on pause/chapter change and reset to Sarali exercise 1.
- The responsive Studio controls and score were inspected in the browser. Subjective timbre approval on the user's audio hardware remains a listening-review step.

These measurements validate scheduled audio and browser output data. Perceived timbre and hardware latency can vary by device.
