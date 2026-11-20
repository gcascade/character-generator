import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { json, queuedFetch } from '../ai/providers/testing';
import { DEFAULT_SETTINGS } from '../ai/storage';
import type { ProviderSettings } from '../ai/types';
import {
  AlertManagerContext,
  AlertManagerProvider,
} from '../contexts/AlertManagerContext';
import { NpcProvider } from '../contexts/NpcContext';
import useNpcGenerator from './useNpcGenerator';
import useNpcs from './useNpcs';
import useSettings from './useSettings';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AlertManagerProvider>
    <NpcProvider>{children}</NpcProvider>
  </AlertManagerProvider>
);

const useEverything = () => ({
  generator: useNpcGenerator(),
  npc: useNpcs().npc,
  alerts: useContext(AlertManagerContext)!.alerts,
});

const withSettings = (settings: Partial<ProviderSettings>) =>
  vi.mocked(useSettings).mockReturnValue({
    settings: { ...DEFAULT_SETTINGS, ...settings },
    keys: {},
    updateSettings: vi.fn(),
    setKey: vi.fn(),
    setRememberKey: vi.fn(),
    forgetKey: vi.fn(),
  });

const chatAnswer = (content: unknown) =>
  json({ choices: [{ message: { content: JSON.stringify(content) } }] });

const sheet = {
  firstName: 'Merra',
  lastName: 'Cobbleby',
  look: 'l',
  daily: 'd',
  quirk: 'q',
  rumour: 'r',
  secret: 's',
  opinion: 'o',
};

describe('useNpcGenerator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('generates a side character without AI, silently', async () => {
    withSettings({ activeType: 'none' });
    const { result } = renderHook(useEverything, { wrapper });
    const before = result.current.npc;
    await act(() => result.current.generator.generateNpc());
    expect(result.current.npc).not.toBe(before);
    expect(result.current.npc.text).toBeUndefined();
    expect(result.current.alerts).toEqual([]);
  });

  it('uses the AI sheet when the provider answers', async () => {
    withSettings({ activeType: 'ollama' });
    vi.stubGlobal('fetch', queuedFetch(chatAnswer(sheet)));
    const { result } = renderHook(useEverything, { wrapper });
    await act(() => result.current.generator.generateNpc());
    expect(result.current.npc.firstName).toBe('Merra');
    expect(result.current.npc.text?.rumour).toBe('r');
    expect(result.current.alerts[0].message).toBe(
      'New side character generated with Ollama.',
    );
  });

  it('keeps the app sheet and explains when the provider is down', async () => {
    withSettings({ activeType: 'ollama' });
    vi.stubGlobal('fetch', queuedFetch(new TypeError('Failed to fetch')));
    const { result } = renderHook(useEverything, { wrapper });
    await act(() => result.current.generator.generateNpc());
    expect(result.current.npc.text).toBeUndefined();
    const [alert] = result.current.alerts;
    expect(alert.severity).toBe('warning');
    expect(alert.message).toMatch(/The sheet comes from the generator\.$/);
  });
});
