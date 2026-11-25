# Architecture

Explanation of how this portfolio is shaped today.

## Data modules

Content is curated in `src/data/` (`resume.js`, `projects.js`, `certifications.js`, `skillsData.js`). Pages read those modules; there is no client GitHub token and no live repo crawl.

## Routes

React Router 6 maps `/`, `/projects`, `/skills`, `/experience`, `/certifications`, `/contact`, and a shared `NotFound`. Every route sits in `PageFrame` (home uses the hero band; inner routes use the sticky intro rail).

## Effects and motion budget

`src/motion/budget.ts` decides `effects-on` vs `fallback` from reduced motion, WebGL, Save-Data, viewport, pointer, and device hints. Callers default to fallback until evaluation runs.

- **Home hero** — lazy ThreeUI Community `EmeraldHorizonBackground` on the effects-on desktop tier; poster / CSS fallback otherwise.
- **Shell** — Glisse liquid-glass controls on the header, with frost-only fallback.
- **Headings** — vendored React Bits `SplitText` when effects-on; plain text under fallback.
- **Projects** — vendored React Bits `SpotlightCard` when effects-on; static glass cards under fallback. Atmosphere is a Shader Lab export (muted WebM + poster) when assets are present, otherwise a darkened CSS fallback. The live `@basementstudio/shader-lab` runtime is not a dependency.
- **Route changes** — one `directional` GPU transition via `gl-transition` and a vendored GLSL file; opacity or instant swap under fallback. The overlay WebGL context is disposed after the transition.

## Build

Vite 8 produces a static `dist/` with SEO files from `public/` (`robots.txt`, `sitemap.xml`, OG image). Cameron deploys; bots do not change hosting.
