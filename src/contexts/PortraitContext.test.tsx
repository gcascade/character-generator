import { PAINTED_IMAGE } from '@Test/stubs/horde';
import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import usePortraits from '../hooks/usePortraits';
import { PortraitProvider } from './PortraitContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PortraitProvider>{children}</PortraitProvider>
);
const traits = {
  race: 'Gnome' as const,
  gender: 'Female' as const,
  ageBand: 'adult' as const,
  role: 'Bard',
};

describe('PortraitProvider (spec 011)', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores, finds and removes portraits', () => {
    const { result } = renderHook(usePortraits, { wrapper });
    let id = '';
    act(() => {
      id = result.current.add(PAINTED_IMAGE, traits);
    });
    expect(result.current.get(id)?.image).toBe(PAINTED_IMAGE);
    expect(
      JSON.parse(localStorage.getItem('portraits')!).portraits[id],
    ).toBeDefined();
    act(() => result.current.remove(id));
    expect(result.current.get(id)).toBeUndefined();
  });

  it('forgets portraits nothing points to any more, on the next visit (SC-003)', () => {
    const view = renderHook(usePortraits, { wrapper });
    let kept = '';
    let dropped = '';
    act(() => {
      kept = view.result.current.add(PAINTED_IMAGE, traits);
      dropped = view.result.current.add(PAINTED_IMAGE, traits);
    });
    localStorage.setItem('characters', JSON.stringify([{ portraitId: kept }]));
    view.unmount();
    const { result } = renderHook(usePortraits, { wrapper });
    expect(result.current.get(kept)).toBeDefined();
    expect(result.current.get(dropped)).toBeUndefined();
  });

  it('keeps a portrait for the session when storage is full', () => {
    const { result } = renderHook(usePortraits, { wrapper });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    let id = '';
    act(() => {
      id = result.current.add(PAINTED_IMAGE, traits);
    });
    expect(result.current.get(id)).toBeDefined();
    expect(result.current.persisted).toBe(false);
  });

  it('requires its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(usePortraits)).toThrow(/PortraitProvider/);
  });
});
