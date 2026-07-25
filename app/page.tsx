import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">CBC Grades 4-9</p>
          <h1>A report card says AE. It does not say what to do on Tuesday evening.</h1>
          <p className="lede">
            Mzazi Coach reads the bands on a CBC report card and returns two things
            a parent can act on: what the band actually means, and one home activity
            built from items already in the house.
          </p>
        </div>
        <aside className="hero__aside">
          <p>
            Every explanation exists in Kiswahili and English. When there is no
            signal or no bundle, the app serves pre-written guidance instead of
            failing, and parents without a smartphone reach the same material
            over USSD.
          </p>
        </aside>
      </section>

      <nav className="routes" aria-label="Ways to use Mzazi Coach">
        <Link href="/scanner" className="route">
          <span className="route__index">01</span>
          <span className="route__title">Scan the report card</span>
          <span className="route__body">
            Photograph the card. Text recognition runs on the page and pulls out
            each subject and band.
          </span>
        </Link>

        <Link href="/translate" className="route">
          <span className="route__index">02</span>
          <span className="route__title">Type the rows out</span>
          <span className="route__body">
            Faster than a photo when the card is creased or the light is poor.
            One subject and band per line.
          </span>
        </Link>

        <Link href="/ussd" className="route">
          <span className="route__index">03</span>
          <span className="route__title">Test the USSD flow</span>
          <span className="route__body">
            The same guidance on a feature phone, no data required. This page
            simulates the gateway locally.
          </span>
        </Link>
      </nav>
    </>
  );
}
