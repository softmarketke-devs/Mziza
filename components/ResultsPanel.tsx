'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProcessorResult } from '@/lib/types';

interface ResultsPanelProps {
  result: ProcessorResult;
  language: 'sw' | 'en';
}

/**
 * Reads the guidance aloud. Kiswahili voices are not installed on every
 * device, so the button reports what it can actually do rather than failing
 * silently: a parent who cannot read the card is the person this serves.
 */
function useSpeech(language: 'sw' | 'en') {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    setSupported(true);

    const checkVoices = () => {
      const wanted = language === 'en' ? 'en' : 'sw';
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      const hasVoice = voices.some((v) => v.lang.toLowerCase().startsWith(wanted));
      setVoiceNote(
        hasVoice
          ? null
          : language === 'en'
            ? 'No English voice is installed on this device. Playback may fall back to the system default.'
            : 'Hakuna sauti ya Kiswahili kwenye kifaa hiki. Sauti chaguo-msingi itatumika.'
      );
    };

    checkVoices();
    window.speechSynthesis.addEventListener('voiceschanged', checkVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', checkVoices);
      window.speechSynthesis.cancel();
    };
  }, [language]);

  const speak = useCallback(
    (text: string, langTag: string) => {
      if (!supported || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langTag;
      utterance.rate = 0.95;

      const match = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.toLowerCase().startsWith(langTag.slice(0, 2).toLowerCase()));
      if (match) utterance.voice = match;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, voiceNote, speak, stop };
}

export default function ResultsPanel({ result, language }: ResultsPanelProps) {
  const { supported, speaking, voiceNote, speak, stop } = useSpeech(language);

  if (!result.success) {
    return (
      <p className="notice notice--error" role="alert">
        {result.error ?? 'Processing failed.'}
      </p>
    );
  }

  const usedFallbackBands =
    result.detectedBands.length > 0 &&
    result.detectedBands.every((b) => b.confidence < 0.5);

  const speechText = result.speechData?.textToSpeak ?? '';
  const speechLang = result.speechData?.language ?? 'sw-KE';

  return (
    <section aria-live="polite">
      {usedFallbackBands && (
        <p className="notice">
          No subject rows were recognised, so the example below uses sample bands.
          Type the rows out on the{' '}
          <a href="/translate">type-it-out page</a> for guidance on the real card.
        </p>
      )}

      {result.source === 'offline_cache' && !usedFallbackBands && (
        <p className="notice">
          Served from the offline bank. The guidance is complete and safe to use;
          it is pre-written rather than generated for this specific card.
        </p>
      )}

      <div className="meta-row">
        <span>Mode: {result.mode}</span>
        <span>Subjects: {result.translations.length}</span>
        <span>
          Source: {result.source === 'online_claude' ? 'Live model' : 'Offline bank'}
        </span>
        <span>{result.executionTimeMs} ms</span>
      </div>

      {supported && speechText.length > 0 && (
        <div className="controls" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => speak(speechText, speechLang)}
            disabled={speaking}
          >
            {language === 'en' ? 'Read the first subject aloud' : 'Sikiliza somo la kwanza'}
          </button>
          {speaking && (
            <button type="button" className="button button--quiet" onClick={stop}>
              {language === 'en' ? 'Stop' : 'Simamisha'}
            </button>
          )}
          {voiceNote && <span className="muted">{voiceNote}</span>}
        </div>
      )}

      <div className="results">
        {result.translations.map((t, index) => {
          const detected = result.detectedBands[index];
          return (
            <article className="result" key={`${t.subject}-${t.band}-${index}`}>
              <header className="result__head">
                <h3>{t.subject}</h3>
                <span className={`badge badge--${t.band}`}>{t.band}</span>
              </header>

              <div className="result__section">
                <p className="result__label">
                  {language === 'en' ? 'What the band means' : 'Daraja hili lina maana gani'}
                </p>
                <p>{language === 'en' ? t.band_name_en : t.band_name_sw}</p>
                <p style={{ marginTop: '0.5rem' }}>
                  {language === 'en' ? t.explanation_en : t.explanation_sw}
                </p>
                <p className="result__secondary">
                  {language === 'en' ? t.explanation_sw : t.explanation_en}
                </p>
              </div>

              <div className="result__section">
                <p className="result__label">
                  {language === 'en' ? 'Home activity' : 'Shughuli ya nyumbani'}
                </p>
                <p>{language === 'en' ? t.activity_en : t.activity_sw}</p>
                <p className="result__secondary">
                  {language === 'en' ? t.activity_sw : t.activity_en}
                </p>
              </div>

              {t.diy_materials.length > 0 && (
                <div className="result__section">
                  <p className="result__label">
                    {language === 'en' ? 'What you need' : 'Vifaa vinavyohitajika'}
                  </p>
                  <ul className="materials">
                    {t.diy_materials.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {detected?.raw_match && (
                <div className="result__section">
                  <p className="result__label">Matched on the card</p>
                  <p className="muted">{detected.raw_match}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {result.kicdPrompt && (
        <>
          <div className="meta-row">
            <span>KICD prompt</span>
            <span>{result.kicdPrompt.grade.replace('_', ' ')}</span>
            <span>Term {result.kicdPrompt.term}</span>
            <span>Week {result.kicdPrompt.week}</span>
          </div>

          <article className="result">
            <header className="result__head">
              <h3>
                {result.kicdPrompt.strand} — {result.kicdPrompt.sub_strand}
              </h3>
              <span className="badge badge--ME">{result.kicdPrompt.subject}</span>
            </header>

            <div className="result__section">
              <p className="result__label">Learning outcome</p>
              <p>{result.kicdPrompt.slo}</p>
            </div>

            <div className="result__section">
              <p className="result__label">
                {language === 'en' ? 'This week at home' : 'Wiki hii nyumbani'}
              </p>
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
                <p className="result__label">
                  {language === 'en' ? 'What you need' : 'Vifaa vinavyohitajika'}
                </p>
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
