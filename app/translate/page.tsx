'use client';

import { useState } from 'react';
import ResultsPanel from '@/components/ResultsPanel';
import { useLanguage } from '@/components/LanguageProvider';
import { KICD_GRADES } from '@/lib/kicd';
import type { ProcessorResult } from '@/lib/types';

const SAMPLE = `Mathematics: AE
Kiswahili: ME
Science & Technology: BE
English: ME`;

export default function TranslatePage() {
  const { language, t } = useLanguage();
  const [rawText, setRawText] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessorResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (rawText.trim().length === 0) {
      setError(t.translate.emptyError);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'text',
          rawText,
          language,
          kicdQuery: grade ? { grade } : undefined
        })
      });

      const data: ProcessorResult = await response.json();
      setResult(data);
    } catch {
      setError(t.translate.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span className="eyebrow">{t.translate.eyebrow}</span>
      <h1>{t.translate.title}</h1>
      <p className="lede">
        {t.translate.ledePrefix}
        <code>Mathematics: AE</code>
        {t.translate.ledeMiddle}
        <code>Hesabu - Approaching</code>
        {t.translate.ledeSuffix}
      </p>

      <form onSubmit={handleSubmit} className="stitch-card form-card">
        <label className="field">
          <span className="field__label">
            {t.translate.contentLabel}
            <span className="field__hint">{t.translate.contentHint}</span>
          </span>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={SAMPLE}
            spellCheck={false}
          />
        </label>

        <label className="field">
          <span className="field__label">
            {t.translate.gradeLabel}
            <span className="field__hint">{t.translate.gradeHint}</span>
          </span>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">{t.translate.gradePlaceholder}</option>
            {KICD_GRADES.map((g) => (
              <option key={g} value={g}>
                {t.grades[g]}
              </option>
            ))}
          </select>
        </label>

        <div className="controls">
          <button type="submit" className="button" disabled={loading}>
            {loading ? t.translate.submitting : t.translate.submit}
          </button>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => setRawText(SAMPLE)}
            disabled={loading}
          >
            {t.translate.sample}
          </button>
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </form>

      <ResultsPanel result={result} loading={loading} />
    </>
  );
}
