# Feature Specification: AI Provider Layer

**Feature Branch**: `claude/cool-keller-vpldvo`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "AI provider layer for character generation. Today the app can optionally use an AI provider (Ollama running locally, or Azure / GitHub Models with an API key) to generate a character and its background; without AI it uses static data. Problems to solve: (1) AI responses are trusted blindly; (2) rerolling a single property with AI can silently change other properties; (3) each provider is wired separately with duplicated logic, so supporting another provider is costly; (4) when the AI call fails the user only gets a generic error and nothing is generated. Goals: pick one provider (or none), validated results, clear messages with fallback to the non-AI result, connection test in Settings, API key stays in the browser and the UI says so. Out of scope: AI portraits, content restructuring, i18n."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Generating with AI never breaks the app (Priority: P1)

A user who enabled an AI provider clicks **Generate**. Whatever the provider answers (a correct character, malformed text, a character with missing fields or an unknown race, an error, or nothing at all), the user ends up with a complete, displayable character and understands what happened.

**Why this priority**: Today a bad AI answer can break the screen or leave the user with nothing. Reliability is the precondition for every other AI improvement, and it enforces the constitution's "Works without AI" and "Validate external inputs" principles.

**Independent Test**: Configure a provider that returns, in turn, a valid answer, invalid text, an answer with missing or unknown values, and an error. Each time, a complete character is displayed and the message matches the situation.

**Acceptance Scenarios**:

1. **Given** an AI provider that returns a valid character, **When** the user clicks Generate, **Then** the AI character is displayed and a success message is shown.
2. **Given** an AI provider that returns text that is not a character, **When** the user clicks Generate, **Then** a character generated without AI is displayed and a message explains that the AI answer was unusable and the non-AI result is shown instead.
3. **Given** an AI provider that returns a character with a missing epithet and an unknown race, **When** the user clicks Generate, **Then** the race, class, gender, alignment and age are the ones the app chose, the missing epithet is filled from the app's own content, and the message says the AI result was partially completed.
4. **Given** an AI provider that is unreachable, **When** the user clicks Generate, **Then** a non-AI character is displayed and the message names the cause (provider unreachable) and suggests what to check (address, provider running).
5. **Given** an AI provider that rejects the API key, **When** the user clicks Generate, **Then** a non-AI character is displayed and the message says the key was refused and points to Settings.
6. **Given** an AI provider that does not answer within the time limit, **When** the user waits, **Then** generation stops at the limit, a non-AI character is displayed and the message says the provider took too long.

---

### User Story 2 - Rerolling one property keeps everything else (Priority: P1)

A user likes a character but wants to change one property, for example the class. With an AI provider enabled, rerolling the class changes only the class; the name, epithet, race, gender, age and alignment stay the same, and the background is rewritten so it matches the new class.

**Why this priority**: This is a visible bug today (other properties change silently) and the reroll is the main way users refine a character.

**Independent Test**: With a provider enabled, reroll each property in turn and compare the character before and after: exactly one property differs, plus the background.

**Acceptance Scenarios**:

1. **Given** a character and an enabled AI provider, **When** the user rerolls the class, **Then** only the class changes among the properties, and the new background is consistent with the new class.
2. **Given** an AI answer to a reroll that also changes the name, **When** the result is applied, **Then** the name the AI tried to change is ignored and the original name is kept.
3. **Given** an AI provider that fails during a reroll, **When** the reroll completes, **Then** the requested property is changed, the background comes from the app's own content, and the message explains that the AI could not rewrite the background.
4. **Given** no AI provider, **When** the user rerolls a property, **Then** only that property changes and the background comes from the app's own content, with no AI-related message.

---

### User Story 3 - Choosing and checking a provider in Settings (Priority: P2)

A user opens Settings, chooses one provider type (no AI, a local Ollama server, or an OpenAI-compatible service such as OpenAI, GitHub Models, Azure AI or LM Studio), fills in its address, model and, when needed, its API key, and clicks **Test connection** to know right away whether it works before going back to generate characters.

**Why this priority**: Today a misconfiguration is only discovered when generation fails. A single, explicit choice also removes the current pair of switches that must be kept mutually exclusive.

**Independent Test**: In Settings, choose each provider type, enter correct then incorrect values, and run the connection test; the result is clear in each case. Choosing "No AI" hides the provider fields.

**Acceptance Scenarios**:

1. **Given** the Settings page, **When** the user opens the provider choice, **Then** exactly one of "No AI", "Ollama (local)" and "OpenAI-compatible" can be selected, and "No AI" is the default for new users.
2. **Given** a provider with correct settings, **When** the user clicks Test connection, **Then** a success result is shown within the time limit, including the model that answered.
3. **Given** a provider with a wrong address, a wrong model or a refused key, **When** the user clicks Test connection, **Then** the result names which of these is the likely cause.
4. **Given** the API key field, **When** the user views it, **Then** a notice states that the key is stored only in this browser and sent only to the chosen provider.
5. **Given** a user who had configured Ollama or Azure before this feature, **When** they open the app for the first time after the update, **Then** their previous provider choice, address, model and key are kept, mapped to the new provider choice.

---

### User Story 4 - Adding a provider costs little (Priority: P3)

As the maintainer, I can support a new kind of AI service by describing how to call it once, without touching the generation, reroll, validation or fallback behaviour, which are shared by all providers.

**Why this priority**: It is a maintainability goal with no direct user-visible change, but it keeps the project simple as providers evolve.

**Independent Test**: The automated tests for validation, reroll and fallback run once against a fake provider and apply unchanged to every real provider.

**Acceptance Scenarios**:

1. **Given** the two supported provider types, **When** their behaviours are compared, **Then** generation, reroll, validation, time limit and error messages are identical except for how the service is called.

