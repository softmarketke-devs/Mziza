'use client';

import { useState, useEffect, useCallback } from 'react';

interface SlideData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  timeTag: string;
  quote: string;
  bulletPoints: { title: string; desc: string }[];
  highlightBadge: string;
  metrics: { label: string; value: string }[];
}

const SLIDES: SlideData[] = [
  {
    id: 'problem',
    number: '01',
    title: 'The Problem',
    subtitle: 'The School-to-Home Gap in CBC Education',
    timeTag: '30s',
    quote:
      'When a report says a Grade 4 student is "Approaching Expectations" in Science & Tech, what does a parent actually do about it?',
    bulletPoints: [
      {
        title: 'Abstract Assessment Rubrics',
        desc: 'Kenyan CBC reports shifted from numeric marks to letter rubrics (EE, ME, AE, BE). Most parents find these codes abstract and confusing.',
      },
      {
        title: 'Lack of Actionable Home Tools',
        desc: 'Parents want to support their children, but expensive textbooks and private tutors are out of reach for low-resource households.',
      },
      {
        title: 'High Barrier to Engagement',
        desc: 'Without simple guidance, learning stops at the school gate instead of continuing naturally at home.',
      },
    ],
    highlightBadge: 'Systemic Challenge',
    metrics: [
      { label: 'Primary Learners in CBC', value: '10M+' },
      { label: 'Uncertain Parent Ratio', value: '~70%' },
    ],
  },
  {
    id: 'solution',
    number: '02',
    title: 'The Solution',
    subtitle: 'Mziza — Turning Report Cards into Home Learning',
    timeTag: '45s',
    quote:
      'Mziza bridges the gap between the classroom and the living room.',
    bulletPoints: [
      {
        title: 'Instant Scan or Text Input',
        desc: 'Parents snap a photo of the report card or enter grades manually. Multi-strategy OCR extracts subject performance bands instantly.',
      },
      {
        title: 'Bilingual Plain Language & Audio',
        desc: 'Breaks down complex bands into encouraging advice in Kiswahili and English with native Web Speech read-aloud playback.',
      },
      {
        title: 'Household Activity Engine',
        desc: 'Generates KICD-aligned micro-activities using materials already at home—turning cooking, farming, or chores into practical lessons.',
      },
    ],
    highlightBadge: 'Core Innovation',
    metrics: [
      { label: 'Languages Supported', value: '2 (SWA/ENG)' },
      { label: 'Household Items Needed', value: '0 New Cost' },
    ],
  },
  {
    id: 'resilience',
    number: '03',
    title: 'Inclusion & Tech Resilience',
    subtitle: 'Built for Zero Data & Basic Feature Phones',
    timeTag: '30s',
    quote:
      'We didn\'t build this just for parents with flagship smartphones and fast 5G.',
    bulletPoints: [
      {
        title: '100% Offline-First Architecture',
        desc: 'Equipped with a local 6-subject × 4-band fallback bank and browser-based Tesseract Web Workers. Zero server connection needed.',
      },
      {
        title: 'USSD Feature Phone Gateway (*384*77#)',
        desc: 'Parents with basic push-button phones (Kabambe) can dial in via USSD to query progress and get home activities over GSM in seconds.',
      },
      {
        title: 'Resilient Edge Failover',
        desc: 'If AI services time out or fail, the system smoothly falls back to verified KICD pedagogical guidance without breaking UX.',
      },
    ],
    highlightBadge: 'Zero Exclusion',
    metrics: [
      { label: 'Offline Availability', value: '100%' },
      { label: 'USSD Handset Code', value: '*384*77#' },
    ],
  },
  {
    id: 'impact',
    number: '04',
    title: 'Impact & Vision',
    subtitle: 'Empowering Every Kenyan Parent as an Active Partner',
    timeTag: '15s',
    quote:
      'Mziza empowers every Kenyan parent to become an active, confident partner in their child\'s education.',
    bulletPoints: [
      {
        title: 'Democratizing CBC Support',
        desc: 'Reaches parents across urban centers and remote rural villages alike, breaking down financial and technological barriers.',
      },
      {
        title: 'Sustainable School-Home Alliance',
        desc: 'Fosters continuous parental involvement, boosting student outcomes and strengthening community education foundations.',
      },
      {
        title: 'Scalable Regional Model',
        desc: 'Designed for rapid adaptation across East Africa\'s competency-based educational frameworks.',
      },
    ],
    highlightBadge: 'Long-term Vision',
    metrics: [
      { label: 'Target Reach', value: 'National' },
      { label: 'Parent Confidence', value: 'Elevated' },
    ],
  },
];

export default function PitchSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slide = SLIDES[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(goToNext, 7000);
    return () => clearInterval(interval);
  }, [isPlaying, goToNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  return (
    <section className="pitch-slider-section" aria-label="Mziza Judge Presentation Deck">
      <div className="pitch-slider-header">
        <div>
          <span className="eyebrow">Judge Presentation Deck</span>
          <h2 className="pitch-slider-header__title">Mziza Pitch Deck</h2>
        </div>
        
        <div className="pitch-slider-controls">
          <button
            type="button"
            className="button button--quiet pitch-slider-controls__btn"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            &larr; Prev
          </button>
          
          <button
            type="button"
            className="button button--quiet pitch-slider-controls__btn"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Auto play slideshow'}
          >
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>

          <button
            type="button"
            className="button pitch-slider-controls__btn"
            onClick={goToNext}
            aria-label="Next slide"
          >
            Next &rarr;
          </button>
        </div>
      </div>

      {/* Progress Tabs */}
      <div className="pitch-tabs" role="tablist">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={idx === currentIndex}
            className={`pitch-tab ${idx === currentIndex ? 'pitch-tab--active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          >
            <span className="pitch-tab__number">{s.number}</span>
            <span className="pitch-tab__title">{s.title}</span>
            <span className="pitch-tab__tag">{s.timeTag}</span>
          </button>
        ))}
      </div>

      {/* Slide Card Container */}
      <div className="pitch-card-wrapper">
        <div className="stitch-card pitch-card" key={slide.id}>
          <div className="pitch-card__meta">
            <div className="pitch-card__meta-left">
              <span className="eyebrow">{slide.highlightBadge}</span>
              <span className="pitch-card__time-badge">{slide.timeTag} Pitch</span>
            </div>
            <div className="pitch-card__step-indicator">
              Slide {slide.number} of 0{SLIDES.length}
            </div>
          </div>

          <div className="pitch-card__grid">
            <div className="pitch-card__content">
              <h3 className="pitch-card__headline">{slide.subtitle}</h3>
              
              <blockquote className="pitch-card__quote">
                &ldquo;{slide.quote}&rdquo;
              </blockquote>

              <div className="pitch-card__bullets">
                {slide.bulletPoints.map((bp, i) => (
                  <div key={i} className="pitch-bullet">
                    <div className="pitch-bullet__marker">{i + 1}</div>
                    <div>
                      <h4 className="pitch-bullet__title">{bp.title}</h4>
                      <p className="pitch-bullet__desc">{bp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pitch-card__sidebar">
              <div className="pitch-sidebar__panel">
                <span className="result__label">Key Metrics</span>
                <div className="pitch-metrics">
                  {slide.metrics.map((m, idx) => (
                    <div key={idx} className="pitch-metric-box">
                      <span className="pitch-metric-box__value">{m.value}</span>
                      <span className="pitch-metric-box__label">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pitch-sidebar__footer">
                <p className="muted">
                  Use keyboard <kbd>&larr;</kbd> <kbd>&rarr;</kbd> keys to navigate pitch slides.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
