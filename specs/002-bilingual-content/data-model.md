# Data Model: Bilingual App and Fragment-Based Content

## Locale

`"en" | "fr"`, stored in `localStorage["locale"]`; default from the browser (research R8).

## GenderedText

A string, possibly containing `{{masculine|feminine|non-binary}}` selections and name placeholders
(`{firstName}`, `{lastName}`, `{fullName}`, `{epithet}`), or an object `{ m, f, n }` of such strings.
Rendering picks `m` for Male, `f` for Female, `n` for Non-binary.

Rules (checked by the data test):

- every `{{…}}` has exactly 3 options;
- only known placeholders;
- French `n` forms contain no neopronoun (`iel`, `iels`) and no inclusive punctuation (`·`, `.e`, `(e)`).

## Fragment

Language-independent definition in `src/data/content/fragments.json`:

| Field            | Type                                                  | Rules                                              |
| ---------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `id`             | string                                                | unique, kebab-case, e.g. `origin-dwarf-forge-hold` |
| `category`       | `title \| origin \| training \| turningPoint \| goal` |                                                    |
| `race`           | CharacterRace                                         | required for `origin`, absent otherwise            |
| `characterClass` | CharacterClass                                        | required for `training`, absent otherwise          |
| `alignment`      | CharacterAlignment                                    | required for `turningPoint`, absent otherwise      |

Text per locale in `src/data/locales/<locale>/<category>.json`: `{ "<id>": GenderedText }`.

Minimums (FR-009): 4 origins per race, 4 trainings per class, 3 turning points per alignment, 10 goals, 6 titles.

## Epithet

Ids in `src/data/content/epithets.json`; text per locale in `epithets.json`: `{ "<id>": GenderedText }`
(English usually the same text for all genders, French with agreement and a neutral form).

## Names

`src/data/content/names/<race>.json`:

| Field                                         | Rules                  |
| --------------------------------------------- | ---------------------- |
| `first.male`, `first.female`, `first.neutral` | ≥ 40 unique names each |
| `last`                                        | ≥ 40 unique names      |

Names are not translated.

## Labels

`src/data/locales/<locale>/labels.json`: for each race, class, alignment and gender, a GenderedText
(French: agreement for m/f, category name for n — research R3).

## UI messages

`src/data/locales/<locale>/ui.json`: flat `{ "<key>": "text with {param}" }`; same keys and placeholders in every
locale.

## Character (stored)

| Field                                                  | Type                                                                   | Notes                               |
| ------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------- |
| `firstName`, `lastName`                                | string                                                                 |                                     |
| `race`, `characterClass`, `gender`, `alignment`, `age` | as today                                                               |                                     |
| `content`                                              | `{ titleId, originId, trainingId, turningPointId, goalId, epithetId }` | always set for new characters       |
| `epithet`                                              | string (optional)                                                      | written text, overrides `epithetId` |
| `background`                                           | `{ title; content[] }` (optional)                                      | written text, overrides fragments   |
| `textLanguage`                                         | `Locale` (optional)                                                    | language of the written text        |
| `textSource`                                           | `"ai" \| "legacy"` (optional)                                          | who wrote it                        |

Implementation note: the planned exclusive `content` / `written` pair became flat optional text fields over
`content`, so that rerolling a property without AI can drop only the text that no longer fits (the background
after a race change, the epithet after an epithet reroll) and fall back to fragments for it.

Transitions:

- generate without AI → `content` only;
- generate with AI, success → `content` plus AI `epithet`/`background` (`textSource: "ai"`, current locale);
  AI failure → `content` only;
- reroll race/class/alignment without AI → the matching `content` id changes and the written background is dropped;
  with AI, the AI rewrites `background` in the current locale (spec 001 behaviour);
- "Translate with AI" → `textLanguage` and texts replaced;
- legacy stored character (`background` text, no `content`) → `textLanguage: "en"`, `textSource: "legacy"`;
  `content` is created at its first reroll.

## Rendered character (display only)

`renderCharacter(character, locale)` → `{ epithet, background: { title, content[] }, labels, writtenIn?: Locale,
writtenBy?: "ai" | "legacy" }`. `writtenIn` is set only when the text language differs from the locale.
