'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  DEFAULT_LANGUAGE,
  HTML_LANG,
  LANGUAGE_STORAGE_KEY,
  Language,
  UiStrings,
  isLanguage,
  strings
} from '@/lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Interface copy for the active language. */
  t: UiStrings;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Holds the interface language for the whole application.
 *
 * The server always renders the default so the markup is stable, then the
 * stored choice is applied on mount. Reading localStorage during render would
 * make the server and client disagree and break hydration.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguage(stored)) setLanguageState(stored);
    } catch {
      // Private browsing or a blocked storage partition. The default stands.
    }
  }, []);

  // Assistive technology picks its voice from <html lang>, so it has to track
  // the choice rather than stay on the value rendered at build time.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language];
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Not persisting is survivable; the session still switches.
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: strings(language) }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider');
  }
  return context;
}
