import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import { Character } from '@Types/character';
import { buildBackgroundPrompt, buildCharacterPrompt } from '../utils/prompt';

type AzureParams = {
  token: string;
  endpoint: string;
  model: string;
};

const useAzure = () => {
  const createAzureClient = ({ token, endpoint }: Partial<AzureParams>) => {
    if (!token || !endpoint) {
      throw new Error('Azure token and endpoint are required');
    }
    return ModelClient(endpoint, new AzureKeyCredential(token));
  };

  const generateCharacterFromTemplateCharacter = async (
    character: Character,
    params: AzureParams,
  ): Promise<Character> => {
    const client = createAzureClient(params);
    const userPrompt = buildCharacterPrompt(character);

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1.0,
        top_p: 1.0,
        model: params.model,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const content = response.body?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Azure API');
    }

    let jsonObject: Character;
    try {
      jsonObject = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      throw new Error('Failed to parse character JSON from Azure response');
    }

    return {
      ...jsonObject,
      characterClass: character.characterClass,
      gender: character.gender,
      race: character.race,
      alignment: character.alignment,
      age: character.age,
    };
  };

  const generateBackground = async (
    character: Character,
    params: AzureParams,
  ): Promise<Character> => {
    const client = createAzureClient(params);
    const userPrompt = buildBackgroundPrompt(character);

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1.0,
        top_p: 1.0,
        model: params.model,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const content = response.body?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from Azure API');
    }

    let jsonObject: Character;
    try {
      jsonObject = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      throw new Error('Failed to parse character JSON from Azure response');
    }

    return {
      ...jsonObject,
      characterClass: character.characterClass,
      gender: character.gender,
      race: character.race,
      alignment: character.alignment,
      age: character.age,
    };
  };

  return {
    generateCharacterFromTemplateCharacter,
    generateBackground,
  };
};

export default useAzure;
