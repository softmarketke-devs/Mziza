'use client';

import { useCallback, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { isFallbackExtraction } from '@/lib/ocr';
import type { Language } from '@/lib/i18n';
import type { ProcessorResult } from '@/lib/types';

interface ResultsPanelProps {
  result?: ProcessorResult | null;
  loading?: boolean;
}

export function ResultsSkeleton() {
  return (
    <div className="results-block">
      <div className="skeleton-line skeleton-line--short skeleton-shimmer skeleton-line--lead" />
      <div className="results">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-line--heading skeleton-shimmer" />
            <div className="skeleton-line skeleton-shimmer" />
            <div className="skeleton-line skeleton-shimmer" />
            <div className="skeleton-line skeleton-line--short skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

function useSpeech(language: Language) {
  const [supported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, [currentAudio]);

  const speak = useCallback(
    async (text: string, langTag: string) => {
      if (!text) return;

      stop();
      setVoiceNote(null);
      setSpeaking(true);

      const targetLang = language === 'en' ? 'en' : 'sw';
      const ttsUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${targetLang}`;

      try {
        const audio = new Audio(ttsUrl);
        setCurrentAudio(audio);

        audio.onended = () => {
          setSpeaking(false);
          setCurrentAudio(null);
        };

        audio.onerror = () => {
          console.warn('Audio stream failed, falling back to Web Speech API');
          setCurrentAudio(null);

          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langTag;
            utterance.rate = 0.95;

            const match = window.speechSynthesis
              .getVoices()
              .find((v) => v.lang.toLowerCase().startsWith(targetLang));
            if (match) utterance.voice = match;

            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);

            window.speechSynthesis.speak(utterance);
          } else {
            setSpeaking(false);
          }
        };

        await audio.play();
      } catch (err) {
        console.warn('HTML5 Audio play error, attempting Web Speech API fallback:', err);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = langTag;
          utterance.rate = 0.95;
          utterance.onstart = () => setSpeaking(true);
          utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeaking(false);
        }
      }
    },
    [language, stop]
  );

  return { supported, speaking, voiceNote, speak, stop };
}

export default function ResultsPanel({ result, loading }: ResultsPanelProps) {
  const { language, t } = useLanguage();
  const { supported, speaking, voiceNote, speak, stop } = useSpeech(language);

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (!result) return null;

  if (!result.success) {
    return (
      <p className="notice notice--error" role="alert">
        {result.error ?? t.results.failure}
      </p>
    );
  }

  const usedFallbackBands = isFallbackExtraction(result.detectedBands);
  const speechText = result.speechData?.textToSpeak ?? '';
  const speechLang = result.speechData?.language ?? 'sw-KE';

  return (
    <section aria-live="polite" className="results-block">
      {usedFallbackBands && <p className="notice">{t.results.fallbackNotice}</p>}

      {result.source === 'offline_cache' && !usedFallbackBands && (
        <p className="notice">{t.results.offlineNotice}</p>
      )}

      <div className="meta-row">
        <span>
          {t.results.metaMode}: {result.mode}
        </span>
        <span>
          {t.results.metaSubjects}: {result.translations.length}
        </span>
        <span>
          {t.results.metaSource}:{' '}
          {result.source === 'online_claude'
            ? t.results.sourceOnline
            : t.results.sourceOffline}
        </span>
        <span>{result.executionTimeMs} ms</span>
      </div>

      {supported && speechText.length > 0 && (
        <div className="controls controls--speech">
          <button
            type="button"
            className="button button--quiet"
            onClick={() => speak(speechText, speechLang)}
            disabled={speaking}
          >
            {speaking ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '0.4rem', animation: 'pulse 1s infinite' }}
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                {t.results.stopSpeaking}
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '0.4rem' }}
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                {t.results.speak}
              </>
            )}
          </button>
          {speaking && (
            <button type="button" className="button button--quiet" onClick={stop}>
              {t.results.stopSpeaking}
            </button>
          )}
          {voiceNote && <span className="muted">{voiceNote}</span>}
        </div>
      )}

      <div className="results">
        {result.translations.map((entry, index) => {
          const detected = result.detectedBands[index];
          return (
            <article className="result" key={`${entry.subject}-${entry.band}-${index}`}>
              <header className="result__head">
                <h3>{entry.subject}</h3>
                <span className={`badge badge--${entry.band}`}>{entry.band}</span>
              </header>

              <div className="result__section">
                <p className="result__label">{t.results.bandMeaning}</p>
                <p className="result__lead">
                  {language === 'en' ? entry.band_name_en : entry.band_name_sw}
                </p>
                <p className="result__body">
                  {language === 'en' ? entry.explanation_en : entry.explanation_sw}
                </p>
                <p className="result__secondary">
                  {language === 'en' ? entry.explanation_sw : entry.explanation_en}
                </p>
              </div>

              <div className="result__section">
                <p className="result__label">{t.results.homeActivity}</p>
                <p>{language === 'en' ? entry.activity_en : entry.activity_sw}</p>
                <p className="result__secondary">
                  {language === 'en' ? entry.activity_sw : entry.activity_en}
                </p>
              </div>

              {entry.diy_materials.length > 0 && (
                <div className="result__section">
                  <p className="result__label">{t.results.materials}</p>
                  <ul className="materials">
                    {entry.diy_materials.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {detected?.raw_match && (
                <div className="result__section">
                  <p className="result__label">{t.results.rawMatch}</p>
                  <p className="muted result__raw">{detected.raw_match}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {result.kicdPrompt && (
        <>
          <div className="meta-row meta-row--spaced">
            <span>{t.results.kicdLabel}</span>
            <span>{t.grades[result.kicdPrompt.grade]}</span>
            <span>
              {t.results.kicdTerm} {result.kicdPrompt.term}
            </span>
            <span>
              {t.results.kicdWeek} {result.kicdPrompt.week}
            </span>
          </div>

          <article className="result">
            <header className="result__head">
              <h3>
                {result.kicdPrompt.strand} — {result.kicdPrompt.sub_strand}
              </h3>
              <span className="badge badge--ME">{result.kicdPrompt.subject}</span>
            </header>

            <div className="result__section">
              <p className="result__label">{t.results.kicdOutcome}</p>
              <p>{result.kicdPrompt.slo}</p>
            </div>

            <div className="result__section">
              <p className="result__label">{t.results.kicdActivity}</p>
              <p>
                {language === 'en'
                  ? result.kicdPrompt.activity_en
                  : result.kicdPrompt.activity_sw}
              </p>
              <p className="result__secondary">
                {language === 'en'
                  ? result.kicdPrompt.activity_sw
                  : result.kicdPrompt.activity_en}
              </p>
            </div>

            {result.kicdPrompt.diy_materials.length > 0 && (
              <div className="result__section">
                <p className="result__label">{t.results.materials}</p>
                <ul className="materials">
                  {result.kicdPrompt.diy_materials.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}
