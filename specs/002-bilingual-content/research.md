# Research: Bilingual App and Fragment-Based Content

## R1. Translating the interface

- **Decision**: a small in-house i18n module (`src/i18n/`): a `LocaleProvider` (locale state, browser detection,
  persistence, `<html lang>`), a `useT()` hook returning `t(key, params)` with `{name}` interpolation, and one
  messages file per locale in `src/data/locales/{en,fr}/ui.json`. The key type is derived from the English file, so a
  wrong key fails the type check; a data test checks that French has exactly the same keys and placeholders.
- **Rationale**: two languages, a few hundred strings, no plurals beyond a couple of counts (handled with two keys).
  Constitution VI (no dependency without a current need) and II (content is data, per locale). ~60 lines that the
  maintainer can read entirely, typed end to end.
- **Alternatives considered**: `react-i18next` (mature, plural/ICU support, ~40 kB with i18next; overkill for two
  locales and no ICU needs, adds a second way to load data); `react-intl`/FormatJS (ICU MessageFormat, heavier, more
  concepts); Lingui (compile step). Any of them can replace the module later behind the same `useT()` hook.

## R2. Grammatical gender in fragments

- **Decision**: one inline syntax for every gendered piece of text, in any language:
  `{{masculine|feminine|non-binary}}`, e.g. EN `{{He|She|They}} {{was|was|were}} born…`,
  FR `{{Il est né|Elle est née|Venu au monde}} à…`. Name placeholders: `{firstName}`, `{lastName}`, `{fullName}`,
  `{epithet}`. A fragment whose sentences differ too much per gender may instead give an object
  `{ "m": "...", "f": "...", "n": "..." }`.
- **French non-binary**: the third option is written as neutral phrasing (participial clauses, the name, epicene words),
  never a neopronoun or inclusive punctuation (spec clarification). The data test rejects `iel`, `·` and `.e` patterns.
- **Rationale**: one renderer for all languages; writers see all forms side by side; adding a language needs only data.
- **Alternatives considered**: pronoun tokens (`{they}`, `{their}`) — enough for English but not for French
  agreements of participles and adjectives; ICU `select` — same idea, heavier syntax and parser.

## R3. Labels (race, class, alignment, gender) in French

- **Decision**: labels live in the locale data with three forms. French masculine/feminine use agreement
  ("Nain Guerrier" / "Naine Guerrière", "Loyal Bon" / "Loyale Bonne"). For non-binary characters, labels show the
  **category name** (the dictionary entry, e.g. "Nain", "Guerrier", "Loyal Bon"), presented as the name of the people
  or class, not as an adjective about the person; epicene words are preferred where they exist ("Elfe", "Mage").
- **Rationale**: labels are categories, not descriptions; French has no neutral form for most of these nouns, and the
  clarified rule forbids neopronouns and inclusive punctuation. **To confirm with the maintainer during review.**
- **Alternatives considered**: inclusive forms ("Nain·e") — excluded by the clarification; periphrases
  ("de race naine") — heavy in a compact label.

## R4. How characters are stored

- **Decision**: a character keeps its rules values (race, class, gender, alignment, age) and names, plus either
  - `content: { titleId, originId, trainingId, turningPointId, goalId, epithetId }` — app-made, rendered in the current
    locale at display time; or
  - `written: { language, source: "ai" | "legacy", epithet, background }` — text shown as written.
    Characters saved by previous versions (with `background` text and no `content`) are read as
    `written` with `language: "en"`, `source: "legacy"`. Saved characters and history are validated with zod when read
    from the browser (constitution IV); invalid entries are dropped.
- **Rationale**: re-rendering on language change (FR-008, FR-016) needs references, not text. Separating "content to
  render" from "text written by someone" makes the label of FR-015 a simple check.
- **Alternatives considered**: storing both languages' text (doubles storage, still needs references for rerolls);
  re-generating on language change (breaks "same story", spec US2-5).

## R5. Content files

- **Decision**: per-locale folders, same file names and ids in each:
  `src/data/locales/{en,fr}/{ui,labels,titles,origins,trainings,turningPoints,goals,epithets}.json`.
  Language-independent data in `src/data/content/`: `fragments.json` (id → applies-to: race, class or alignment),
  `epithets.json` (ids), `names/{human,elf,dwarf,orc}.json` (`first.male`, `first.female`, `first.neutral`, `last`).
  The old `backgrounds.json` and `characterNames.json` are removed; their best passages are rewritten as fragments.
- **Rationale**: constitution II ("organised per locale", "adding a language requires only data"): a new language is a
  new folder; a new race is new entries plus a names file. Ids shared across locales make parity testable.
- **Data test** (`src/data/content.test.ts`): every id exists in every locale; every gendered text has 3 forms;
  placeholders are known; minimum counts per race/class/alignment (FR-009); names ≥ 40 per list (US3-5); no French
  neopronoun/inclusive punctuation; every UI key and placeholder present in both locales.

## R6. Generation and rerolls

- **Decision**: `generateRandomCharacter` picks names from the race lists (neutral first names for non-binary) and
  one fragment id per category matching the character. Rerolls change only the dependent reference: race → `originId`,
  class → `trainingId`, alignment → `turningPointId`; gender reroll keeps the last name and rerolls the first name only
  if it is not in the new gender's list (spec edge case); name/epithet rerolls change only that field. Race rerolls keep
  the names (the user asked to change one property); new characters always get race-appropriate names.
- **Distinctness**: with the minimum counts, one combination has 6 × 4 × 4 × 3 × 10 = 2,880 possible backgrounds;
  SC-002 (≥ 60 distinct in 100 draws) is checked by a test.

## R7. AI and language

- **Decision**: prompts get a `language` parameter ("Write in French." / "Write in English.") and the outcome stores AI
  text as `written: { language: locale, source: "ai" }`. "Translate with AI" sends the epithet and background with
  "Translate into {language}, keep the story and the names" and replaces `written` on success; it reuses the AI layer's
  validation, time limit and messages (spec 001). Fallback content is app-made (references), so it follows the locale.
- **Rationale**: no change to the provider adapters; the orchestration gains one operation.

## R8. Language detection and persistence

- **Decision**: `localStorage["locale"]` if valid ("en" | "fr"); else the first `navigator.languages` entry starting
  with `fr` → French, otherwise English. `document.documentElement.lang` follows the locale (FR-004).
