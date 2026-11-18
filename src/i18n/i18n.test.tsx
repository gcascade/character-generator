import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { detectLocale, LocaleProvider, translate, useLocale, useT } from '.';

describe('detectLocale', () => {
  it.each([
    [null, ['fr-FR', 'en'], 'fr'],
    [null, ['fr-CA'], 'fr'],
    [null, ['en-GB', 'fr'], 'en'],
    [null, ['de-DE'], 'en'],
    [null, [], 'en'],
    ['en', ['fr-FR'], 'en'],
    ['fr', ['en-US'], 'fr'],
    ['klingon', ['fr-FR'], 'fr'],
  ] as const)('stored %s, browser %j → %s', (stored, browser, expected) => {
    expect(detectLocale(stored, browser)).toBe(expected);
  });
});

describe('translate', () => {
  it('returns the text of the locale', () => {
    expect(translate('fr', 'language.label')).toBe('Langue');
    expect(translate('en', 'language.label')).toBe('Language');
  });
});

describe('LocaleProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleProvider>{children}</LocaleProvider>
  );
  const renderLocale = () =>
    renderHook(() => ({ ...useLocale(), t: useT() }), { wrapper });

  beforeEach(() => localStorage.clear());

  it('switches language immediately, remembers it and sets <html lang>', () => {
    const { result } = renderLocale();
    act(() => result.current.setLocale('fr'));
    expect(result.current.t('language.label')).toBe('Langue');
    expect(localStorage.getItem('locale')).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('starts with the remembered language', () => {
    localStorage.setItem('locale', 'fr');
    expect(renderLocale().result.current.locale).toBe('fr');
  });

  it('reads English outside the provider', () => {
    const { result } = renderHook(() => useT());
    expect(result.current('language.label')).toBe('Language');
  });
});
