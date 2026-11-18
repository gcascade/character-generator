import { useCallback, useContext } from 'react';
import {
  generateCharacter,
  rerollProperty,
  translateWritten,
} from '../ai/generate';
import type { AiProvider } from '../ai/providers';
import type { GenerationOutcome } from '../ai/types';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import type { Locale } from '../i18n';

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
      locale: Locale = 'en',
    ): Promise<GenerationOutcome> => {
      const outcome = await generateCharacter(provider, signal, locale);
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
      locale: Locale = 'en',
    ): Promise<GenerationOutcome> => {
      const outcome = await rerollProperty(
        provider,
        character,
        property,
        signal,
        locale,
      );
      setCharacter(outcome.character);
      return outcome;
    },
    [character, setCharacter],
  );

  const translateCharacter = useCallback(
    async (
      provider: AiProvider,
      signal: AbortSignal,
      locale: Locale,
    ): Promise<GenerationOutcome> => {
      const outcome = await translateWritten(
        provider,
        character,
        locale,
        signal,
      );
      setCharacter(outcome.character);
      return outcome;
    },
    [character, setCharacter],
  );

  return { generateNewCharacter, rerollCharacterProperty, translateCharacter };
};

export default useCharacterGenerator;
