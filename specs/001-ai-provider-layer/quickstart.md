# Quickstart: validating the AI provider layer

## Automated checks

```bash
npm run test:run
```

```bash
npm run typecheck
```

```bash
npm run lint
```

The orchestration tests run against a fake provider that can answer: a valid contribution, text with JSON inside a
code block, JSON with missing/invalid fields, non-JSON text, an `AiError` of each cause, and nothing (timeout).
They cover the guarantees in [contracts/ai-provider.md](./contracts/ai-provider.md) and the outcome rules in
[data-model.md](./data-model.md). Adapter tests mock `fetch` / the Anthropic SDK to check URLs, headers, status →
cause mapping and model listing.

## Manual scenarios

Start the app with `npm start` and open `http://localhost:5173/character-generator/`.

1. **No AI (default)**: fresh browser profile → Settings shows "No AI"; Generate shows a new character immediately
   (under half a second, SC-005), with no AI message.
2. **Legacy migration**: in the console, before loading, set `localStorage.useAzureAPI = "true"`,
   `azureEndpoint = "https://models.github.ai/inference"`, `azureModelName = "openai/gpt-4.1"`,
   `azureToken = "<token>"`; reload → Settings shows "OpenAI-compatible" with these values and the key remembered;
   legacy keys are gone (SC-006).
3. **Ollama**: run Ollama locally with `OLLAMA_ORIGINS=http://localhost:5173` and a pulled model; choose
   "Ollama (local)", Test connection → success, model list offered; Generate → AI character + success alert.
   Stop Ollama, Generate → app character + "Couldn't reach Ollama…" alert.
4. **Wrong key**: OpenAI-compatible or Claude with a wrong key → Test connection names "key refused"; Generate →
   app character + key message.
5. **Unknown model**: type a non-existent model → Test connection names "unknown model".
6. **Reroll**: with a working provider, reroll Class → only Class and the background change; reroll Epithet → a new
   epithet and a matching background, nothing else changes (SC-002).
7. **Key retention**: uncheck "Remember on this device", close the tab, reopen → key field empty; check it again,
   reopen → key kept; "Forget key" → key gone from both storages (DevTools → Application → Storage).
8. **Insecure address**: on the deployed HTTPS site, set an `http://192.168.x.x` address → Test connection explains
   that the browser blocks it.
