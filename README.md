# Character Generator

This app generates detailed fantasy characters, including attributes like race, class, and background.
It is available in English and French: the language follows your browser, and can be changed at the bottom of the
menu or in **Settings**.

[Try me](https://gcascade.github.io/character-generator/)

## Requirements

- Node.js 22.12 or later

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/gcascade/character-generator.git
   cd character-generator
   ```

2. Install dependencies
   ```sh
   npm install
   ```

## Available Commands

- Start the development server:

```sh
npm start
```

- Build the project:

```sh
npm run build
```

- Run tests:

```sh
npm test
```

- Type check:

```sh
npm run typecheck
```

- Lint the code:

```sh
npm run lint
```

- Format code with Prettier:

```sh
npm run prettier
```

- Start Storybook:

```sh
npm run storybook
```

- Build Storybook:

```sh
npm run build-storybook
```

# Look and feel

A heroic fantasy theme: Cinzel titles, Alegreya story text and Alegreya Sans interface (self-hosted, no request to a
font service), a parchment light mode and a candle-lit dark mode. The mode follows the system by default and can be
changed at the bottom of the menu or in **Settings**. Colours live in `src/themes/palette.ts`; a test checks that every
text and badge colour meets WCAG AA contrast in both modes.

# My characters

Saved characters are listed in **My characters**. Click one to open its page (`/characters/<id>`): portrait, every
property and the full story. From there you can open it again in the generator, delete it, or translate AI-written
text.

# Locking properties

Each property of the generated character has a padlock. A locked property keeps its value when you click
**Generate**; the others are drawn at random among the values that fit it (a locked age of 300 only gives elves and
dwarves, a locked first name only the genders whose name list has it). The dice still reroll a locked property, and
the lock keeps the new value. Locks are remembered on this device; **Unlock all** clears them. With an AI provider,
locked values are given to the AI as fixed facts.

# Content

Without AI, each background is assembled from fragments: a title, an origin (by race), a training (by class), a
turning point (by alignment) and a goal. Characters store only fragment ids, so the same character reads the same
story in every language.

- `src/data/content/fragments.json` lists the fragment ids and what they apply to (race, class, alignment);
  `src/data/content/epithets.json` lists epithet ids; `src/data/content/names/<race>.json` holds first names
  (masculine, feminine, neutral) and last names.
- `src/data/locales/<locale>/` holds the texts: `ui.json` (interface), `labels.json` (race, class, gender and
  alignment names) and one file per fragment category plus `epithets.json`.

Texts may use `{firstName}`, `{lastName}`, `{fullName}`, `{epithet}` and `{Epithet}`, and
`{{masculine|feminine|non-binary}}` for words that depend on the gender. French non-binary forms use neutral
phrasing (the name, epicene words), never neopronouns or inclusive punctuation. `src/data/content.test.ts` checks
that every locale has every text, with the same placeholders, and that each one renders for every gender.

- **Add a fragment**: add its id to `fragments.json`, then its text in every locale.
- **Add a race**: add it to `CharacterRaces` in `src/types/character.ts`, its labels, a name list, origin
  fragments in every locale, and portraits under `public/images/<race>/`.
- **Add a language**: add a folder under `src/data/locales/` with every file, register it in `src/i18n/` and
  `src/content/data.ts`; the tests list what is missing.

Characters saved by earlier versions keep their English text, labelled "Written in English" in other languages.

# AI generation (optional)

The generator works without any AI. Optionally, an AI provider can write names, epithets and backgrounds; race,
class, gender, alignment and age are always chosen by the app. If the AI fails or answers badly, you still get a
complete character and a message explaining what happened.

The AI writes in the interface language. Its text keeps that language when you switch: it is then labelled, and a
**Translate with AI** button rewrites it in the new language.

Choose a provider in **Settings**, then use **Test connection**: it checks the provider and lists its models.

| Provider               | What to enter                                                      |
| ---------------------- | ------------------------------------------------------------------ |
| **Ollama (local)**     | Address (default `http://localhost:11434`) and model               |
| **Claude (Anthropic)** | Model (default `claude-opus-5-5`) and an Anthropic API key         |
| **OpenAI-compatible**  | Base URL, model and API key of any service speaking the OpenAI API |

OpenAI-compatible examples:

| Service           | Base URL                                       |
| ----------------- | ---------------------------------------------- |
| GitHub Models     | `https://models.github.ai/inference` (default) |
| OpenAI            | `https://api.openai.com/v1`                    |
| Mistral           | `https://api.mistral.ai/v1`                    |
| OpenRouter        | `https://openrouter.ai/api/v1`                 |
| LM Studio (local) | `http://localhost:1234/v1`                     |

## Ollama and the deployed site

Requests go straight from your browser to Ollama, so Ollama must allow the site's origin. Set the environment
variable `OLLAMA_ORIGINS` (for example to `https://gcascade.github.io`) and restart Ollama; see the
[Ollama FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama).
Browsers block requests from an `https` page to a plain `http` address other than `localhost`, so a remote Ollama
needs `https`.

## API keys

Keys stay in your browser and are only sent to the provider you chose. With **Remember on this device** checked
(default) the key is kept after you close the browser; unchecked, it is deleted when you close the tab.
**Forget key** deletes it immediately. There is no server: anyone with access to this browser profile can read
a remembered key.

## Limitations

- Classic Azure OpenAI resources that only accept an `api-key` header are not supported; Azure AI model inference
  endpoints and GitHub Models are.
- Settings from previous versions (Ollama / Azure) are converted automatically on first load.
