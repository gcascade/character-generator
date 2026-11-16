import { Character } from '../types/character';
import { buildBackgroundPrompt, buildCharacterPrompt } from '../utils/prompt';

type OllamaParams = {
  ollamaEndpoint: string;
  ollamaModelName: string;
};

const useOllama = () => {
  const generate = async (
    prompt: string,
    { ollamaEndpoint, ollamaModelName }: OllamaParams,
  ): Promise<string> => {
    const response = await fetch(
      `${ollamaEndpoint.replace(/\/+$/, '')}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModelName,
          prompt,
          format: 'json',
          stream: false,
          options: {
            seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Ollama API responded with HTTP ${response.status}`);
    }

    const body: { response: string } = await response.json();
    return body.response;
  };

  const generateCharacterFromTemplateCharacter = async (
    character: Character,
    params: OllamaParams,
  ): Promise<Character> => {
    const prompt = buildCharacterPrompt(character);

    try {
      const answer = await generate(prompt, params);

      const jsonObject = JSON.parse(answer);

      return {
        ...jsonObject,
        characterClass: character.characterClass,
        gender: character.gender,
        race: character.race,
        alignment: character.alignment,
        age: character.age,
      };
    } catch (error) {
      console.error('Error during API call:', error);
      throw new Error('Failed to generate data from Ollama API', {
        cause: error,
      });
    }
  };

  const generateBackground = async (
    character: Character,
    params: OllamaParams,
  ): Promise<Character> => {
    const prompt = buildBackgroundPrompt(character);

    try {
      const answer = await generate(prompt, params);

      const jsonObject = JSON.parse(answer);

      return {
        ...character,
        background: jsonObject.background,
      };
    } catch (error) {
      console.error('Error during API call:', error);
      throw new Error('Failed to generate data from Ollama API', {
        cause: error,
      });
    }
  };

  return {
    generateCharacterFromTemplateCharacter,
    generateBackground,
  };
};

export default useOllama;
