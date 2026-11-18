import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { detectLocale, type Locale, LOCALE_KEY } from './locale';
import { type MessageKey, type MessageParams, translate } from './messages';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
};

export const LocaleContext = createContext<LocaleContextType | undefined>(
  undefined,
);

const readStored = () => {
  try {
    return localStorage.getItem(LOCALE_KEY);
  } catch {
    return null;
  }
};

/** Holds the interface language: stored choice, else the browser's (FR-002, FR-003). */
export const LocaleProvider: FC<{ children: ReactNode; initial?: Locale }> = ({
  children,
  initial,
}) => {
  const [locale, setLocale] = useState<Locale>(
    () => initial ?? detectLocale(readStored(), navigator.languages ?? []),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const choose = useCallback((next: Locale) => {
    setLocale(next);
    localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: MessageParams) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale: choose, t }),
    [locale, choose, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};
