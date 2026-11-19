import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { generateRandomCharacter } from '../content/generate';
import { DataContext, DataProvider } from './DataContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <DataProvider>{children}</DataProvider>
);
const useData = () => useContext(DataContext)!;
const stored = () => JSON.parse(localStorage.getItem('characters')!);

describe('DataProvider', () => {
  afterEach(() => localStorage.clear());

  it('gives ids to characters saved without one and saves them back', () => {
    const old = generateRandomCharacter();
    localStorage.setItem('characters', JSON.stringify([old]));
    const { result } = renderHook(useData, { wrapper });
    const [loaded] = result.current.characters;
    expect(loaded.id).toBeTruthy();
    expect(stored()[0].id).toBe(loaded.id);
  });

  it('saves a copy with a new id and finds it', () => {
    const { result } = renderHook(useData, { wrapper });
    const character = generateRandomCharacter();
    let saved = character;
    act(() => {
      saved = result.current.saveCharacter(character);
    });
    expect(saved).not.toBe(character);
    expect(saved.id).toBeTruthy();
    expect(result.current.findCharacter(saved.id!)).toEqual(saved);
  });

  it('deletes one of two identical-looking characters (SC-004)', () => {
    const { result } = renderHook(useData, { wrapper });
    const character = generateRandomCharacter();
    let first = character;
    act(() => {
      first = result.current.saveCharacter(character);
      result.current.saveCharacter(character);
    });
    act(() => result.current.removeCharacter(first.id!));
    expect(result.current.characters).toHaveLength(1);
    expect(result.current.characters[0].id).not.toBe(first.id);
  });

  it('updates a saved character by id', () => {
    const { result } = renderHook(useData, { wrapper });
    let saved = generateRandomCharacter();
    act(() => {
      saved = result.current.saveCharacter(saved);
    });
    act(() =>
      result.current.updateCharacter({ ...saved, firstName: 'Renamed' }),
    );
    expect(result.current.characters[0].firstName).toBe('Renamed');
  });
});
