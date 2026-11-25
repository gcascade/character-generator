import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { generateRandomCharacter } from '../content/generate';
import { ARENA_KEY } from '../content/storedArena';
import useArena from '../hooks/useArena';
import { ArenaProvider } from './ArenaContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ArenaProvider>{children}</ArenaProvider>
);

describe('ArenaContext (spec 012)', () => {
  afterEach(() => localStorage.clear());

  it('throws without its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useArena())).toThrow(/ArenaProvider/);
  });

  it('keeps the roster between visits', () => {
    const { result, unmount } = renderHook(() => useArena(), { wrapper });
    act(() => result.current.addCharacter(generateRandomCharacter()));
    act(() => result.current.addRandom(2));
    expect(result.current.setup.contestants).toHaveLength(3);
    unmount();
    expect(localStorage.getItem(ARENA_KEY)).toContain('"version":1');
    const { result: reloaded } = renderHook(() => useArena(), { wrapper });
    expect(reloaded.current.setup).toEqual(result.current.setup);
  });

  it('draws again with a new seed and shows the first round', () => {
    const { result } = renderHook(() => useArena(), { wrapper });
    const seed = result.current.setup.seed;
    act(() => result.current.newDraw());
    expect(result.current.setup.seed).not.toBe(seed);
    expect(result.current.setup.shownRounds).toBe(1);
  });
});
