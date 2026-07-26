import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '@/components/LanguageProvider';
import { Masthead, Colophon } from '@/components/SiteChrome';
import { DEFAULT_LANGUAGE, HTML_LANG } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mzazi coach — CBC Report Guidance for Parents',
  description:
    'Translates CBC report card performance bands into plain-language guidance and practical home activities built from everyday household materials. Works offline and over USSD.',
  openGraph: {
    title: 'Mzazi Coach',
    description:
      'CBC report card guidance for Kenyan parents, in Kiswahili and English, with offline fallback and USSD access.',
    type: 'website',
    locale: 'sw_KE'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mzazi Coach',
    description:
      'CBC report card guidance for Kenyan parents in plain Kiswahili and English.'
  }
};

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The provider re-points this at the stored language on mount.
    <html lang={HTML_LANG[DEFAULT_LANGUAGE]}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <div className="shell">
            <Masthead />
            <main className="page">{children}</main>
            <Colophon />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
