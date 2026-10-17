# Repository Guidelines

## Project Structure & Module Organization

Sangeetha Bodhini is a React + TypeScript Carnatic learning application built with Vite.

- `src/components/`: Theory, Studio, and shared UI components.
- `src/data/`: chapter catalog, six curriculum chapters, raga profiles, notation parsing, tuning, and talam definitions.
- `src/audio/`: Web Audio engine, transport calculations, melody voices, and shruti reed synthesis.
- `src/hooks/`: shared engine lifecycle and talam subscriptions; keep synthesis in `src/audio/`.
- `src/types/carnatic.d.ts`: shared musical domain types.
- `src/assets/` and `public/`: illustrations and static assets; retain portrait attribution in `public/portraits/CREDITS.md`.
- `tests/`: curriculum/engine unit tests and browser audio harness. `docs/` contains tuning and audio architecture notes.

## Build, Test, and Development Commands

Use Node.js 22.12+ and npm inside WSL. Keep Linux-installed `node_modules` in WSL; Windows cannot run its native binaries.

- `npm ci`: install locked dependencies reproducibly.
- `npm run dev`: start Vite, normally at `http://localhost:5173`.
- `npm run typecheck`: check TypeScript project references.
- `npm test`: run curriculum and audio engine tests.
- `npm run test:data` / `npm run test:audio`: run either suite independently.
- `npm run lint`: run Oxlint, including React hooks rules.
- `npm run build`: typecheck and create production output in `dist/`.
- `npm run preview`: serve the production build locally.

## Coding Style & Naming Conventions

Follow existing TypeScript conventions: two-space indentation, single quotes, no statement semicolons, and explicit shared types. Use PascalCase for component filenames, camelCase for functions/data modules, and `use` prefixes for hooks. Use Tailwind v4 theme tokens and existing CSS conventions. Oxlint is configured in `.oxlintrc.json`; no formatter is configured.

## Testing & Musical Invariants

Tests use `node:test` and `node:assert/strict`, executed through `tsx`. Keep tests in `tests/*.test.ts` with descriptive behavior names. No percentage coverage threshold is configured; add regressions for changed behavior.

Preserve karvais, octave registers, complete cycles for each active tala, and all three kaalams. Printed Janta labels such as `5A` differ from playback ordinals. Schedule audio against the AudioContext clock, not timer callback counts. For synthesis changes, run `/tests/audio-browser.html` through Vite and check sustain, release, pitch, and clipping.

## Commit & Pull Request Guidelines

History uses concise imperative subjects, e.g. `Add Janta curriculum and harmonium-style shruti box`; Conventional Commit prefixes are not established. Keep commits focused. PR descriptions should explain behavior, validation, relevant issues, and musical source changes. Include screenshots for UI changes and browser measurements for audio changes. Before submitting code, run tests, typecheck, lint, and build. Update README, TODO, and architecture notes when behavior changes.
