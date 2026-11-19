import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { json, queuedFetch } from '../ai/providers/testing';
import { DEFAULT_SETTINGS } from '../ai/storage';
import type { ProviderSettings } from '../ai/types';
import {
  AlertManagerContext,
  AlertManagerProvider,
} from '../contexts/AlertManagerContext';
import { PartyProvider } from '../contexts/PartyContext';
import useParty from './useParty';
import usePartyGenerator from './usePartyGenerator';
import useSettings from './useSettings';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AlertManagerProvider>
    <PartyProvider>{children}</PartyProvider>
  </AlertManagerProvider>
);

const useEverything = () => ({
  generator: usePartyGenerator(),
  party: useParty().party,
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

describe('usePartyGenerator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('generates a party without AI right away', async () => {
    withSettings({ activeType: 'none' });
    const { result } = renderHook(useEverything, { wrapper });
    await act(() => result.current.generator.generateParty());
    expect(result.current.party?.members).toHaveLength(4);
    expect(result.current.party?.text).toBeUndefined();
    expect(result.current.alerts.map((a) => a.message)).toEqual([
      'New party generated',
    ]);
  });

  it('uses the AI story when the provider answers', async () => {
    withSettings({ activeType: 'ollama' });
    vi.stubGlobal(
      'fetch',
      queuedFetch(
        chatAnswer({ name: 'The Ash Lanterns', story: ['One.', 'Two.'] }),
      ),
    );
    const { result } = renderHook(useEverything, { wrapper });
    await act(() => result.current.generator.generateParty());
    expect(result.current.party?.text?.name).toBe('The Ash Lanterns');
    expect(result.current.alerts[0].message).toBe(
      'New party generated with Ollama.',
    );
  });

  it('keeps the app story and explains when the provider is down', async () => {
    withSettings({ activeType: 'ollama' });
    vi.stubGlobal('fetch', queuedFetch(new TypeError('Failed to fetch')));
    const { result } = renderHook(useEverything, { wrapper });
    await act(() => result.current.generator.generateParty());
    expect(result.current.party?.members).toHaveLength(4);
    expect(result.current.party?.text).toBeUndefined();
    const [alert] = result.current.alerts;
    expect(alert.severity).toBe('warning');
    expect(alert.message).toMatch(
      /The company's story comes from the generator\.$/,
    );
  });
});
