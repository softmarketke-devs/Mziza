'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import InteractiveHero from '../components/InteractiveHero';
import PitchSlider from '../components/PitchSlider';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <InteractiveHero />

      <PitchSlider />

      <section aria-label={t.home.modesLabel}>
        <div className="bento-grid">
          <Link href="/scanner" className="bento-card bento-card--col-7">
            <div>
              <span className="bento-card__number">{t.home.scannerNumber}</span>
              <h2 className="bento-card__title">{t.home.scannerTitle}</h2>
              <p className="bento-card__desc">{t.home.scannerDesc}</p>
            </div>
            <span className="bento-card__cta">{t.home.scannerCta} &rarr;</span>
          </Link>

          <Link href="/translate" className="bento-card bento-card--col-5">
            <div>
              <span className="bento-card__number">{t.home.translateNumber}</span>
              <h2 className="bento-card__title">{t.home.translateTitle}</h2>
              <p className="bento-card__desc">{t.home.translateDesc}</p>
            </div>
            <span className="bento-card__cta">{t.home.translateCta} &rarr;</span>
          </Link>

          <Link href="/ussd" className="bento-card bento-card--col-12">
            <div>
              <span className="bento-card__number">{t.home.ussdNumber}</span>
              <h2 className="bento-card__title">{t.home.ussdTitle}</h2>
              <p className="bento-card__desc">{t.home.ussdDesc}</p>
            </div>
            <span className="bento-card__cta">{t.home.ussdCta} &rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}


