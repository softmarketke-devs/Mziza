'use client';

import Link from 'next/link';
import { LANGUAGES, LANGUAGE_LABEL } from '@/lib/i18n';
import { useLanguage } from './LanguageProvider';

/**
 * The system language switch. It lives in the masthead rather than on a form
 * because the choice governs the entire interface, not the text of one result.
 * Each option is labelled in its own language so a parent can find their
 * language without first being able to read the other one.
 */
function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label={t.chrome.switchLabel}>
      {LANGUAGES.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={language === option}
          onClick={() => setLanguage(option)}
        >
          {LANGUAGE_LABEL[option]}
        </button>
      ))}
    </div>
  );
}

export function Masthead() {
  const { t } = useLanguage();

  return (
    <header className="masthead">
      <Link href="/" className="masthead__mark">
        <span className="masthead__logo-dot" />
        Mziza
      </Link>

      <div className="masthead__end">
        <nav className="masthead__nav" aria-label={t.home.modesLabel}>
          <Link href="/scanner">{t.chrome.navScanner}</Link>
          <Link href="/translate">{t.chrome.navTranslate}</Link>
          <Link href="/ussd">{t.chrome.navUssd}</Link>
        </nav>
        <LanguageSwitch />
      </div>
    </header>
  );
}

export function Colophon() {
  const { t } = useLanguage();

  return (
    <footer className="colophon">
      <div className="colophon__inner">
        <span>{t.chrome.footerLeft}</span>
        <span>{t.chrome.footerRight}</span>
      </div>
    </footer>
  );
}
