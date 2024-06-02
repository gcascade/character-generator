import { Ollama, OllamaCallOptions } from '@langchain/community/llms/ollama';
import {
  Character,
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';

type OllamaParams = {
  ollamaEndpoint: string;
  ollamaModelName: string;
};

const schema = {
  firstName: {
    type: 'string',
    description: 'The first name of the character',
  },
  lastName: {
    type: 'string',
    description: 'The last name of the character',
  },
  epithet: {
    type: 'string',
    description: "The character's epithet. Start with 'The'",
  },
  characterClass: {
    type: 'string',
    enum: Object.values(CharacterClasses),
    description: "The character's class",
  },
  gender: {
    type: 'string',
    enum: Object.values(Genders),
    description: "The character's gender",
  },
  race: {
    type: 'string',
    enum: Object.values(CharacterRaces),
    description: "The character's race",
  },
  aligment: {
    type: 'string',
    enum: Object.values(CharacterAlignments),
    description: "The character's alignment",
  },
  age: {
    type: 'integer',
    description: "The character's age",
  },
  background: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: "The title of the character's background",
      },
      content: {
        type: 'array',
        items: {
          type: 'string',
        },
        description:
          "The content of the character's background. Each element of the array is a paragraph of text. Content should be made of 4 to 6 paragraphs. Use third person.",
      },
    },
  },
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
    const { characterClass, gender, race, alignment, age } = character;

    const prompt = `Generate a ${age} year-old ${gender} ${race} ${characterClass} of ${alignment} alignment in a fantasy setting. Some values were already generated. Answer in JSON only. Schema: ${JSON.stringify(
      schema,
    )} All properties are required`;

    try {
      const answer = await ollama.invoke(prompt, {
        seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      } as OllamaCallOptions);

      const jsonObject = JSON.parse(answer);

      return {
        ...jsonObject,
        characterClass,
        gender,
        race,
        alignment,
        age,
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

    const prompt = `Generate a background for a character. Answer in JSON only. Schema: ${JSON.stringify(schema)} All properties are required. Here is the current character: ${JSON.stringify({ ...character, background: null })}`;

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
