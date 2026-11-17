import { act, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import { KEYS_KEY, SETTINGS_KEY } from '../ai/storage';
import { SettingsContext, SettingsProvider } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

const renderSettings = () =>
  renderHook(() => useContext(SettingsContext)!, { wrapper });

describe('SettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts with "No AI" for a new user', () => {
    const { result } = renderSettings();
    expect(result.current.settings.activeType).toBe('none');
    expect(result.current.settings.ollama.baseUrl).toBe(
      'http://localhost:11434',
    );
    expect(result.current.keys).toEqual({});
  });

  it('migrates legacy settings on first load', () => {
    localStorage.setItem('useOllamaAPI', 'true');
    localStorage.setItem('ollamaModelName', 'mistral');
    const { result } = renderSettings();
    expect(result.current.settings.activeType).toBe('ollama');
    expect(result.current.settings.ollama.model).toBe('mistral');
    expect(localStorage.getItem('useOllamaAPI')).toBeNull();
  });

  it('persists settings changes', () => {
    const { result } = renderSettings();
    act(() =>
      result.current.updateSettings((settings) => ({
        ...settings,
        activeType: 'anthropic',
      })),
    );
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!).activeType).toBe(
      'anthropic',
    );
  });

  it('remembers keys on this device by default', () => {
    const { result } = renderSettings();
    act(() => result.current.setKey('anthropic', ' sk-1 '));
    expect(result.current.keys.anthropic).toBe('sk-1');
    expect(localStorage.getItem(KEYS_KEY)).toContain('sk-1');
  });

  it('moves keys to the session when "remember" is unchecked', () => {
    const { result } = renderSettings();
    act(() => result.current.setKey('anthropic', 'sk-1'));
    act(() => result.current.setRememberKey(false));
    expect(localStorage.getItem(KEYS_KEY)).toBeNull();
    expect(sessionStorage.getItem(KEYS_KEY)).toContain('sk-1');
  });

  it('forgets a key everywhere', () => {
    const { result } = renderSettings();
    act(() => result.current.setKey('anthropic', 'sk-1'));
    act(() => result.current.forgetKey('anthropic'));
    expect(result.current.keys.anthropic).toBeUndefined();
    expect(localStorage.getItem(KEYS_KEY)).toBeNull();
    expect(sessionStorage.getItem(KEYS_KEY)).toBeNull();
  });
});
