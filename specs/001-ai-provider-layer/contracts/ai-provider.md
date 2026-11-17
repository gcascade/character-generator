# Contract: AI provider adapter and orchestration

Internal TypeScript contracts (the app exposes no public API). Paths are planned locations.

## Adapter (`src/ai/providers/*`)

```ts
interface AiProvider {
  /** Ask for JSON matching `schema`; resolves with the raw parsed-or-text answer, rejects with AiError. */
  complete(request: {
    system: string;
    prompt: string;
    schema: ZodType; // used for structured output where the provider supports it
    signal: AbortSignal; // already combines the 60 s timeout and the caller's signal
  }): Promise<unknown | string>;

  /** Model ids offered by the provider; rejects with AiError, or resolves undefined if listing is unsupported. */
  listModels(signal: AbortSignal): Promise<string[] | undefined>;
}

function createProvider(
  settings: ProviderSettings,
  keys: ApiKeys,
): AiProvider | undefined; // undefined for "none"
```

Implementations:

| Provider type       | Adapter                                   | Base URL                     | Auth                                    |
| ------------------- | ----------------------------------------- | ---------------------------- | --------------------------------------- |
| `ollama`            | openai-compatible (fetch)                 | `{ollama.baseUrl}/v1`        | none                                    |
| `openai-compatible` | openai-compatible (fetch)                 | `{openaiCompatible.baseUrl}` | `Authorization: Bearer` if a key is set |
| `anthropic`         | anthropic (official SDK, browser enabled) | SDK default                  | API key                                 |

Adapter obligations:

- Never throw anything but `AiError` (all HTTP, network, SDK and abort errors are normalised, see research R4).
- Check the insecure-address rule before any request (`blocked-insecure`).
- Send the key only to the configured provider; never log it.

## Orchestration (`src/ai/generate.ts`)

```ts
generateCharacter(provider: AiProvider | undefined, signal: AbortSignal): Promise<GenerationOutcome>;
rerollProperty(provider: AiProvider | undefined, character: Character, property: keyof Character,
               signal: AbortSignal): Promise<GenerationOutcome>;
testConnection(provider: AiProvider, model: string, signal: AbortSignal): Promise<ConnectionTestResult>;
```

Guarantees (tested once with a fake `AiProvider`, so they hold for every adapter — FR-019):

1. `provider === undefined` → app-only result, no failure, no AI-related message, no waiting.
2. The returned `character` is always complete and valid.
3. Only the rerolled property (and the background) changes.
4. `complete()` rejection → `source: "app"` with `failure` set; never rethrows.
5. An aborted caller signal → the promise rejects with an `AbortError` that callers ignore (component gone).

## User messages (`src/ai/messages.ts`)

| Outcome                    | Severity | Message (English, i18n later)                                                                                                                                             |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai`                       | success  | "New character generated with {provider}." / "Character updated."                                                                                                         |
| `ai-completed`             | info     | "{provider} left out {fields}; they were filled in by the generator."                                                                                                     |
| `app` + `unreachable`      | warning  | "Couldn't reach {provider} at {address}. Check that it is running and the address in Settings. If it runs on your machine, allow this site (for Ollama: OLLAMA_ORIGINS)." |
| `app` + `blocked-insecure` | warning  | "Your browser blocks requests from this secure page to {address} (http). Use https or run the provider on this computer (localhost)."                                     |
| `app` + `auth`             | warning  | "{provider} refused the API key. Check it in Settings."                                                                                                                   |
| `app` + `unknown-model`    | warning  | "{provider} doesn't know the model "{model}". Pick another one in Settings."                                                                                              |
| `app` + `rate-limited`     | warning  | "{provider} is limiting requests. Try again in a moment."                                                                                                                 |
| `app` + `provider-error`   | warning  | "{provider} returned an error ({status}). Try again later."                                                                                                               |
| `app` + `timeout`          | warning  | "{provider} took longer than 60 seconds."                                                                                                                                 |
| `app` + `refused`          | warning  | "{provider} declined to write this character."                                                                                                                            |
| `app` + `invalid-answer`   | warning  | "{provider}'s answer couldn't be used."                                                                                                                                   |

Every `app` + failure message ends with "A character was generated without AI." (generation) or "The background
comes from the generator." (reroll), and texts from the AI are rendered as plain text only (FR-018).
