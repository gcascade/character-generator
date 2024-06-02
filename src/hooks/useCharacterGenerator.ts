import { useCallback, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import { generateRandomCharacter } from '../utils/character';
import useOllama from './useOllama';

type OllamaParams = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
};

const useCharacterGenerator = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'useCharacterGenerator must be used within a CharacterProvider',
    );
  }
  const { character, setCharacter } = context;
  const { generateCharacterFromTemplateCharacter, generateBackground } =
    useOllama();

  const useRandomCharacter = () => {
    const generateNewCharacter = useCallback(
      async ({
        useOllamaAPI,
        ollamaEndpoint,
        ollamaModelName,
      }: OllamaParams): Promise<void> => {
        let character = generateRandomCharacter({});

        if (useOllamaAPI) {
          character = await generateCharacterFromTemplateCharacter(character, {
            ollamaEndpoint,
            ollamaModelName,
          });
        }

        setCharacter(character);
      },
      [],
    );

    const rerollCharacterProperty = useCallback(
      async (
        property: keyof Character,
        { useOllamaAPI, ollamaEndpoint, ollamaModelName }: OllamaParams,
      ): Promise<void> => {
        let updatedCharacter = generateRandomCharacter({
          ...character,
          [property]: null,
        });

        if (useOllamaAPI) {
          updatedCharacter = await generateBackground(updatedCharacter, {
            ollamaEndpoint,
            ollamaModelName,
          });
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
