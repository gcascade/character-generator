# Character Generator Constitution

## Core Principles

### I. Works Without AI

Every feature MUST be fully usable with no AI provider configured. When an AI provider is
enabled it MAY enrich the result (richer backgrounds, coherence after a reroll, portraits),
but it MUST NOT be the only way to obtain a feature. AI failures MUST degrade gracefully to the
non-AI behaviour or to a clear error, never to a broken screen.

Rationale: most visitors of the public site have no Ollama or Azure setup; the static
generator is the product, AI is a bonus.

### II. Content Is Data

Generated content (backgrounds, names, epithets, stats, equipment, UI strings) MUST live in
`src/data/` (or the i18n resources), organised per locale, never hard-coded in components or
logic. Adding a race, a class or a language MUST require only data changes, plus types
derived from that data. Content MUST NOT be duplicated per gender: pronouns and agreements are
handled by placeholders.

Rationale: content is the part of the project that grows fastest; it must be cheap to extend
and reviewable without reading code.

### III. Everything Tested

Every component MUST have a test (Testing Library) and a Storybook story. Every bug fix MUST
ship with the test that would have caught it. Logic in `utils/` and `hooks/` MUST be unit-tested,
including the no-AI path. Tests MUST NOT mock away the code path they claim to verify.

Rationale: the existing suite passed while a core feature (reroll without AI) was broken
because the hook under test was mocked.

### IV. Validate External Inputs

Any data the app did not produce itself in the current session MUST be validated against a
schema before use: LLM responses, `localStorage` contents, URL parameters (shared characters).
Invalid data MUST be rejected or repaired explicitly, with a user-facing message where relevant.
TypeScript types alone do not count as validation.

Rationale: LLM output is unpredictable, stored data outlives schema changes, and URLs can be
crafted by anyone.

### V. Client-Side Only

The app MUST remain a static site deployable to GitHub Pages: no backend, no server-side
storage, no accounts. Persistence is `localStorage`; sharing goes through URLs or exported
files. Secrets the user enters (API tokens) stay in the browser and this MUST be stated in the UI
or documentation.

Rationale: zero hosting cost and zero operations for a personal project.

### VI. Keep It Simple

A dependency, abstraction or configuration option MUST be justified by a current need, not a
hypothetical one. Prefer the platform (`fetch`, `crypto.randomUUID`, URL APIs) and existing
dependencies (MUI, React Router, react-hook-form) over new ones. Duplicate code is removed when
a second real use appears, not before.

Rationale: this is a learning project; every layer added must be understood and maintained.

## Technical & Product Constraints

- Stack: React, TypeScript in `strict` mode, MUI, React Router. Build with Vite (migration from
  the ejected Create React App planned).
- Languages: the UI and all generated content MUST be available in English and French. A feature
  is not done until both locales are complete.
- Tone: classic heroic fantasy, consistent with the original content (races, classes,
  alignments in the D&D tradition, evocative but not grimdark or parodic).
- Accessibility: interactive elements MUST be keyboard-usable and labelled; layout MUST work on
  mobile widths.

## Development Workflow & Quality Gates

- New features and content restructurings go through Spec Kit: specify → (clarify) → plan →
  tasks → implement. Small bug fixes and tooling chores do not require a spec.
- CI MUST run tests, `tsc --noEmit` and lint; deployment MUST only happen after these pass on the
  default branch.
- Work happens on branches and reaches the default branch through pull requests reviewed by the
  maintainer.

## Governance

This constitution takes precedence over other practices in the repository. Plans produced by
`/speckit-plan` MUST include a constitution check, and any deviation MUST be justified in the
plan's complexity tracking.

Amendments are proposed in a pull request and approved by the maintainer. Versioning follows
semantic versioning: MAJOR for removing or redefining a principle, MINOR for adding a principle
or section or materially expanding guidance, PATCH for wording and clarifications.

Runtime development guidance lives in `CLAUDE.md`; it MUST stay consistent with this document.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
