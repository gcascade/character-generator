import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { LOCKS_KEY } from '../content/storedLocks';
import useLocks from '../hooks/useLocks';
import { CharacterContext, CharacterProvider } from './CharacterContext';
import { LockProvider } from './LockContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CharacterProvider initCharacter={korvusBlackiron}>
    <LockProvider initialLocked={['race']}>{children}</LockProvider>
  </CharacterProvider>
);

const useBoth = () => ({
  locks: useLocks(),
  setCharacter: useContext(CharacterContext)!.setCharacter,
});

describe('LockProvider', () => {
  afterEach(() => localStorage.clear());

  it('toggles locks in display order and unlocks all', () => {
    const { result } = renderHook(useBoth, { wrapper });
    expect(result.current.locks.locked).toEqual(['race']);

    act(() => result.current.locks.toggle('firstName'));
    expect(result.current.locks.locked).toEqual(['firstName', 'race']);
    expect(result.current.locks.isLocked('firstName')).toBe(true);

    act(() => result.current.locks.toggle('race'));
    expect(result.current.locks.locked).toEqual(['firstName']);

    act(() => result.current.locks.unlockAll());
    expect(result.current.locks.locked).toEqual([]);
  });

  it('saves the locked values, following the current character', () => {
    const { result } = renderHook(useBoth, { wrapper });
    const saved = () => JSON.parse(localStorage.getItem(LOCKS_KEY)!);
    expect(saved()).toEqual({
      version: 1,
      template: { race: korvusBlackiron.race },
    });

    act(() => result.current.setCharacter({ ...korvusBlackiron, race: 'Elf' }));
    expect(saved().template).toEqual({ race: 'Elf' });
  });

  it('throws without a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(useLocks)).toThrow(
      'useLocks must be used within a LockProvider',
    );
  });
});