---

### Edge Cases

- The AI answer contains the character surrounded by extra explanations or formatting: the character part is used if it can be found unambiguously, otherwise the answer is treated as unusable.
- The AI background is empty, has a single paragraph, or is extremely long: an empty background counts as unusable; any non-empty background is accepted, and the existing "Show More" truncation handles length.
- The AI answer contains markup or script-like text: it is displayed as plain text, never interpreted.
- The user clicks Generate again, or leaves the page, while a request is in progress: the Generate and reroll buttons stay disabled until the request ends, and a result arriving after the user left does not overwrite anything unexpectedly.
- The user changes the provider in Settings while a request is in progress: the request finishes with the settings it started with.
- The saved settings in the browser are corrupted or from an unknown format: they are ignored, defaults are used ("No AI"), and nothing breaks.
- The provider is reachable from the user's machine but blocks requests from a web page (cross-origin restriction, e.g. Ollama without allowed origins): the message says the provider refused the browser's request and links to how to allow it.
- The site is served over HTTPS and the provider address is plain HTTP on another machine: the message explains that the browser blocks the request.

## Requirements _(mandatory)_

### Functional Requirements

**Provider choice and configuration**

- **FR-001**: Users MUST be able to choose exactly one provider type: "No AI", "Ollama (local)", or "OpenAI-compatible".
- **FR-002**: For "Ollama (local)", users MUST be able to set the server address and the model; for "OpenAI-compatible", the service address, the model and an API key (optional, since some local services need none).
- **FR-003**: The default provider type for a user with no saved settings MUST be "No AI".
- **FR-004**: Settings saved by previous versions (Ollama or Azure switches and fields) MUST be migrated to the new choice on first load, without the user re-entering anything.
- **FR-005**: The Settings page MUST state, next to the API key field, that the key is stored only in this browser and sent only to the chosen provider.
- **FR-006**: Users MUST be able to test the connection to the configured provider from Settings and see a success or a specific failure cause (unreachable, refused key, unknown model, blocked by the browser, too slow, unusable answer).

**Generation and reroll**

- **FR-007**: The app MUST decide the race, class, gender, alignment and age of a new character itself; the AI provider MUST only contribute the first name, last name, epithet and background.
- **FR-008**: When rerolling a property, the app MUST change only that property (choosing the new value itself) and MUST ask the AI provider, if any, only for a new background consistent with the updated character.
- **FR-009**: Any property value returned by the AI provider that the app did not ask for MUST be ignored.
- **FR-010**: Generation and reroll without an AI provider MUST complete without any artificial waiting time.
- **FR-011**: AI requests MUST stop after a time limit of 60 seconds.
- **FR-012**: The Generate and reroll actions MUST be unavailable while a request is in progress.

**Validation and fallback**

- **FR-013**: Every AI answer MUST be checked before use: names and epithet are non-empty text of reasonable length, and the background has a non-empty title and at least one non-empty paragraph.
- **FR-014**: If the background is unusable, or the answer cannot be read as a character at all, the app MUST use the result generated without AI for the whole character (generation) or for the background (reroll).
- **FR-015**: If only some name or epithet fields are missing or invalid while the background is usable, the app MUST fill those fields from its own content and keep the rest of the AI result.
- **FR-016**: After any AI request, the user MUST see one message stating which of these happened: full AI result, AI result completed with the app's content, or non-AI result because of a named cause.
- **FR-017**: Failure messages MUST name the cause in plain words and, where the user can fix it, say where (e.g. "Check the address in Settings").
- **FR-018**: AI-generated text MUST always be displayed as plain text.

**Shared behaviour**

- **FR-019**: Validation, fallback, time limit, reroll rules and messages MUST behave identically for every provider type; only the way the service is called may differ.

### Key Entities

- **Provider settings**: the user's choice of provider type plus its address, model and optional API key; stored in the browser; one active choice at a time.
- **AI contribution**: the part of a character the AI is allowed to produce (first name, last name, epithet, background title and paragraphs), checked before use.
- **Generation outcome**: the character finally shown plus how it was obtained (full AI, AI completed by the app, or non-AI with a cause), which drives the message shown to the user.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In a test campaign of 50 AI answers mixing valid, partially invalid, malformed and failed answers, 100% end with a complete character displayed and no broken screen.
- **SC-002**: In 100% of rerolls with an AI provider, exactly one property differs from the previous character (besides the background).
- **SC-003**: For each failure cause listed in FR-006, a user can tell from the message alone what went wrong and where to fix it (checked by reading each message in a review).
- **SC-004**: A user can configure a provider and confirm it works from Settings in under 2 minutes, without generating a character.
- **SC-005**: Without an AI provider, a new character appears in under half a second after clicking Generate (today it takes at least 1 second).
- **SC-006**: Users who had a provider configured before the update keep a working configuration after it, with no re-entry.

## Assumptions

- "OpenAI-compatible" covers the services the project cares about: OpenAI, GitHub Models, Azure AI services exposing the same chat API, and local servers such as LM Studio. A dedicated "Azure" type is therefore not kept; existing Azure settings are migrated to "OpenAI-compatible".
- The new value of a rerolled property is chosen by the app from its own lists (as today without AI); asking the AI to invent the new value is out of scope.
- 60 seconds is long enough for a local model on a modest machine to produce a background, and short enough that a stuck request does not feel endless.
- Cancelling an in-progress AI request from the UI is out of scope for this feature.
- Requests go directly from the browser to the provider (no backend, per the constitution); providers that refuse browser requests cannot be used, and the app explains why.
- UI texts stay in English in this feature; the French translation comes with the i18n feature.
- AI portraits and the restructuring of static content are out of scope.
