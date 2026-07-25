import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="hero-split">
        <div>
          <span className="eyebrow">CBC Curriculum Grades 4 to 9</span>
          <h1>Translating performance bands into real home guidance.</h1>
          <p className="lede">
            A report card states AE or BE. Mzazi Coach provides clear Kiswahili and
            English explanations of what the band means, along with practical home activities
            built from everyday household items.
          </p>
        </div>

        <aside className="hero__card">
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--ink)' }}>Built for Offline Reliability</h3>
          <p className="muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
            Guidance is served from a pre-compiled offline bank when data connection is unavailable or delayed. Parents without smartphones access the identical guidance structure via USSD.
          </p>
        </aside>
      </section>

      <section aria-label="Access modes for Mzazi Coach">
        <div className="bento-grid">
          <Link href="/scanner" className="bento-card bento-card--col-7">
            <div>
              <span className="bento-card__number">01 / CAMERA OPTION</span>
              <h2 className="bento-card__title">Scan Report Card Photo</h2>
              <p className="bento-card__desc">
                Capture the physical document. Optical Character Recognition reads subject bands automatically, preserving data by downscaling before upload.
              </p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem' }}>
              Launch Scanner &rarr;
            </div>
          </Link>

          <Link href="/translate" className="bento-card bento-card--col-5">
            <div>
              <span className="bento-card__number">02 / MANUAL OPTION</span>
              <h2 className="bento-card__title">Type Rows Directly</h2>
              <p className="bento-card__desc">
                Ideal for creased documents or low lighting conditions. Type subjects and band codes line by line for immediate resolution.
              </p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem' }}>
              Enter Rows &rarr;
            </div>
          </Link>

          <Link href="/ussd" className="bento-card bento-card--col-12">
            <div>
              <span className="bento-card__number">03 / USSD FEATURE PHONE GATEWAY</span>
              <h2 className="bento-card__title">USSD Interactive Handset Simulation (*384*77#)</h2>
              <p className="bento-card__desc">
                Feature phone menu flow requiring zero mobile data bundle. Test the stateless menu handler locally on a simulated handset interface.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem' }}>
              Open USSD Simulator &rarr;
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
