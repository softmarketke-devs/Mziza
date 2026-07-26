'use client';

import { useState } from 'react';
import ResultsPanel from '@/components/ResultsPanel';
import { useLanguage } from '@/components/LanguageProvider';
import type { ProcessorResult } from '@/lib/types';

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.85;

interface DownscaleErrors {
  readError: string;
  imageError: string;
}

function downscaleToDataUrl(file: File, errors: DownscaleErrors): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error(errors.readError));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error(errors.imageError));
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
  const { language, t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Reading the card...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessorResult | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    try {
      const dataUrl = await downscaleToDataUrl(file, {
        readError: t.scanner.readError,
        imageError: t.scanner.imageError
      });
      setPreview(dataUrl);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.scanner.prepareError);
    }
  }

  async function handleSubmit() {
    if (!preview) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStatusText('Running optical text recognition...');

    let clientExtractedText = '';
    try {
      const tesseract = await import('tesseract.js');
      const ocrRes = await tesseract.recognize(preview, 'eng');
      clientExtractedText = ocrRes?.data?.text ?? '';
    } catch (ocrErr) {
      console.warn('Client-side OCR notice, delegating to server processor:', ocrErr);
    }

    try {
      setStatusText('Extracting CBC bands and guidance...');
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'image',
          imageDataUrl: preview,
          rawText: clientExtractedText,
          language
        })
      });

      const data: ProcessorResult = await response.json();
      setResult(data);
    } catch {
      setError(t.scanner.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span className="eyebrow">{t.scanner.eyebrow}</span>
      <h1>{t.scanner.title}</h1>
      <p className="lede">{t.scanner.lede}</p>

      <div className="stitch-card form-card">
        <label className="field">
          <span className="field__label">
            {t.scanner.fileLabel}
            <span className="field__hint">{t.scanner.fileHint}</span>
          </span>
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>

        {preview && (
          <figure className="preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={fileName ? `${t.scanner.previewAlt}: ${fileName}` : t.scanner.previewAlt}
            />
            <figcaption className="muted">{fileName}</figcaption>
          </figure>
        )}

        <div className="controls">
          <button
            type="button"
            className="button"
            onClick={handleSubmit}
            disabled={!preview || loading}
          >
            {loading ? statusText : t.scanner.submit}
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
              {t.scanner.clear}
            </button>
          )}
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
      </div>

      <ResultsPanel result={result} loading={loading} />
    </>
  );
}

