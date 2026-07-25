'use client';

import { useState } from 'react';
import ResultsPanel from '@/components/ResultsPanel';
import type { ProcessorResult } from '@/lib/types';

const SAMPLE = `Mathematics: AE
Kiswahili: ME
Science & Technology: BE
English: ME`;

const GRADES = [
  { value: '', label: 'Select grade level (Optional)' },
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
      setError('Enter at least one subject and performance band, such as "Mathematics: AE".');
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
      setError('The request did not reach the server. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span className="eyebrow">02 — Manual Entry</span>
      <h1>Enter report card rows</h1>
      <p className="lede">
        Type subjects and band codes line by line. Both short codes (e.g. <code>Mathematics: AE</code>) and full text (e.g. <code>Hesabu - Approaching</code>) are parsed correctly.
      </p>

      <form onSubmit={handleSubmit} className="stitch-card" style={{ marginTop: '2.5rem', maxWidth: '42rem' }}>
        <label className="field">
          <span className="field__label">
            Report Card Content
            <span className="field__hint">
              Supported subjects: Mathematics, English, Kiswahili, Science &amp; Technology, Social Studies, Creative Arts.
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
            Student Grade Level
            <span className="field__hint">
              Selects matching KICD weekly home activity.
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
          <span className="field__label">Primary Display Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'sw' | 'en')}
          >
            <option value="sw">Kiswahili Kwanza (Kiswahili First)</option>
            <option value="en">English First</option>
          </select>
        </label>

        <div className="controls">
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Analyzing Content...' : 'Explain Performance Bands'}
          </button>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => setRawText(SAMPLE)}
            disabled={loading}
          >
            Insert Sample Rows
          </button>
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </form>

      <ResultsPanel result={result} language={language} loading={loading} />
    </>
  );
}
