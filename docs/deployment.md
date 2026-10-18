# Static deployment and release

## Build and inspect

Use Node.js 22.12+ and npm inside WSL. From the repository root:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
```

Publish `dist/` only. Vite emits minified, content-hashed JavaScript/CSS, the entry HTML, favicon and four local heritage stamps with credits. No backend, environment variables, credentials, external font downloads or audio samples are required. Audio starts after a user gesture. The browser audio harness and independent source fixtures stay outside the production output.

The app uses React state for Theory/Studio navigation and hash anchors within Theory. It does not use pathname routes or history pushState; no SPA rewrite is required for its current navigation. A refresh opens Theory. If pathname routing is introduced later, add the hosting provider's SPA fallback and revisit relative asset resolution.

`vite.config.ts` uses `base: './'`; heritage filenames are resolved with `import.meta.env.BASE_URL`. The same build can be hosted at `/` or a directory such as `/sangeetha_bodhini/`. Directory URLs must retain their trailing slash. For a host requiring a known absolute prefix, use `npm run build -- --base=/sangeetha_bodhini/` and preview that prefix.

Before releasing, check the built site in a browser: both pages, all six chapter counts, all four stamps (no 404s), mobile layout, swara audition, drone volume/start/stop, lesson playback, pause/reset, all three kaalams, talam gestures and the pitch canvas. Run the development `/tests/audio-browser.html` harness for measured audio checks. Test both `/` and the intended deployment prefix when hosting in a subdirectory.

## GitHub and hosting

Review and commit the cleanup before pushing:

```bash
git status --short
git diff --check
git diff --stat
git diff
# Stage the reviewed files, then:
git commit -m "Clean repository and reconcile release documentation"
# Push the reviewed branch to your configured GitHub remote.
```

Keep the lockfile tracked. `.gitignore` excludes dependencies, build/cache/coverage output, local environment files, IDE state and hosting CLI state. Preserve `public/portraits/CREDITS.md` and the reviewed musical source fixtures.

Import the GitHub repository into one chosen hosting provider. Use the repository root as the project root and a supported Node 22 runtime (at least 22.12). Use these static build settings:

| Provider | Framework | Install | Build | Output |
| --- | --- | --- | --- | --- |
| Vercel | Vite | `npm ci` | `npm run build` | `dist` |
| Netlify | Vite | `npm ci` | `npm run build` | `dist` |
| Cloudflare Pages | React (Vite) | npm lockfile install | `npm run build` | `dist` |

Review the first preview deployment before promoting it or attaching a custom domain. Use HTTPS and repeat the browser smoke checks on the deployed URL. No provider-specific plugin or server function is needed by this app.

Provider references checked on 2026-10-18: [Vercel Vite](https://vercel.com/docs/frameworks/frontend/vite), [Netlify Vite](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/), [Cloudflare Pages React](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/).
