import { useCallback, useContext } from 'react';
import { generateCharacter, rerollProperty } from '../ai/generate';
import type { AiProvider } from '../ai/providers';
import type { GenerationOutcome } from '../ai/types';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';

/**
 * Generates or rerolls the current character through the AI layer and applies
 * the result. The AI layer always returns a complete character.
 */
const useCharacterGenerator = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'useCharacterGenerator must be used within a CharacterProvider',
    );
  }

  const { character, setCharacter } = context;

  const generateNewCharacter = useCallback(
    async (
      provider: AiProvider | undefined,
      signal: AbortSignal,
    ): Promise<GenerationOutcome> => {
      const outcome = await generateCharacter(provider, signal);
      setCharacter(outcome.character);
      return outcome;
    },
    [setCharacter],
  );

  const rerollCharacterProperty = useCallback(
    async (
      property: keyof Character,
      provider: AiProvider | undefined,
      signal: AbortSignal,
    ): Promise<GenerationOutcome> => {
      const outcome = await rerollProperty(
        provider,
        character,
        property,
        signal,
      );
      setCharacter(outcome.character);
      return outcome;
    },
    [character, setCharacter],
  );

  return { generateNewCharacter, rerollCharacterProperty };
};

export default useCharacterGenerator;
