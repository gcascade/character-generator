import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { json, queuedFetch } from '../ai/providers/testing';
import { DEFAULT_SETTINGS } from '../ai/storage';
import type { ProviderSettings } from '../ai/types';
import {
  AlertManagerContext,
  AlertManagerProvider,
} from '../contexts/AlertManagerContext';
import {
  CharacterContext,
  CharacterProvider,
} from '../contexts/CharacterContext';
import { RequestContext, RequestProvider } from '../contexts/RequestContext';
import useCharacterRequest from './useCharacterRequest';
import useSettings from './useSettings';
import { renderCharacter } from '../content/character';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AlertManagerProvider>
    <RequestProvider>
      <CharacterProvider initCharacter={korvusBlackiron}>
        {children}
      </CharacterProvider>
    </RequestProvider>
  </AlertManagerProvider>
);

const useEverything = () => ({
  request: useCharacterRequest(),
  character: useContext(CharacterContext)!.character,
  alerts: useContext(AlertManagerContext)!.alerts,
  status: useContext(RequestContext)!.requestStatus,
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

const background = { title: 'New Dawn', content: ['A new story.'] };
const chatAnswer = (content: unknown) =>
  json({ choices: [{ message: { content: JSON.stringify(content) } }] });

describe('useCharacterRequest', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('generates without AI immediately, with a plain success alert', async () => {
    withSettings({ activeType: 'none' });
    const fetchMock = queuedFetch();
    vi.stubGlobal('fetch', fetchMock);
    const done = vi.fn();
    const { result } = renderHook(useEverything, { wrapper });

    await act(() =>
      result.current.request.generateNewCharacter({ doneCallback: done }),
    );

    expect(result.current.character).not.toBe(korvusBlackiron);
    expect(result.current.alerts.map((a) => a.message)).toEqual([
      'New character generated',
    ]);
    expect(result.current.status).toBe('success');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalled();
  });

  it('still shows a character and explains why when the provider is down', async () => {
    withSettings({ activeType: 'ollama' });
    vi.stubGlobal('fetch', queuedFetch(new TypeError('Failed to fetch')));
    const { result } = renderHook(useEverything, { wrapper });

    await act(() => result.current.request.generateNewCharacter());

    expect(result.current.character).not.toBe(korvusBlackiron);
    expect(
      renderCharacter(result.current.character, 'en').background.content,
    ).toHaveLength(4);
    const [alert] = result.current.alerts;
    expect(alert.severity).toBe('warning');
    expect(alert.message).toMatch(/^Couldn't reach Ollama/);
    expect(alert.message).toMatch(/A character was generated without AI\.$/);
    expect(result.current.status).toBe('failure');
  });

  it('rerolls the class with the AI rewriting only the background', async () => {
    withSettings({ activeType: 'ollama' });
    vi.stubGlobal(
      'fetch',
      queuedFetch(chatAnswer({ background, firstName: 'Nope' })),
    );
    const { result } = renderHook(useEverything, { wrapper });

    await act(() =>
      result.current.request.rerollCharacterProperty('characterClass'),
    );

    const { character } = result.current;
    expect(character.characterClass).not.toBe(korvusBlackiron.characterClass);
    expect(character.background).toEqual(background);
    expect(character.firstName).toBe(korvusBlackiron.firstName);
    expect(character.race).toBe(korvusBlackiron.race);
    expect(result.current.alerts[0].message).toBe(
      'Character updated with Ollama.',
    );
  });

  it('ignores a result that arrives after the component is gone', async () => {
    withSettings({ activeType: 'ollama' });
    let respond: (response: Response) => void = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((resolve, reject) => {
            respond = resolve;
            init?.signal?.addEventListener('abort', () =>
              reject(init.signal!.reason),
            );
          }),
      ),
    );
    const { result, unmount } = renderHook(useEverything, { wrapper });
    const alerts = () => result.current.alerts;

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.request.generateNewCharacter();
    });
    await waitFor(() => expect(result.current.status).toBe('loading'));
    const before = alerts().length;
    unmount();
    respond(chatAnswer({}));
    await pending;

    expect(alerts().length).toBe(before);
  });
});
