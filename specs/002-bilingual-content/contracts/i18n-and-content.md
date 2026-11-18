# Contract: i18n and content rendering

Internal TypeScript contracts. Paths are planned locations.

## i18n (`src/i18n/`)

```ts
type Locale = 'en' | 'fr';
type MessageKey = keyof typeof import('../data/locales/en/ui.json');

const LocaleProvider: FC<{ children: ReactNode }>;
function useLocale(): { locale: Locale; setLocale(locale: Locale): void };
function useT(): (
  key: MessageKey,
  params?: Record<string, string | number>,
) => string;
function detectLocale(
  stored: string | null,
  browser: readonly string[],
): Locale;
```

Guarantees: `setLocale` updates every consumer without reload, persists the choice and sets `<html lang>`;
`t` never returns a key or an empty string for a known key in a supported locale.

## Content (`src/content/`)

```ts
function renderText(
  text: GenderedText,
  gender: Gender,
  names: { firstName; lastName; epithet? },
): string;
function renderCharacter(
  character: Character,
  locale: Locale,
): RenderedCharacter;
function label(
  kind: 'race' | 'class' | 'alignment' | 'gender',
  value: string,
  gender: Gender,
  locale: Locale,
): string;

function generateRandomCharacter(template?: Partial<Character>): Character; // always `content`
function rerollWithApp(
  character: Character,
  property: keyof Character,
): Character;
```

Guarantees: `renderCharacter` is pure and never returns placeholders or `{{`; for `content` characters the same
references render the same story in every locale; `rerollWithApp` changes only the property and its dependent
reference (research R6).

## AI layer additions (`src/ai/`)

- `newCharacterPrompt`, `backgroundRewritePrompt`, `nameRerollPrompt` take a `locale` and state the writing language.
- `GenerationOutcome.character` for AI results carries the AI `epithet`/`background` with `textLanguage: locale`,
  `textSource: 'ai'`.
- `translateWritten(provider, character, locale, signal): Promise<GenerationOutcome>` — rewrites the written epithet and background in `locale`;
  on failure returns the unchanged character with `failure` set.
