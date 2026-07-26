'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/*
  Interactive hero engine — igloo.inc-inspired.
  Layers (back to front):
    1. Kling-generated cinematic video scene (pointer-parallax + scroll scale)
    2. Particle canvas: drifting light dust + CBC band glyphs, repelled by the pointer
    3. Cursor spotlight + edge vignette
    4. Staggered headline, magnetic CTAs, scroll cue
  No WebGL dependency: a DPR-aware 2D canvas keeps the bundle at zero extra kB.
*/

const BAND_GLYPHS = ['EE', 'ME', 'AE', 'BE'];

type Particle = {
  x: number;
  y: number;
  z: number; // 0..1 depth, drives size/speed/alpha
  vx: number;
  vy: number;
  glyph: string | null;
  pulse: number;
};

export default function InteractiveHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const media = mediaRef.current;
    const content = contentRef.current;
    const spotlight = spotlightRef.current;
    const cue = cueRef.current;
    if (!section || !canvas || !media || !content || !spotlight || !cue) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // next/font generates a unique family name; resolve it from the CSS variable.
    const monoFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() ||
      'monospace';

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    // Pointer state, lerped each frame for the parallax layers.
    const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, inside: false };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      const target = Math.min(110, Math.round((width * height) / 14000));
      particles = Array.from({ length: target }, (_, i) => {
        const z = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(0.05 + Math.random() * 0.22) * (0.4 + z),
          glyph: i % 14 === 0 ? BAND_GLYPHS[i % BAND_GLYPHS.length] : null,
          pulse: Math.random() * Math.PI * 2
        };
      });
    };

    const step = (t: number) => {
      if (!running) return;
      pointer.px += (pointer.x - pointer.px) * 0.06;
      pointer.py += (pointer.y - pointer.py) * 0.06;

      // Parallax: media drifts against the pointer, content with it (subtler).
      if (!reduceMotion) {
        const dx = pointer.px - 0.5;
        const dy = pointer.py - 0.5;
        media.style.transform = `translate3d(${dx * -28}px, ${dy * -18}px, 0) scale(1.08)`;
        content.style.transform = `translate3d(${dx * 14}px, ${dy * 9}px, 0)`;
      }
      spotlight.style.background = `radial-gradient(600px circle at ${pointer.px * 100}% ${pointer.py * 100}%, rgba(37, 99, 235, 0.16), transparent 65%)`;

      ctx.clearRect(0, 0, width, height);
      const mx = pointer.px * width;
      const my = pointer.py * height;

      for (const p of particles) {
        if (!reduceMotion) {
          // Gentle repulsion within 140px of the pointer.
          if (pointer.inside) {
            const ddx = p.x - mx;
            const ddy = p.y - my;
            const dist2 = ddx * ddx + ddy * ddy;
            if (dist2 < 140 * 140 && dist2 > 0.01) {
              const dist = Math.sqrt(dist2);
              const force = ((140 - dist) / 140) * 0.9 * (0.3 + p.z);
              p.vx += (ddx / dist) * force * 0.06;
              p.vy += (ddy / dist) * force * 0.06;
            }
          }
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 - 0.0012 * (0.4 + p.z);
          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.y < -30) { p.y = height + 20; p.x = Math.random() * width; }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        p.pulse += 0.02;
        const twinkle = 0.55 + Math.sin(p.pulse) * 0.35;
        const alpha = (0.12 + p.z * 0.5) * twinkle;

        if (p.glyph) {
          ctx.font = `600 ${10 + p.z * 8}px ${monoFamily}`;
          ctx.fillStyle = `rgba(147, 197, 253, ${alpha * 0.9})`;
          ctx.fillText(p.glyph, p.x, p.y);
        } else {
          const r = 0.6 + p.z * 1.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(191, 219, 254, ${alpha})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(step);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
      pointer.inside = true;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.x = 0.5;
      pointer.y = 0.5;
    };

    // Click shockwave: blast particles outward from the press point.
    const onPointerDown = (e: PointerEvent) => {
      if (reduceMotion) return;
      const rect = section.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const p of particles) {
        const ddx = p.x - cx;
        const ddy = p.y - cy;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        const force = Math.max(0, 1 - dist / 420) * 9 * (0.35 + p.z);
        p.vx += (ddx / dist) * force;
        p.vy += (ddy / dist) * force;
      }
    };

    // Scroll: hero recedes as the bento grid arrives; cue fades immediately.
    const onScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / (height * 0.9)));
      section.style.setProperty('--hero-progress', progress.toFixed(3));
      cue.style.opacity = String(Math.max(0, 1 - progress * 4));
    };

    // Pause the loop when the hero is offscreen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(step);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.02 }
    );

    resize();
    onScroll();
    observer.observe(section);
    raf = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    section.addEventListener('pointermove', onPointerMove);
    section.addEventListener('pointerleave', onPointerLeave);
    section.addEventListener('pointerdown', onPointerDown);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
      section.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  // Magnetic pull for CTA buttons.
  const magnetize = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
  };
  const demagnetize = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)';
  };

  const title = 'Performance bands, translated into real home guidance.';

  return (
    <section ref={sectionRef} className="ihero" aria-label="Mziza interactive introduction">
      <div ref={mediaRef} className="ihero__media">
        <video
          className="ihero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero/hero-poster.webp"
        >
          <source src="/hero/hero-scene.mp4" type="video/mp4" />
        </video>
      </div>

      <canvas ref={canvasRef} className="ihero__particles" aria-hidden="true" />
      <div ref={spotlightRef} className="ihero__spotlight" aria-hidden="true" />
      <div className="ihero__vignette" aria-hidden="true" />

      <div ref={contentRef} className="ihero__content">
        <span className="ihero__eyebrow">CBC Curriculum &middot; Grades 4&ndash;9</span>
        <h1 className="ihero__title">
          {title.split(' ').map((word, i) => (
            <span key={i} className="ihero__word" style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
              {word}&nbsp;
            </span>
          ))}
        </h1>
        <p className="ihero__lede">
          A report card says <strong>AE</strong> or <strong>BE</strong>. Mziza explains what the
          band means &mdash; in Kiswahili and English &mdash; with practical home activities built from
          everyday household items. Offline-first, and on any phone via USSD.
        </p>
        <div className="ihero__ctas">
          <Link
            href="/scanner"
            className="ihero__cta ihero__cta--primary"
            onPointerMove={magnetize}
            onPointerLeave={demagnetize}
          >
            Scan a Report Card
          </Link>
          <Link
            href="/ussd"
            className="ihero__cta ihero__cta--ghost"
            onPointerMove={magnetize}
            onPointerLeave={demagnetize}
          >
            Try USSD *384*77#
          </Link>
        </div>
      </div>

      <div ref={cueRef} className="ihero__scrollcue" aria-hidden="true">
        <span className="ihero__scrollcue-line" />
        Scroll
      </div>
    </section>
  );
}
