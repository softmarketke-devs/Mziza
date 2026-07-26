'use client';

import { useEffect, useRef } from 'react';

/*
  Custom cursor: a solid dot that tracks the pointer 1:1 and a ring that
  chases it with lerp. The ring swells over anything interactive and
  contracts on press, which is most of what makes a page "feel" reactive.
  Not mounted for touch or reduced-motion users; text fields keep the
  native I-beam via CSS.
*/

const INTERACTIVE =
  'a, button, [role="button"], .bento-card, .stitch-card, .pitch-card, .pitch-tab, label, summary';

export default function CursorFX() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    document.documentElement.classList.add('cursorfx-on');

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let visible = false;
    let raf = 0;

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        rx = x;
        ry = y;
      }
    };

    const onOver = (e: PointerEvent) => {
      const hit = e.target instanceof Element && e.target.closest(INTERACTIVE);
      ring.classList.toggle('cfx-hover', Boolean(hit));
    };

    const onDown = () => ring.classList.add('cfx-down');
    const onUp = () => ring.classList.remove('cfx-down');
    const onLeaveWindow = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('cursorfx-on');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cfx-dot" aria-hidden="true" />
      <div ref={ringRef} className="cfx-ring" aria-hidden="true" />
    </>
  );
}
