import { useContext } from 'react';
import { LocaleContext } from './LocaleContext';

export { LocaleProvider } from './LocaleContext';
export { detectLocale, isLocale, LOCALES, type Locale } from './locale';
export { translate, type MessageKey, type MessageParams } from './messages';

const useLocaleContext = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

/** Current interface language and the function to change it. */
export const useLocale = () => {
  const { locale, setLocale } = useLocaleContext();
  return { locale, setLocale };
};

/** Translation function for the current language. */
export const useT = () => useLocaleContext().t;
