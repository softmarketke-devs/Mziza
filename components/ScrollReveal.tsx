'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/*
  Scroll-triggered reveals for every page. Elements below the fold start
  translated down and fade up as they enter the viewport, staggered within
  each batch. Above-the-fold content is never hidden, so there is no flash
  on first paint. Re-runs on route change.
*/

const SELECTOR = [
  '.bento-card',
  '.stitch-card',
  '.pitch-slider-section',
  '.pitch-card',
  '.handset',
  '.keypad',
  '.controls',
  '.trail',
  '.colophon__inner'
].join(', ');

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92
    );
    if (els.length === 0) return;

    els.forEach((el) => el.classList.add('rv-hidden'));

    let batch = 0;
    let batchTime = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        if (now - batchTime > 200) batch = 0; // new scroll burst, restart stagger
        batchTime = now;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(batch, 5) * 80}ms`;
          el.classList.add('rv-in');
          observer.unobserve(el);
          batch += 1;
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -4% 0px' }
    );

    els.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      els.forEach((el) => {
        el.classList.remove('rv-hidden', 'rv-in');
        el.style.removeProperty('transition-delay');
      });
    };
  }, [pathname]);

  return null;
}
