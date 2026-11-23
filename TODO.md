# TODO / Next Steps

## redesign-001 remaining PRs
1. **PR-2** — shell, theme toggle UI, typography (Instrument Sans/Serif, Geist Mono), home hero (AC-7 to AC-10).
2. **PR-3** — experience, skills, certifications, contact visual redesign (AC-11 to AC-14).
3. **PR-4** — project case studies, real captures, Lighthouse floors (AC-15 to AC-18).

## Follow-ups noticed during PR-1 (not in scope)
- Migrate remaining CSS var aliases (`--color-primary`, `--primary-color`, etc.) fully onto the new token names once PR-2 restyles pages.
- `VantaBackground.jsx` still hardcodes legacy palette hex values; unused by current routes but retained.
- Consider declaring `prop-types` as a direct dependency (currently transitive via eslint-plugin-react).
- Large vendor chunk / image weight for later Lighthouse work in PR-4.

## Ongoing
- Keep content truthful; no client GitHub tokens.
- Draft PRs only until Cameron merges.
