import { CharacterProvider } from '@Contexts/CharacterContext';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import useCharacterGenerator from './useCharacterGenerator';
import { renderCharacter } from '../content/character';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CharacterProvider initCharacter={korvusBlackiron}>
    {children}
  </CharacterProvider>
);

const renderGenerator = () =>
  renderHook(
    () => ({
      generator: useCharacterGenerator(),
      character: useContext(CharacterContext)!.character,
    }),
    { wrapper },
  );

describe('useCharacterGenerator without AI', () => {
  it('generates a new character', async () => {
    const { result } = renderGenerator();

    await act(() =>
      result.current.generator.generateNewCharacter(
        undefined,
        new AbortController().signal,
      ),
    );

    expect(result.current.character).not.toBe(korvusBlackiron);
    expect(
      renderCharacter(result.current.character, 'en').background.content,
    ).toHaveLength(4);
  });

  it('rerolls a single property and keeps the others', async () => {
    const { result } = renderGenerator();

    await act(() =>
      result.current.generator.rerollCharacterProperty(
        'race',
        undefined,
        new AbortController().signal,
      ),
    );

    const { race, ...rest } = result.current.character;
    expect(race).toBeDefined();
    expect(rest).toMatchObject({
      firstName: korvusBlackiron.firstName,
      lastName: korvusBlackiron.lastName,
      epithet: korvusBlackiron.epithet,
      characterClass: korvusBlackiron.characterClass,
      gender: korvusBlackiron.gender,
      alignment: korvusBlackiron.alignment,
      age: korvusBlackiron.age,
    });
  });
});

describe('useCharacterGenerator and saved characters (spec 006)', () => {
  it('drops the saved id when a saved character is rerolled', async () => {
    const saved = { ...korvusBlackiron, id: 'saved-1' };
    const { result } = renderHook(
      () => ({
        generator: useCharacterGenerator(),
        character: useContext(CharacterContext)!.character,
      }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <CharacterProvider initCharacter={saved}>
            {children}
          </CharacterProvider>
        ),
      },
    );
    await act(() =>
      result.current.generator.rerollCharacterProperty(
        'age',
        undefined,
        new AbortController().signal,
      ),
    );
    expect(result.current.character.id).toBeUndefined();
  });
});
