# Character Generator

This app generates detailed fantasy characters, including attributes like race, class, and background.

[Try me](https://gcascade.github.io/character-generator/)

## Requirements

- Node.js

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
npm run start
```

- Build the project:

```sh
npm run build
```

- Run tests:

```sh
npm test
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

# API Integration

This app can use external APIs or tools to generate characters.

## Ollama

Install Ollama by following the instructions [here](https://github.com/ollama/ollama/blob/main/README.md)

To allow additional web origins to access Ollama, set the environment variable OLLAMA_ORIGINS. For more information, refer to the [FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama)

## Azure

You can also use Azure as a backend for character generation.

**To use Azure integration:**

1. Obtain your Azure OpenAI endpoint, model name, and API key from the Azure Portal.
2. In the app settings, enable "Azure API Integration" and fill in:
   - **Azure Endpoint** (e.g. `https://<your-resource-name>.openai.azure.com`)
   - **Azure Model Name** (e.g. `gpt-4`)
   - **Azure Token** (your API key)
3. Only one API (Ollama or Azure) can be enabled at a time.

For more details on Azure OpenAI, see the [Azure OpenAI documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/).

Github models are also usable : [Github Models](https://github.com/marketplace/models)
