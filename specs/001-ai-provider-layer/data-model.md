# Data Model: AI Provider Layer

## ProviderType

`"none" | "ollama" | "openai-compatible" | "anthropic"`. Default: `"none"` (FR-003).

## ProviderSettings (stored, no secrets)

Persisted in `localStorage["aiSettings"]`; validated on load, defaults on any failure.

| Field                      | Type                | Rules                                                                                               |
| -------------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| `version`                  | `1`                 | Unknown version → ignore stored value, use defaults                                                 |
| `activeType`               | ProviderType        | Exactly one active provider (FR-001)                                                                |
| `ollama.baseUrl`           | string (URL)        | Default `http://localhost:11434`; `http:` or `https:` only                                          |
| `ollama.model`             | string, 1–200 chars | Default `llama3`                                                                                    |
| `openaiCompatible.baseUrl` | string (URL)        | Default `https://models.github.ai/inference`; the adapter appends `/chat/completions` and `/models` |
| `openaiCompatible.model`   | string, 1–200 chars | Default `openai/gpt-4.1`                                                                            |
| `anthropic.model`          | string, 1–200 chars | Default `claude-opus-5-5`                                                                           |
| `rememberKey`              | boolean             | Default `true` (FR-005a)                                                                            |

Per-type sub-objects are all kept, so switching type and back does not lose what the user typed.
The Ollama adapter uses `{ollama.baseUrl}/v1` as its OpenAI-compatible base URL.

## ApiKeys (secrets)

`{ openaiCompatible?: string; anthropic?: string }`, stored in `localStorage["aiApiKeys"]` when `rememberKey` is
true, otherwise in `sessionStorage["aiApiKeys"]`. Ollama has no key.

State transitions:

- `rememberKey` true → false: copy keys to `sessionStorage`, delete the `localStorage` entry immediately.
- `rememberKey` false → true: copy keys to `localStorage`.
- "Forget key" for a type: delete that type's key from both storages (FR-005b).

## AiContribution (what the AI may produce)

Validated with zod per field.

| Field                | Rules                                                       |
| -------------------- | ----------------------------------------------------------- |
| `firstName`          | trimmed string, 1–40 chars                                  |
| `lastName`           | trimmed string, 1–40 chars                                  |
| `epithet`            | trimmed string, 1–60 chars                                  |
| `background.title`   | trimmed string, 1–120 chars                                 |
| `background.content` | array of 1–10 trimmed non-empty strings, each ≤ 2,000 chars |

Request shapes:

- **New character**: all fields.
- **Background rewrite** (race, class, gender, alignment or age rerolled): `background` only.
- **Name/epithet reroll**: the rerolled field + `background`; the new value must differ from the previous one
  (case-insensitive), otherwise it counts as invalid (FR-008a).

Any other field in the answer is ignored (FR-009).

## GenerationOutcome

Returned by the generation and reroll orchestration, consumed by the UI to choose the alert.

| Field             | Type                              | Meaning                                                                                 |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| `character`       | Character                         | Always complete and valid (SC-001)                                                      |
| `source`          | `"ai" \| "ai-completed" \| "app"` | Full AI result / AI result completed with app content / app content only                |
| `completedFields` | string[]                          | Fields filled by the app when `source = "ai-completed"`                                 |
| `failure`         | `AiError` \| undefined            | Set when `source = "app"` because the AI failed (absent when no provider is configured) |

Rules (FR-014/FR-015):

- Background unusable or answer unreadable → `source = "app"` for the whole character (generation) or the background
  (reroll); `failure.cause = "invalid-answer"`.
- Background usable, some name/epithet fields invalid → those fields from the app's generator, `source = "ai-completed"`.
- Race, class, gender, alignment and age always come from the app (FR-007).

## AiError

| Field          | Type                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cause`        | `"unreachable" \| "blocked-insecure" \| "auth" \| "unknown-model" \| "rate-limited" \| "provider-error" \| "timeout" \| "refused" \| "invalid-answer"` |
| `providerType` | ProviderType                                                                                                                                           |
| `status`       | number \| undefined (HTTP status when there was one)                                                                                                   |

Each cause maps to one user message naming the cause and where to fix it (FR-017); see
[contracts/ai-provider.md](./contracts/ai-provider.md).

## ConnectionTestResult

`{ ok: true; model: string; models?: string[] } | { ok: false; error: AiError }` — `models` present only when the
provider could list them (FR-006a).
