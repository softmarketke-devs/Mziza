import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { LanguageProvider } from '@/components/LanguageProvider';
import { Masthead, Colophon } from '@/components/SiteChrome';
import { DEFAULT_LANGUAGE, HTML_LANG } from '@/lib/i18n';
import PointerReactivity from '../components/PointerReactivity';
import CursorFX from '../components/CursorFX';
import ScrollReveal from '../components/ScrollReveal';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Mzazi Coach — CBC Report Guidance for Parents',
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
    <html lang={HTML_LANG[DEFAULT_LANGUAGE]} className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PointerReactivity />
        <CursorFX />
        <ScrollReveal />
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

