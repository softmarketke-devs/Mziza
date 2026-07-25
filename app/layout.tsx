import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

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
    <html lang="sw-KE">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <header className="masthead">
            <Link href="/" className="masthead__mark">
              <span className="masthead__logo-dot" />
              Mzazi Coach
            </Link>
            <nav className="masthead__nav" aria-label="Primary navigation">
              <Link href="/scanner">Scan Report</Link>
              <Link href="/translate">Type Rows</Link>
              <Link href="/ussd">USSD Gateway</Link>
            </nav>
          </header>

          <main className="page">{children}</main>

          <footer className="colophon">
            <div className="colophon__inner">
              <span>CBC Grades 4 to 9 Guidance Engine</span>
              <span>Offline-First System • USSD *384*77#</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
