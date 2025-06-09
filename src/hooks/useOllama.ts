import { Ollama, OllamaCallOptions } from '@langchain/community/llms/ollama';
import { Character } from '../types/character';
import { buildBackgroundPrompt, buildCharacterPrompt } from '../utils/prompt';

type OllamaParams = {
  ollamaEndpoint: string;
  ollamaModelName: string;
};

const useOllama = () => {
  const createOllamaInstance = ({
    ollamaEndpoint,
    ollamaModelName,
  }: OllamaParams) => {
    return new Ollama({
      baseUrl: ollamaEndpoint,
      model: ollamaModelName,
      format: 'json',
    });
  };

  const generateCharacterFromTemplateCharacter = async (
    character: Character,
    params: OllamaParams,
  ): Promise<Character> => {
    const ollama = createOllamaInstance(params);
    const prompt = buildCharacterPrompt(character);

    try {
      const answer = await ollama.invoke(prompt, {
        seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      } as OllamaCallOptions);

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
      throw new Error('Failed to generate data from Ollama API');
    }
  };

  const generateBackground = async (
    character: Character,
    params: OllamaParams,
  ): Promise<Character> => {
    const ollama = createOllamaInstance(params);
    const prompt = buildBackgroundPrompt(character);

    try {
      const answer = await ollama.invoke(prompt, {
        seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      } as OllamaCallOptions);

      const jsonObject = JSON.parse(answer);

      return {
        ...character,
        background: jsonObject.background,
      };
    } catch (error) {
      console.error('Error during API call:', error);
      throw new Error('Failed to generate data from Ollama API');
    }
  };

  return {
    generateCharacterFromTemplateCharacter,
    generateBackground,
  };
};

export default useOllama;
