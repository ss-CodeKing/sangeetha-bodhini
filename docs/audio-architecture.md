# Step 2 audio and transport

## One clock

`CarnaticAudioEngine` owns one lazily created AudioContext. A 25 ms recursive timeout wakes a 120 ms look-ahead scheduler. Onsets derive from an AudioContext epoch and musical position, never from timer callback counts. Late wakes rejoin the current phrase rather than playing a backlog. See [Web Audio scheduling](https://web.dev/articles/audio-scheduling) and [scheduled source start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start).

The UI cursor follows the same timeline. It uses [getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp) to follow the output device, with reported latency as a fallback. The talam hook derives beat, subdivision and gesture from that cursor; it has no independent interval.

## Sound

Every swara uses the audited ratios in `swaras.ts`. A voice mixes 72% sine, 23% triangle and 5% second harmonic through a low-pass filter and a gentle envelope. A comma extends that voice's duration, including across beats. It never inserts a rest or a new attack.

The synthetic tanpura plucks mandra Pa, tara Sa, madhya Sa, tonic Sa at 0.85 s intervals with overlapping 3.25 s decays. Ratios to middle Sa are 3/4, 2, 1, 1. The two tonic strings are separate plucks. This follows the requested Panchama pattern; it is a synthesized approximation rather than a sampled acoustic tanpura.

Melody, drone and audition voices are tracked independently. Cancellation fades sounding voices and stops queued sources. A master compressor limits combined levels. Graphs disconnect after each voice, and the context closes on unmount.

## Transport behavior

- Play resumes the current phrase; completion offers Play again. Pause preserves fractional note progress. Resume uses a soft attack for the remaining duration.
- Reset stops melody and returns to the beginning. The drone has its own on/off button.
- Tempo is 45–90 BPM, initially 60. Three speeds place 1, 2 or 4 notation units in each beat.
- Live speed/tempo/pitch changes cancel queued melody and rebase the current musical position with a 25 ms scheduling lead. Speed changes regroup the score and its talam indices at that position; they do not wait for the end of a lesson. The remaining fraction of the current note uses the new duration.
- Whole-lesson looping wraps the mapped score. Current-avartanam looping captures the cycle containing the current cursor; seeking selects a new cycle.
- Selecting another lesson stops and resets melody. Theory navigation pauses melody. The drone may continue across Theory/Studio navigation.
- Hiding the browser tab stops all audio to avoid throttled background scheduling. Return and use Play or Start tanpura to resume.
- A browser interruption pauses melody; failures are visible in an alert. Context creation/resume occurs only after a user gesture.
- The grid follows the active note inside its own scroll area, keeping the page controls in place.

## Verification

`npm test` runs curriculum and deterministic engine tests. A fake audio clock exercises every kaalam, exact onsets, delayed wakes, completion, holds, pause/resume, live reconfiguration, loop boundaries, drone order and async cancellation.

For real Web Audio checks, run Vite, open `/tests/audio-browser.html` and click **Run audio checks**. This developer-only page is outside the production Vite entry. It renders voices with OfflineAudioContext, estimates their fundamental pitch and checks the envelope, then plays a short phrase at each speed and measures scheduling intervals and output/highlight lag.

Observed in the in-app Chromium browser:
- Seven offline pitch renders matched the requested frequencies within 0.0001 Hz; no clipping or envelope discontinuity detected by the checks.
- At 60 BPM: first, second and third kaalam onsets were 1.000, 0.500 and 0.250 seconds apart.
- Maximum measured highlight/output lag: 18.4, 22.5 and 23.9 ms respectively.
- Live output analyser RMS was nonzero at all speeds; pause froze the cursor.
- Studio controls were exercised separately: live 1x→2x→4x switching, 90 BPM, shruti changes, seeking a hold, selecting a lesson, current-cycle looping and independent drone operation.

These measurements validate scheduled audio and browser output data. Perceived timbre and hardware latency can vary by device.
