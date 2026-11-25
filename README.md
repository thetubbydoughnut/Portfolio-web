# Portfolio-web

Personal portfolio for Cameron Graham — experience, projects, skills, certifications, and contact — built with React 18, Vite, and a token-driven design system.

## Setup

1. Clone the repository.
2. Use Node.js `>= 22`.
3. Install dependencies: `npm ci` (or `npm install`).
4. Start the dev server: `npm run dev`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit/integration suite |
| `npm run test:coverage` | Vitest with V8 coverage (CI floor in `coverage-floor.json`) |
| `npm run test:secrets` | Assert client bundles have no token patterns |
| `npm run test:e2e` | Playwright end-to-end (smoke + existing specs) |
| `npm run perf:lighthouse` / `npm run test:lighthouse` | Lighthouse floors on local preview |

## Environment

No client-side secrets are required. Project and resume data live in `src/data/*`. Do not add browser `VITE_*` tokens for GitHub or other APIs.

## Testing

- **Vitest** covers unit and component acceptance criteria. Spec-first: write a failing test, then the least code that passes.
- **Playwright** covers end-to-end smoke and selected a11y/perf checks. Run with `npm run test:e2e` after `npm run build` (or rely on the config `webServer` preview).
- CI runs typecheck, lint, test, coverage (floor), and build on pull requests.

## Deploy

Cameron deploys this site (currently on Vercel). Bots do not change Vercel or DNS. Do not deploy or alter hosting from automation.

## License

MIT for original site code. Third-party assets keep their own notices (ThreeUI MIT, Glisse MIT, gl-transitions MIT, React Bits MIT + Commons Clause, fonts OFL).
