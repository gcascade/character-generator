# Implementation Plan: AI Provider Layer

**Branch**: `claude/cool-keller-vpldvo` | **Date**: 2026-11-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-ai-provider-layer/spec.md`

## Summary

Replace the two hard-wired AI integrations (Ollama via fetch, Azure via `@azure-rest/ai-inference`) with a small
provider layer: one `AiProvider` interface, two adapters (OpenAI-compatible over `fetch`, serving both Ollama and
OpenAI-compatible services; Claude through the official Anthropic SDK), and one orchestration module that owns the
rules every provider shares: the app decides race/class/gender/alignment/age, the AI only writes names, epithet and
background, every answer is validated with zod and completed or replaced by the app's own content, failures become a
named cause with an actionable message, and requests stop after 60 s. Settings get a single provider choice, a
connection test with model list, and an API key that is remembered on the device or kept for the session only.

## Technical Context

**Language/Version**: TypeScript 6 (strict), React 19

**Primary Dependencies**: MUI 9, react-hook-form 7; new: `zod` 4, `@anthropic-ai/sdk` 1.x; removed:
`@azure-rest/ai-inference`, `@azure/core-auth`

**Storage**: browser `localStorage` (settings, remembered keys) and `sessionStorage` (session-only keys)

**Testing**: Vitest + jsdom + Testing Library; `fetch` and the Anthropic SDK are mocked in adapter tests;
orchestration tested against a fake `AiProvider`

**Target Platform**: modern evergreen browsers (static site on GitHub Pages); needs `AbortSignal.any` and
`AbortSignal.timeout`

**Project Type**: single-page web application, client-side only

**Performance Goals**: no-AI generation under 0.5 s (SC-005); AI requests capped at 60 s (FR-011)

**Constraints**: no backend (Constitution V); browser cross-origin rules decide which providers are usable;
API keys never leave the browser except to the chosen provider

**Scale/Scope**: 3 provider types, ~10 new source files, Settings page rework, 2 hooks rewritten

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                    | Status            | How                                                                                                                                                                                                     |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Works Without AI          | Pass              | "No AI" is the default; every AI failure falls back to app content; no-AI path has no delay                                                                                                             |
| II. Content Is Data          | Pass              | No content added; prompts are code, generated content stays in `src/data/`                                                                                                                              |
| III. Everything Tested       | Pass (planned)    | Orchestration guarantees tested once with a fake provider; adapters tested with mocked transport; new Settings components get tests and stories; the no-AI path is tested without mocking the generator |
| IV. Validate External Inputs | Pass              | zod validation of AI answers and of stored settings/keys; invalid storage → defaults                                                                                                                    |
| V. Client-Side Only          | Pass              | Direct browser calls; key storage disclosed in the UI (FR-005)                                                                                                                                          |
| VI. Keep It Simple           | Pass              | `fetch` instead of an OpenAI SDK or LangChain; one adapter for two provider types; zod serves both validation and Claude structured outputs; Anthropic SDK justified by research R2                     |
| Bilingual UI                 | Deferred, by spec | New strings centralised in `src/ai/messages.ts` and the Settings page for the upcoming i18n feature                                                                                                     |

**Post-design re-check**: Pass. Two dependencies added (`zod`, `@anthropic-ai/sdk`), two removed (Azure SDK packages).

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-provider-layer/
├── spec.md
├── plan.md              # this file
├── research.md          # decisions R1–R7
├── data-model.md        # settings, keys, AI contribution, outcome, errors
├── quickstart.md        # automated and manual validation
├── contracts/
│   └── ai-provider.md   # adapter, orchestration and message contracts
└── tasks.md             # /speckit-tasks output
```

### Source Code (repository root)

```text
src/
├── ai/                                   # new: everything AI, no React inside
│   ├── types.ts                          # ProviderType, ProviderSettings, ApiKeys, GenerationOutcome
│   ├── errors.ts                         # AiError, cause mapping helpers
│   ├── schemas.ts                        # zod: AiContribution shapes, stored settings
│   ├── extractJson.ts                    # JSON extraction from free text
│   ├── prompts.ts                        # replaces utils/prompt.ts
│   ├── messages.ts                       # outcome → alert severity + text
│   ├── generate.ts                       # generateCharacter, rerollProperty, testConnection
│   ├── storage.ts                        # load/save settings and keys, legacy migration
│   └── providers/
│       ├── index.ts                      # createProvider()
│       ├── openaiCompatible.ts           # fetch adapter (Ollama + OpenAI-compatible)
│       └── anthropic.ts                  # Anthropic SDK adapter
├── contexts/SettingsContext.tsx          # new shape (ProviderSettings + keys), uses ai/storage
├── hooks/
│   ├── useCharacterGenerator.ts          # delegates to ai/generate, applies outcome
│   ├── useCharacterRequest.ts            # no delay; outcome → alert; abort on unmount
│   ├── useSettings.ts                    # unchanged role (context accessor)
│   ├── useOllama.ts, useAzure.ts         # deleted (+ their __mocks__)
├── pages/settings/Settings.tsx           # provider select, per-type fields, key notice,
│                                         # remember/forget, test connection, model autocomplete
└── utils/prompt.ts                       # deleted
```

**Structure Decision**: a framework-free `src/ai/` module so the shared rules are plain functions testable without
React; hooks and the Settings page stay thin.

## Complexity Tracking

No constitution violations to justify.
