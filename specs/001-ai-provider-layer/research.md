# Research: AI Provider Layer

Decisions taken during planning, with the alternatives that were considered.

## R1. How to call Ollama and OpenAI-compatible services

- **Decision**: One adapter, written with the browser's `fetch`, that speaks the OpenAI chat-completions protocol
  (`POST {baseUrl}/chat/completions`, `GET {baseUrl}/models`, `Authorization: Bearer <key>` when a key is set).
  It serves both the "OpenAI-compatible" type and the "Ollama (local)" type: Ollama exposes the same protocol under
  `{address}/v1` (chat completions and model list), so the Ollama type only differs by its defaults and by sending no key.
- **Rationale**: Constitution VI (prefer the platform): two endpoints and one header do not justify a dependency.
  One adapter for two provider types halves the code and the tests. The protocol is the de facto standard
  (OpenAI, GitHub Models, Azure AI model inference, Mistral, Gemini's compatibility endpoint, OpenRouter, Groq, LM Studio).
- **Alternatives considered**:
  - LangChain v1 (`@langchain/openai`, `@langchain/ollama`): one more abstraction layer and a large dependency tree,
    for two HTTP calls; its provider abstraction is what this feature builds in ~100 lines. Rejected (VI).
  - Official `openai` npm SDK with `dangerouslyAllowBrowser`: fine, but adds a dependency for two calls and its
    typed errors would still have to be mapped to our causes. Rejected (VI).
  - Ollama native API (`/api/chat`, `/api/tags`): supports JSON schemas in `format`, but would need its own adapter.
    Kept as a fallback option if the `/v1` endpoint proves insufficient during implementation.
  - Keeping `@azure-rest/ai-inference`: Azure-specific; removed with the dedicated Azure type.
- **Known limitation**: classic Azure OpenAI resources that only accept an `api-key` header (not `Bearer`) will fail the
  connection test with a "key refused" message. Sending an extra `api-key` header to every provider was rejected:
  it would make other providers' cross-origin preflight fail. Azure AI model inference / GitHub Models endpoints accept `Bearer`.

## R2. How to call Claude (Anthropic)

- **Decision**: The official TypeScript SDK `@anthropic-ai/sdk` (1.x) with `dangerouslyAllowBrowser: true`
  (documented in the SDK README: browser use is off by default and enabled by this option, which also sends the
  header Anthropic requires for direct browser access). Generation uses `client.messages.parse()` with
  `output_config.format: zodOutputFormat(schema)` (structured outputs) so the answer is schema-shaped JSON;
  model list via `client.models.list()`.
- **Defaults**: model `claude-opus-5-5`, editable (the list from the provider is offered after a connection test).
  `output_config.effort: "low"`: short creative text does not benefit from deep reasoning and the 60 s limit matters;
  `max_tokens` 4096 (a background is well under that).
- **Refusals**: a `stop_reason: "refusal"` (dark alignments could occasionally trigger one) is mapped to the
  "refused" cause and the app falls back to its own content. Server-side model fallback (`fallbacks: "default"` on the
  beta endpoint) is enabled if `parse()` is available on the beta messages client; otherwise refusals are handled by
  the app fallback alone. To verify during implementation.
- **Rationale**: Claude's API is not the OpenAI protocol; Anthropic's guidance is to use its official SDK rather than a
  compatibility shim. Structured outputs remove most malformed answers at the source.
- **Note**: the SDK does not run under jsdom; tests mock the adapter's SDK import.

## R3. Validating AI answers

- **Decision**: `zod` 4 schemas for what the AI may contribute (see [data-model.md](./data-model.md)), shared by all
  adapters. Text answers go through `extractJson()` first: the whole answer, else the content of a single fenced code
  block, else the substring from the first `{` to the last `}`; anything else is "invalid answer".
  Validation is per field so a partially valid answer can be completed (FR-015).
- **Rationale**: Constitution IV requires schema validation; zod is already the format the Anthropic SDK helper takes,
  so one schema serves both validation and structured outputs. zod 4 is within the SDK's peer range (`^3.25 || ^4`).
- **Alternatives considered**: hand-written type guards (more code, no reuse with the SDK helper); JSON Schema + ajv
  (heavier, no TypeScript type inference).

## R4. Time limit, cancellation and failure causes

- **Decision**: every AI request gets `AbortSignal.any([AbortSignal.timeout(60_000), callerSignal])`. The caller signal
  is aborted when the component that started the request unmounts, so a late answer never overwrites the screen.
  Errors are normalised into an `AiError` with one `cause` (see [contracts/ai-provider.md](./contracts/ai-provider.md)):
  - `fetch` throws `TypeError` → **unreachable**. In a browser a server that is down, a wrong address and a request
    blocked by cross-origin rules are indistinguishable, so the message gives both hints (check the address / allow
    this site, e.g. `OLLAMA_ORIGINS` for Ollama). The spec's "unreachable" and "blocked by the browser" causes are
    therefore one message.
  - Page served over HTTPS and an `http:` address that is not `localhost`/`127.0.0.1` → **blocked-insecure**, detected
    before sending.
  - HTTP 401/403 → **auth**; 404 mentioning the model, or a model absent from the list → **unknown-model**;
    429 → **rate-limited**; other 4xx/5xx → **provider-error**; timeout → **timeout**; refusal → **refused**;
    answer that fails extraction or validation → **invalid-answer**.
- **Rationale**: matches FR-006/FR-017 with what a browser can actually observe.

## R5. Storing settings and the API key

- **Decision**: provider settings (without keys) in `localStorage["aiSettings"]` as versioned JSON validated by zod.
  Keys per provider type in `localStorage["aiApiKeys"]` when "Remember on this device" is checked, otherwise in
  `sessionStorage["aiApiKeys"]`; unchecking deletes the `localStorage` copy; "Forget key" deletes both.
  Invalid or unknown stored data is ignored and replaced by defaults (Constitution IV).
- **Migration**: on first load, if `aiSettings` is absent and the legacy keys exist (`useOllamaAPI`, `ollamaEndpoint`,
  `ollamaModelName`, `useAzureAPI`, `azureEndpoint`, `azureModelName`, `azureToken`), they are converted
  (Ollama → `ollama` with `{endpoint}` as address; Azure → `openai-compatible` with the same endpoint, model and a
  remembered key), the active type follows the legacy switches, and the legacy keys are deleted.
- **Alternatives considered**: encrypting the key in the browser (the decryption key would live next to it: no real
  protection, false sense of security); IndexedDB (no benefit for a few strings).

## R6. Prompts

- **Decision**: three prompt builders (new character, background rewrite, name/epithet reroll) that state the fixed
  properties as facts, describe the expected JSON fields, ask for third person and 4 to 6 paragraphs, keep the
  existing heroic fantasy tone, and say "JSON only". The schema text sent in the prompt is generated from the same zod
  schemas (`z.toJSONSchema`) so prompt and validation cannot drift.
- **Rationale**: the AI only produces what it is allowed to (FR-007/FR-008a); the app never asks for, and therefore
  never has to discard, race/class/gender/alignment/age.

## R7. Remove the artificial delay

- **Decision**: drop the 1 s `delay()` in `useCharacterRequest` (FR-010, SC-005). Buttons are disabled through the
  existing request status while a request is in flight (FR-012).
