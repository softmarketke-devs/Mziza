import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mzazi Coach — CBC report cards in plain Kiswahili',
  description:
    'Turns a CBC report card into plain-language guidance and a home activity built from what is already in the house. Works without a data bundle.',
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
      'CBC report card guidance for Kenyan parents, in Kiswahili and English.'
  }
};

export const viewport: Viewport = {
  themeColor: '#fbfbfa',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw-KE">
      <body>
        <div className="shell">
          <header className="masthead">
            <Link href="/" className="masthead__mark">
              Mzazi Coach
            </Link>
            <nav className="masthead__nav" aria-label="Primary">
              <Link href="/scanner">Scan report</Link>
              <Link href="/translate">Type report</Link>
              <Link href="/ussd">USSD</Link>
            </nav>
          </header>

          <main className="page">{children}</main>

          <footer className="colophon">
            Built for CBC grades 4 to 9. Guidance is drawn from the offline bank
            whenever the network is unavailable, so the app keeps working on a
            dead bundle.
          </footer>
        </div>
      </body>
    </html>
  );
}
