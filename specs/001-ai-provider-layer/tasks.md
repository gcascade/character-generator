---
description: 'Task list for the AI provider layer'
---

# Tasks: AI Provider Layer

**Input**: Design documents from `specs/001-ai-provider-layer/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/ai-provider.md](./contracts/ai-provider.md)

**Tests**: Included. The constitution (III. Everything Tested) requires a test for every component and logic module,
and tests that exercise the real code path (no mocking of the module under test).

**Organization**: Tasks are grouped by user story so each story can be implemented and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: US1–US4 from spec.md

---

## Phase 1: Setup

**Purpose**: dependencies and module skeleton

- [x] T001 Add `zod@^4` and `@anthropic-ai/sdk@^1` and remove `@azure-rest/ai-inference` and `@azure/core-auth` in package.json (npm install, lockfile updated)
- [x] T002 [P] Create the `src/ai/` and `src/ai/providers/` folders and add a `@Ai/*` path alias in tsconfig.json and vite.config.ts (keep both in sync, per CLAUDE.md)

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: types, validation, storage and the two adapters every story needs

**⚠️ No user story work can begin until this phase is complete**

- [x] T003 Define `ProviderType` (`"none" | "ollama" | "openai-compatible" | "anthropic"`), `ProviderSettings`, `ApiKeys`, `GenerationOutcome` and `ConnectionTestResult` in src/ai/types.ts, exactly as in data-model.md
- [x] T004 [P] Implement `AiError` with `cause` (`"unreachable" | "blocked-insecure" | "auth" | "unknown-model" | "rate-limited" | "provider-error" | "timeout" | "refused" | "invalid-answer"`), `providerType`, `status`, plus `isInsecureAddress(url, pageProtocol)` (true for an `http:` address that is not `localhost`/`127.0.0.1` when the page is `https:`) in src/ai/errors.ts, with tests in src/ai/errors.test.ts
- [x] T005 [P] Write zod schemas in src/ai/schemas.ts: `firstName` "trimmed string, 1–40 chars", `lastName` "trimmed string, 1–40 chars", `epithet` "trimmed string, 1–60 chars", `background.title` "trimmed string, 1–120 chars", `background.content` "array of 1–10 trimmed non-empty strings, each ≤ 2,000 chars"; the three request shapes (new character, background rewrite, name/epithet reroll); stored settings schema with `version: 1`, model "string, 1–200 chars", base URLs restricted to `http:`/`https:`; tests in src/ai/schemas.test.ts
- [x] T006 [P] Implement `extractJson(text)` in src/ai/extractJson.ts (whole text, else the single fenced code block, else first `{` to last `}`, else `undefined`) with tests in src/ai/extractJson.test.ts
- [x] T007 Implement settings and key storage in src/ai/storage.ts: `loadSettings()` (localStorage `aiSettings`, zod-validated, defaults on failure: Ollama `http://localhost:11434` / `llama3`, OpenAI-compatible `https://models.github.ai/inference` / `openai/gpt-4.1`, Anthropic `claude-opus-5-5`, `rememberKey: true`, `activeType: "none"`), `saveSettings()`, `loadKeys()/saveKeys(keys, remember)` (localStorage `aiApiKeys` when remembered, else sessionStorage; switching to not remembered deletes the localStorage copy immediately), `forgetKey(type)` (removes it from both storages), and the one-time legacy migration from `useOllamaAPI`/`ollamaEndpoint`/`ollamaModelName`/`useAzureAPI`/`azureEndpoint`/`azureModelName`/`azureToken` (deleted afterwards); tests in src/ai/storage.test.ts covering defaults, corrupted data, unknown version, migration of each legacy case, remember on/off and forget
- [x] T008 Rework src/contexts/SettingsContext.tsx to hold `ProviderSettings` and `ApiKeys` through src/ai/storage.ts (lazy init, save in effects) and expose `setSettings`, `setKey`, `setRememberKey`, `forgetKey`; update src/hooks/useSettings.ts, src/hooks/**mocks**/useSettings.ts, test/decorators/SettingsDecorator.tsx and src/contexts/SettingsContext.test.tsx
- [x] T009 [P] Implement the OpenAI-compatible adapter in src/ai/providers/openaiCompatible.ts (`POST {base}/chat/completions` with system + user messages, `GET {base}/models` → `data[].id`, `Authorization: Bearer` only when a key is set, insecure-address check before sending, `TypeError` → `unreachable`, 401/403 → `auth`, 404 mentioning the model → `unknown-model`, 429 → `rate-limited`, other errors → `provider-error`, abort by timeout → `timeout`; listing unsupported (404) resolves `undefined`) with tests mocking `fetch` in src/ai/providers/openaiCompatible.test.ts
- [x] T010 [P] Implement the Anthropic adapter in src/ai/providers/anthropic.ts (`new Anthropic({ apiKey, dangerouslyAllowBrowser: true })`, `messages.parse` with `output_config: { format: zodOutputFormat(schema), effort: "low" }`, `max_tokens: 4096`, `stop_reason: "refusal"` → `refused`, SDK error classes → causes as in research R4, `models.list()` for listing; try `fallbacks: "default"` on the beta client and keep it only if `parse` supports it) with tests mocking `@anthropic-ai/sdk` in src/ai/providers/anthropic.test.ts
- [x] T011 Implement `createProvider(settings, keys)` in src/ai/providers/index.ts (`none` → `undefined`; `ollama` → OpenAI-compatible adapter on `{baseUrl}/v1` without key; `openai-compatible` → same adapter with key; `anthropic` → Anthropic adapter) and `withTimeout(signal)` (`AbortSignal.any([AbortSignal.timeout(60_000), signal])`) with tests in src/ai/providers/index.test.ts

