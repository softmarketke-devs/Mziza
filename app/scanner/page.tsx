'use client';

import { useState } from 'react';
import ResultsPanel from '@/components/ResultsPanel';
import type { ProcessorResult } from '@/lib/types';

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.8;

function downscaleToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export default function ScannerPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [language, setLanguage] = useState<'sw' | 'en'>('sw');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessorResult | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    try {
      const dataUrl = await downscaleToDataUrl(file);
      setPreview(dataUrl);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare that image file.');
    }
  }

  async function handleSubmit() {
    if (!preview) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'image', imageDataUrl: preview, language })
      });

      const data: ProcessorResult = await response.json();
      setResult(data);
    } catch {
      setError(
        'The request did not reach the server. Check network connection and try again, or type the rows manually.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span className="eyebrow">01 — Optical Scanner</span>
      <h1>Photograph the report card</h1>
      <p className="lede">
        Position the report card clearly within the photo frame. Text recognition extracts subject performance bands and translates them into actionable guidance.
      </p>

      <div className="stitch-card" style={{ marginTop: '2.5rem', maxWidth: '42rem' }}>
        <label className="field">
          <span className="field__label">
            Report Card Image
            <span className="field__hint">
              JPEG or PNG. Automatically downscaled locally to minimize data bundle consumption.
            </span>
          </span>
          <input type="file" accept="image/*" onChange={handleFile} />
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

        {preview && (
          <figure style={{ margin: '1.5rem 0 1rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`Preview of uploaded report card${fileName ? `: ${fileName}` : ''}`}
              style={{
                maxWidth: '100%',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <figcaption className="muted" style={{ marginTop: '0.5rem' }}>
              {fileName}
            </figcaption>
          </figure>
        )}

        <div className="controls">
          <button
            type="button"
            className="button"
            onClick={handleSubmit}
            disabled={!preview || loading}
          >
            {loading ? 'Processing Document...' : 'Read Report Card'}
          </button>
          {preview && (
            <button
              type="button"
              className="button button--quiet"
              onClick={() => {
                setPreview(null);
                setFileName(null);
                setResult(null);
                setError(null);
              }}
              disabled={loading}
            >
              Clear Selection
            </button>
          )}
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </div>

      <ResultsPanel result={result} language={language} loading={loading} />
    </>
  );
}
