# Character Generator

This app generates detailed fantasy characters, including attributes like race, class, and background.

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

# AI generation (optional)

The generator works without any AI. Optionally, an AI provider can write names, epithets and backgrounds; race,
class, gender, alignment and age are always chosen by the app. If the AI fails or answers badly, you still get a
complete character and a message explaining what happened.

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
