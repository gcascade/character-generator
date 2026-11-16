import { useCallback, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import { generateRandomCharacter } from '../utils/character';
import useAzure from './useAzure';
import useOllama from './useOllama';

export type ApiParams = {
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
  const ollama = useOllama();
  const azure = useAzure();

  const generateNewCharacter = useCallback(
    async ({ apiType, endpoint, modelName, token }: ApiParams) => {
      let newCharacter = generateRandomCharacter({});

      switch (apiType) {
        case 'ollama':
          newCharacter = await ollama.generateCharacterFromTemplateCharacter(
            newCharacter,
            {
              ollamaEndpoint: endpoint ?? '',
              ollamaModelName: modelName ?? '',
            },
          );
          break;
        case 'azure':
          newCharacter = await azure.generateCharacterFromTemplateCharacter(
            newCharacter,
            {
              endpoint: endpoint ?? '',
              model: modelName ?? '',
              token: token ?? '',
            },
          );
          break;
        case 'none':
          break;
        default:
          assertNever(apiType);
      }

      setCharacter(newCharacter);
    },
    [ollama, azure, setCharacter],
  );

  const rerollCharacterProperty = useCallback(
    async (
      property: keyof Character,
      { apiType, endpoint, modelName, token }: ApiParams,
    ) => {
      let updatedCharacter = generateRandomCharacter({
        ...character,
        [property]: undefined,
      });

      switch (apiType) {
        case 'ollama':
          updatedCharacter = await ollama.generateBackground(updatedCharacter, {
            ollamaEndpoint: endpoint ?? '',
            ollamaModelName: modelName ?? '',
          });
          break;
        case 'azure':
          updatedCharacter = await azure.generateBackground(updatedCharacter, {
            endpoint: endpoint ?? '',
            model: modelName ?? '',
            token: token ?? '',
          });
          break;
        case 'none':
          break;
        default:
          assertNever(apiType);
      }

      setCharacter(updatedCharacter);
    },
    [character, ollama, azure, setCharacter],
  );

  return { generateNewCharacter, rerollCharacterProperty };
};

export default useCharacterGenerator;
