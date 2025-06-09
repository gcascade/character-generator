import { useCallback, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import { generateRandomCharacter } from '../utils/character';
import useAzure from './useAzure';
import useOllama from './useOllama';

type ApiParams = {
  apiType: 'ollama' | 'azure' | 'none';
  endpoint?: string;
  modelName?: string;
  token?: string;
};

const assertNever = (x: never): never => {
  throw new Error(`Unsupported API type: ${x}`);
};

const useCharacterGenerator = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'useCharacterGenerator must be used within a CharacterProvider',
    );
  }
  const { character, setCharacter } = context;
  const {
    generateCharacterFromTemplateCharacter:
      generateCharacterFromTemplateCharacterOllama,
    generateBackground: generateBackgroundOllama,
  } = useOllama();

  const {
    generateCharacterFromTemplateCharacter:
      generateCharacterFromTemplateCharacterAzure,
    generateBackground: generateBackgroundAzure,
  } = useAzure();

  const useRandomCharacter = () => {
    const generateNewCharacter = useCallback(
      async ({
        apiType,
        endpoint,
        modelName,
        token,
      }: ApiParams): Promise<void> => {
        let character = generateRandomCharacter({});

        switch (apiType) {
          case 'ollama':
            character = await generateCharacterFromTemplateCharacterOllama(
              character,
              {
                ollamaEndpoint: endpoint ?? '',
                ollamaModelName: modelName ?? '',
              },
            );
            break;
          case 'azure':
            character = await generateCharacterFromTemplateCharacterAzure(
              character,
              {
                endpoint: endpoint ?? '',
                model: modelName ?? '',
                token: token ?? '',
              },
            );
            break;
          case 'none':
            // If no API is specified, just use the generated character without any API call
            break;
          default:
            assertNever(apiType);
        }

        setCharacter(character);
      },
      [],
    );

    const rerollCharacterProperty = useCallback(
      async (
        property: keyof Character,
        { apiType, endpoint, modelName, token }: ApiParams,
      ): Promise<void> => {
        let updatedCharacter = generateRandomCharacter({
          ...character,
          [property]: null,
        });

        switch (apiType) {
          case 'ollama':
            updatedCharacter = await generateBackgroundOllama(
              updatedCharacter,
              {
                ollamaEndpoint: endpoint ?? '',
                ollamaModelName: modelName ?? '',
              },
            );
            break;
          case 'azure':
            updatedCharacter = await generateBackgroundAzure(updatedCharacter, {
              endpoint: endpoint ?? '',
              model: modelName ?? '',
              token: token ?? '',
            });
            break;
          default:
            throw new Error(`Unsupported API type: ${apiType}`);
        }

        setCharacter(updatedCharacter);
      },
      [character],
    );

    return {
      generateNewCharacter,
      rerollCharacterProperty,
    };
  };

  return useRandomCharacter();
};

export default useCharacterGenerator;