**Checkpoint**: the app still builds; nothing user-visible has changed yet.

---

## Phase 3: User Story 1 — Generating with AI never breaks the app (Priority: P1) 🎯 MVP

**Goal**: Generate always ends with a complete character and one message saying whether it is a full AI result, an AI result completed by the app, or an app result with a named cause.

**Independent test**: with a fake provider answering valid / partial / malformed / error / timeout, every Generate shows a complete character and the matching alert (quickstart scenarios 1, 3, 4).

- [x] T012 [P] [US1] Write the new-character prompt in src/ai/prompts.ts (fixed race, class, gender, alignment and age stated as facts; JSON fields from `z.toJSONSchema` of the new-character schema; third person; 4 to 6 paragraphs; heroic fantasy tone; "JSON only") with tests in src/ai/prompts.test.ts
- [x] T013 [US1] Implement `generateCharacter(provider, signal)` in src/ai/generate.ts: app picks race/class/gender/alignment/age, asks the provider for names, epithet and background, validates per field, completes invalid name/epithet fields from the app generator (`ai-completed`, `completedFields` listed), falls back to the app character when the background is unusable or the call fails (`app` + `failure`), returns at once with no provider; tests with a fake `AiProvider` in src/ai/generate.test.ts covering contract guarantees 1, 2, 4 and 5
- [x] T014 [P] [US1] Implement `outcomeToAlert(outcome, context)` in src/ai/messages.ts returning severity and text from the table in contracts/ai-provider.md (generation endings), with tests in src/ai/messages.test.ts for every cause
- [x] T015 [US1] Rewrite src/hooks/useCharacterGenerator.ts and src/hooks/useCharacterRequest.ts to use `createProvider` + `generateCharacter`, remove the 1 s delay, abort in-flight requests on unmount, keep buttons disabled while loading, and show the alert from `outcomeToAlert`; update src/hooks/useCharacterGenerator.test.tsx
- [x] T016 [US1] Delete src/hooks/useOllama.ts, src/hooks/useAzure.ts, their `__mocks__`, src/utils/prompt.ts, and the related `vi.mock` lines in src/setupTests.ts and src/components/character/character/Character.test.tsx; make sure AI text is only rendered as plain text in src/components/character/characterBackground/CharacterBackground.tsx (FR-018)
- [x] T017 [US1] Update src/components/character/character/Character.test.tsx and src/pages/home/Home.test.tsx so Generate is tested end to end with no provider (instant, no AI alert) and with a mocked failing provider (app character + warning)

**Checkpoint**: User Story 1 works on its own — Generate is reliable with or without AI.

---

## Phase 4: User Story 2 — Rerolling one property keeps everything else (Priority: P1)

**Goal**: a reroll changes exactly one property (plus the background); for names and epithet the AI proposes the new value.

**Independent test**: reroll each property with a fake provider and compare before/after: exactly one property differs besides the background (quickstart scenario 6, SC-002).

- [x] T018 [P] [US2] Add the background-rewrite and name/epithet-reroll prompts to src/ai/prompts.ts (current character given as facts, the rerolled field and previous value named, "JSON only") with tests in src/ai/prompts.test.ts
- [x] T019 [US2] Implement `rerollProperty(provider, character, property, signal)` in src/ai/generate.ts: race/class/gender/alignment/age → app picks the new value, AI rewrites the background; firstName/lastName/epithet → AI proposes the value and background, value must differ from the previous one (case-insensitive) else the app picks it; any other field in the answer ignored; failure → app background; tests in src/ai/generate.test.ts covering contract guarantee 3 for every property
- [x] T020 [US2] Wire `rerollProperty` into src/hooks/useCharacterGenerator.ts and use the reroll endings of src/ai/messages.ts; update src/components/character/characterInformation/CharacterInformation.test.tsx (one property changes, others unchanged, with and without provider)

**Checkpoint**: User Stories 1 and 2 both work.

---

