# Contributing

## Spec-first TDD

1. Write a failing test first for the behavior (acceptance criterion or bug).
2. Run it and confirm it fails for the right reason.
3. Implement the least code that makes the test pass.
4. Refactor only while tests stay green. Prefer reuse of existing helpers before new abstractions.

Tests are required for every behavior change.

## Tooling

- **Vitest** — unit and integration tests under `src/` and `tests/` (excluding `tests/e2e`).
- **Playwright** — end-to-end under `tests/e2e`. Run with `npm run test:e2e`.
- **Coverage** — `npm run test:coverage`. The CI floor is the measured integer in `coverage-floor.json` (never an invented round number).

## Pull requests

Use the PR template checklist: acceptance criteria, fail-before / pass-after evidence, no secrets, and docs updates when behavior changes. Reference issues with `Refs #n` only — do not use Closes/Fixes/Resolves.
