'use client';

import { useState } from 'react';
import ResultsPanel from '@/components/ResultsPanel';
import type { ProcessorResult } from '@/lib/types';

const SAMPLE = `Mathematics: AE
Kiswahili: ME
Science & Technology: BE
English: ME`;

const GRADES = [
  { value: '', label: 'Not sure' },
  { value: 'grade_4', label: 'Grade 4' },
  { value: 'grade_5', label: 'Grade 5' },
  { value: 'grade_6', label: 'Grade 6' },
  { value: 'grade_7', label: 'Grade 7' },
  { value: 'grade_8', label: 'Grade 8' },
  { value: 'grade_9', label: 'Grade 9' }
];

export default function TranslatePage() {
  const [rawText, setRawText] = useState('');
  const [grade, setGrade] = useState('');
  const [language, setLanguage] = useState<'sw' | 'en'>('sw');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessorResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (rawText.trim().length === 0) {
      setError('Type at least one subject and band, for example "Mathematics: AE".');
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
      setError('The request did not reach the server. Check the connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="eyebrow">02 — Type it out</p>
      <h1>Enter the rows from the card</h1>
      <p className="lede">
        One subject per line, with its band. Both the two-letter codes and the
        written forms work, in English or Kiswahili: <code>Hesabu: AE</code> and{' '}
        <code>Mathematics - Approaching</code> both read correctly.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem', maxWidth: '38rem' }}>
        <label className="field">
          <span className="field__label">
            Report card rows
            <span className="field__hint">
              Recognised subjects: Mathematics, English, Kiswahili, Science &amp;
              Technology, Social Studies, Creative Arts.
            </span>
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
            Grade
            <span className="field__hint">
              Used to pick the matching KICD activity for this term.
            </span>
          </span>
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Reading language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'sw' | 'en')}
          >
            <option value="sw">Kiswahili kwanza (Kiswahili first)</option>
            <option value="en">English first</option>
          </select>
        </label>

        <div className="controls">
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Working...' : 'Explain these bands'}
          </button>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => setRawText(SAMPLE)}
            disabled={loading}
          >
            Use the sample rows
          </button>
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </form>

      {result && <ResultsPanel result={result} language={language} />}
    </>
  );
}
