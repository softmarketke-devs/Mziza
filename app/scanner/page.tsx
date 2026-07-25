'use client';

import { useState } from 'react';
import ResultsPanel from '@/components/ResultsPanel';
import type { ProcessorResult } from '@/lib/types';

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.8;

/**
 * Downscales the photo before upload. A modern phone camera produces a 4 MB
 * image; text recognition gains nothing above ~1600px and the parent pays for
 * every byte of that upload.
 */
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
      setError(err instanceof Error ? err.message : 'Could not prepare that image.');
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
        'The request did not reach the server. Check the connection and try again, or type the rows out instead.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="eyebrow">01 — Scan</p>
      <h1>Photograph the report card</h1>
      <p className="lede">
        Lay the card flat and fill the frame with the subject rows. Text
        recognition runs on the server, then each subject and band is turned into
        guidance you can use tonight.
      </p>

      <div style={{ marginTop: '2.5rem', maxWidth: '38rem' }}>
        <label className="field">
          <span className="field__label">
            Report card photo
            <span className="field__hint">
              JPEG or PNG. The image is resized before upload to keep the data
              cost down.
            </span>
          </span>
          <input type="file" accept="image/*" onChange={handleFile} />
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

        {preview && (
          <figure style={{ margin: '0 0 1.25rem' }}>
            {/*
              next/image cannot optimise this source: the preview is a data URL
              produced by the canvas downscale a moment earlier, so there is no
              remote asset for the optimiser to fetch or cache.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`Preview of the uploaded report card${fileName ? `: ${fileName}` : ''}`}
              style={{
                maxWidth: '100%',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)'
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
            {loading ? 'Reading the card...' : 'Read this card'}
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
              Clear
            </button>
          )}
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </div>

      {result && <ResultsPanel result={result} language={language} />}
    </>
  );
}