## Phase 5: User Story 3 — Choosing and checking a provider in Settings (Priority: P2)

**Goal**: one provider choice, per-type fields, key notice, remember/forget, connection test with model list.

**Independent test**: quickstart scenarios 2, 4, 5, 7 and 8 from the Settings page alone.

- [x] T021 [US3] Implement `testConnection(provider, model, signal)` in src/ai/generate.ts (list models when possible, then a minimal completion with the chosen model; `unknown-model` when the model is absent from a successful list) with tests in src/ai/generate.test.ts
- [x] T022 [US3] Rewrite src/pages/settings/Settings.tsx: provider select ("No AI", "Ollama (local)", "Claude (Anthropic)", "OpenAI-compatible"); fields shown for the active type only (address for Ollama/OpenAI-compatible, model for all, API key for Claude and OpenAI-compatible); notice "Your key is stored only in this browser and sent only to {provider}."; "Remember on this device" checkbox (checked by default) and "Forget key" button; "Test connection" button showing success with the model or the cause message; model as MUI `Autocomplete` with `freeSolo` filled from the last successful test
- [x] T023 [P] [US3] Extract the key field, notice, remember checkbox and forget button into src/components/settings/apiKeyField/ApiKeyField.tsx with ApiKeyField.test.tsx and ApiKeyField.stories.tsx
- [x] T024 [P] [US3] Extract the test button and its result display into src/components/settings/connectionTest/ConnectionTest.tsx with ConnectionTest.test.tsx and ConnectionTest.stories.tsx
- [x] T025 [US3] Update src/pages/settings/Settings.test.tsx and src/pages/settings/Settings.stories.tsx: default "No AI" hides provider fields, switching types keeps typed values, test connection success and failure, model list offered after success, remember/forget behaviour

**Checkpoint**: all user-facing behaviour of the spec is in place.

---

## Phase 6: User Story 4 — Adding a provider costs little (Priority: P3)

**Goal**: shared behaviour is proven once for all adapters.

**Independent test**: one conformance suite runs unchanged against both adapters.

- [x] T026 [US4] Write an adapter conformance suite in src/ai/providers/conformance.test.ts, run with `describe.each` over the OpenAI-compatible adapter (mocked `fetch`) and the Anthropic adapter (mocked SDK): success returns the answer, each failure maps to the same `AiError` cause, abort and timeout behave the same, listing returns ids or `undefined`
- [x] T027 [US4] Document "How to add a provider" (implement `AiProvider`, register in `createProvider`, add to the conformance suite, add the type to the settings schema and select) in src/ai/README.md

---

## Phase 7: Polish & cross-cutting concerns

- [x] T028 [P] Update README.md "API Integration": the three provider types, Ollama `OLLAMA_ORIGINS` for the deployed site, OpenAI-compatible examples (GitHub Models, OpenAI, Mistral, OpenRouter, LM Studio), Claude, the classic Azure OpenAI `api-key` limitation, and where keys are stored
- [x] T029 [P] Update CLAUDE.md (stack: zod and Anthropic SDK, `src/ai/` module, remove the AI items from "Known issues")
- [x] T030 Run `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build` and `npm run build-storybook`; fix anything failing
- [x] T031 Run the quickstart manual scenarios that do not need real keys (1, 2, 7, 8, and 3/4/5 with a local mock server) in a browser and capture screenshots of Settings and of each alert type

---

## Dependencies & execution order

- **Setup (T001–T002)** → **Foundational (T003–T011)** → user stories.
- **US1 (T012–T017)** first: it introduces the orchestration module and the hook rewrite that US2 extends.
- **US2 (T018–T020)** after US1 (same files: generate.ts, prompts.ts, useCharacterGenerator.ts).
- **US3 (T021–T025)** needs only the foundational phase; it can run in parallel with US1/US2 except T021, which edits generate.ts.
- **US4 (T026–T027)** after both adapters (T009, T010).
- **Polish (T028–T031)** last.

Within the foundational phase: T003 before T004–T011; T005 before T007 and T010; T004 before T009/T010; T009 and T010 before T011.

## Parallel opportunities

- Foundational: T004, T005, T006 together; then T009 and T010 together.
- US1: T012 and T014 together, before T013/T015.
- US3: T023 and T024 together while T022 is written.
- Polish: T028 and T029 together.

## Implementation strategy

1. **MVP = Setup + Foundational + US1**: AI generation is reliable and the old Ollama/Azure code is gone. Settings still
   need a provider to be set by migration (existing users) — acceptable for an intermediate commit, not for a release.
2. **+ US2**: rerolls are correct; this closes the two P1 stories.
3. **+ US3**: Settings rework; from here the feature is releasable.
4. **+ US4 and Polish**: conformance suite, docs, final checks, then one PR.

Commit after each task or small group of tasks; keep lint, typecheck and tests green at every commit.
