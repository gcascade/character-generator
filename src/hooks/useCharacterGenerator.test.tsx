import { CharacterProvider } from '@Contexts/CharacterContext';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import useCharacterGenerator from './useCharacterGenerator';

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
    expect(result.current.character.background.content.length).toBeGreaterThan(
      0,
    );
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
