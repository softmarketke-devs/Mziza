'use client';

import { useEffect } from 'react';

/*
  Site-wide pointer reactivity.
  One delegated listener drives every matching card/button on any page:
  a cursor-following spotlight (--spot-x/--spot-y) and a gentle 3D tilt
  (--tilt-x/--tilt-y), consumed by the .pr-tilt rules in globals.css.
  Skipped entirely on touch devices and for reduced-motion users.
*/

const SELECTOR =
  '.bento-card, .stitch-card, .pitch-card, .hero__card, .keypad button, .button, .ihero__cta';

const TILT_DEG = 5;

export default function PointerReactivity() {
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }

    let active: HTMLElement | null = null;

    const reset = (el: HTMLElement) => {
      el.style.removeProperty('--tilt-x');
      el.style.removeProperty('--tilt-y');
      el.classList.remove('pr-active');
    };

    const onMove = (e: PointerEvent) => {
      const target =
        e.target instanceof Element ? (e.target.closest(SELECTOR) as HTMLElement | null) : null;

      if (active && active !== target) reset(active);
      active = target;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      target.style.setProperty('--spot-x', `${(px * 100).toFixed(1)}%`);
      target.style.setProperty('--spot-y', `${(py * 100).toFixed(1)}%`);

      // Small controls get spotlight only — tilting a keypad key reads as jitter.
      if (rect.width > 220) {
        target.style.setProperty('--tilt-y', `${((px - 0.5) * TILT_DEG).toFixed(2)}deg`);
        target.style.setProperty('--tilt-x', `${((0.5 - py) * TILT_DEG).toFixed(2)}deg`);
      }
      target.classList.add('pr-active');
    };

    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (active) reset(active);
    };
  }, []);

  return null;
}
