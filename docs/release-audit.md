# Repository release audit — 2026-10-18

The six-chapter, 50-lesson implementation is ready for Git review and a static preview deployment. No curriculum transcription, audio synthesis, scheduling, tuning ratio or playback behavior was changed during cleanup.

## Removed

- `public/portraits/purandara-dasa.jpg`: superseded, unreferenced statue photograph (2,958,894 bytes).
- `public/portraits/thyagaraja.png`: superseded, unreferenced painting (459,232 bytes).
- Unused `exponentialRampToValueAtTime` test-mock method in `tests/audio-engine.test.ts`.

Removing the two unused images saves 3,418,126 bytes of copied deployment assets. All four active stamp assets, their source/licence attribution, both source regression fixtures, the curriculum fetch script and the original Tanpura illustration are retained.

## Updated

- `README.md`, `TODO.md`, `sangeetha_bodhini_plan.md`, `docs/audio-architecture.md`: completed curriculum, final implementation, current verification, actual tuning scope and optional future work. Earlier iteration details remain in Git history.
- `docs/deployment.md`: Git review workflow, static hosting settings and root/subdirectory checks.
- `public/portraits/CREDITS.md`: the four current stamps, with removed-image entries pruned.
- `.gitignore`: dependency/build/cache/coverage/test reports, IDE/OS files, environment files and local hosting state.
- `vite.config.ts`, `index.html`, `src/data/heritage.ts`, `src/components/common/Heritage.tsx`: relative base, base-aware portrait URLs, favicon and six-chapter metadata.
- `src/audio/transport.ts`, `src/types/carnatic.d.ts`: consolidated type imports and clarified curriculum comment.
- `tsconfig.json`, new `tsconfig.tests.json`: normal typecheck/build now checks tests and the browser harness as well as app/config sources.

The source reference audit found no orphan modules or unreferenced declarations in `src/`. The source/test import graph has no cycles. Oxlint and TypeScript unused-local/parameter checks are clean. No obsolete production audio stubs or drone generators were found. Active imports, types, helpers, fixtures and synthesis were retained.

## Verification results

| Check | Result |
| --- | --- |
| `npm run lint` | 0 warnings, 0 errors |
| `npm run typecheck` | Pass: app, Vite config, tests and browser harness |
| `npm run test` | 101 passed; 0 failures, skips or cancellations |
| `npm run build` | Pass; minified hashed assets, no build warnings |
| `npm audit` | 0 known advisories across installed dependencies |
| `git diff --check` | Pass |
| Documentation links | All local Markdown links resolve |
| Git hygiene | All requested ignore cases pass; no tracked dependency/build/cache/environment outputs |
| Production assets | Entry, JS, CSS, favicon and all four stamps load at root and `/sangeetha_bodhini/` |
| Browser console | No warnings/errors during production or audio harness checks |

The build emits about 447.91 kB JavaScript (141.63 kB gzip) and 45.97 kB CSS (10.68 kB gzip). Total uncompressed `dist/` is about 1.49 MB, including four credited images. Tests, source fixtures and the audio harness are absent from production. No dependencies were added or updated.

The real Web Audio harness passes pitch, envelope, sustained drone, clean release, clipping and discontinuity checks. It renders all Melsthayi/Dhatu/Alankaram/Geetham exercises at all three kaalams and checks all twelve drone tonics. Live onset spacing is exactly 1.000/0.500/0.250 seconds at 60 BPM; maximum measured highlight/output lag is 24.2/22.0/26.0 ms. Live drone peak RMS is 0.1523; retuning, Janta playback and independent stop pass.

Production browser checks confirm all six chapter lesson counts (14/12/5/2/8/9), swara/sahityam cells, nonzero Geetham playback, live kaalam changes, canvas updates, pause/reset and root/subdirectory navigation. All four lazy-loaded stamps decode successfully with nonempty alt text and explicit dimensions. A 390px viewport has no page overflow and the canvas resizes correctly. A heritage screenshot was captured in the chat artifacts.

These checks establish no observed regressions in the tested paths. Fixed-pitch audio, visual-only melodic curves, source register ambiguities and unexpanded textual reprise cues retain their documented scope.

## Remaining release actions

Review `git status`, `git diff --check`, `git diff --stat` and the full diff. Stage the reviewed cleanup and commit with a subject such as `Clean repository and reconcile release documentation`, then push the chosen branch to GitHub.

Import the repository into the chosen static host, use Node 22.12+ and `npm run build`, and publish `dist`. Review the preview URL and repeat browser/audio checks before public promotion. See [deployment guide](deployment.md) for Vercel, Netlify and Cloudflare Pages references and settings. No commit, push or public deployment was performed as part of this audit.
