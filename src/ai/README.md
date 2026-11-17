# `src/ai` — AI provider layer

Everything about optional AI generation, without React. Spec and design:
[`specs/001-ai-provider-layer/`](../../specs/001-ai-provider-layer/).

| File             | Role                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `types.ts`       | Provider settings, keys, AI contribution, generation outcome                                |
| `errors.ts`      | `AiError` and its causes; insecure-address and abort helpers                                |
| `schemas.ts`     | zod schemas: what the AI may write, stored settings                                         |
| `extractJson.ts` | Finds the JSON object in a free-text answer                                                 |
| `prompts.ts`     | Prompts for a new character, a background rewrite, a name/epithet reroll                    |
| `generate.ts`    | `generateCharacter`, `rerollProperty`, `testConnection`: the rules shared by every provider |
| `messages.ts`    | Outcome → alert text, failure descriptions                                                  |
| `storage.ts`     | Settings and keys in the browser, legacy migration                                          |
| `providers/`     | One adapter per protocol, `createProvider`, the 60 s time limit                             |

## Rules every provider gets for free

- The app chooses race, class, gender, alignment and age; the AI only writes first name, last name, epithet and
  background (and, on a reroll, the rerolled name or epithet).
- Answers are validated field by field; invalid names are completed by the app, an unusable background makes the
  app's own result win. The user always gets a complete character.
- Failures become an `AiError` with a cause that the UI turns into an actionable message.

## How to add a provider

1. Implement `AiProvider` (`providers/provider.ts`) in `providers/<name>.ts`:
   - `complete()` returns the answer (parsed object or text) and rejects only with `AiError`,
     except for a caller abort, which is rethrown as is (use `throwIfAborted`);
   - `listModels()` returns model ids, or `undefined` when the service cannot list them.
     If the service speaks the OpenAI chat-completions protocol, reuse `createOpenAiCompatibleProvider` instead.
2. Add the type to `PROVIDER_TYPES` (`types.ts`), its settings to `ProviderSettings`, `storedSettingsSchema` and
   `DEFAULT_SETTINGS`, and a case to `createProvider`, `activeModel` and `providerContext`.
3. Add it to the `adapters` list in `providers/conformance.test.ts`: the shared suite must pass unchanged.
4. Add its label and hint to the Settings page.
