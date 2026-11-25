# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 2026-11-25 — redesign-001 PR-4 follow-up (floors / audit)

- Removed `lighthouse` from the lockfile; floors harness uses `npx lighthouse@12.6.0`.
- Desktop effects-on Lighthouse floors clear with real SwiftShader WebGL evidence (probe records canvas mount on home).
- Engagement-gated Glisse/SplitText/ThreeUI + cached WebGL budget probe for lab TBT.
- npm audit high/critical parity with main `0206d16` (0 new).


## 2026-11-24 — redesign-001 PR-3 inner pages

- Experience timeline on shared PageFrame with stack fields and CLR July–November 2026 (AC-11).
- Skills grouped glass chip grid (1/2/3 cols); removed React.js duplicate (AC-12 / R-1).
- Certifications data module + sized media well; route/nav/sitemap kept (AC-13).
- Contact glass tiles for email / GitHub / LinkedIn only (AC-14).
- Vendored React Bits SplitText for section headings; plain text under motion fallback (AC-22).
- R-4/AI-4: gate `.btn:hover` translate; primary CTA hover uses accent (not page bg).
- R-5: prune App.css April leftovers (Inter, `#root` overflow, unused header/nav/logo/card, section hairline).

## 2026-11-24 — redesign-001 PR-2 shell + home

- Shared `PageFrame` on every route (home hero band; sticky intro rail on inner routes).
- Glisse glass shell: skip link, nav, theme toggle, resume CTA; motion-budget fallbacks.
- High-impact home hero with lazy ThreeUI `EmeraldHorizonBackground` (subpath + `React.lazy`).
- Self-hosted Instrument Sans / Instrument Serif / Geist Mono with size-adjust fallbacks (no Google Fonts).
- Shipped Nov 23 resume PDF at `public/documents/cameron-graham-resume.pdf`; `getResumeHref` PDF branch; “Download resume” label; regenerated 600×776 preview.
- Profile photo slot (AC-27): hero 960×1280 and header 96×96 webps from the delivered source, metadata stripped.
- Removed repo-root resume PDFs and dead `Navigation` / `VantaBackground` / unused `Home.jsx`.

## 2026-11-23 — redesign-001 PR-1 foundation

- Added ink/copper design tokens (dark + light), glass tokens, Tailwind wiring, and `src/theme` helper (`data-theme` + localStorage).
- Added SEO artifacts: `public/robots.txt`, `public/sitemap.xml`, favicon, OG image, Twitter tags, Person/WebSite JSON-LD.
- Added incremental TypeScript (`tsconfig.json`) and GitHub Actions CI (`.github/workflows/ci.yml`, Node 22 for jsdom 31).
- Updated availability copy to “Available for full-time software engineering.” (no January 2027).
- Removed artificial `PageLoader` timers and `styled-components`.
- Removed client GitHub token docs from README; kept `no-client-secrets` guard.
- Added shared motion/GPU budget helper (`src/motion/budget.ts`).

## 2025-05-12

- Ensured full-page Vanta canvas and related HeroSection layout fixes (historical entry; git history dated 2025-05-12).
- Consolidated task tracking into `TODO.md`.
- Earlier HireMe consolidation, NotFound, Certifications, and dependency fixes (see git history for 2025-05-12 commits).
