'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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

  // Live Camera state & refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user' = 'environment') => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t.scanner.cameraError);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      setFacingMode(mode);

      // Attach stream after modal renders video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((playErr) => {
            console.warn('Video play error:', playErr);
          });
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      stopCamera();
      setError(t.scanner.cameraError);
    }
  }, [stopCamera, t.scanner.cameraError]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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

  function capturePhoto() {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    // Scale to MAX_EDGE_PX max
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(width, height));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    stopCamera();
    setPreview(dataUrl);
    setFileName(`report-card-${new Date().toISOString().slice(0, 10)}.jpg`);
    setResult(null);
    setError(null);
  }

  function toggleCameraFacing() {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
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
        {/* Dual Input Triggers: Live Camera & File Upload */}
        <div className="scanner-action-grid">
          <button
            type="button"
            className="button button--camera"
            onClick={() => startCamera('environment')}
            disabled={loading}
          >
            <svg
              className="btn-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t.scanner.openCamera}
          </button>

          <button
            type="button"
            className="button button--quiet"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <svg
              className="btn-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {t.scanner.uploadFile}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleFile}
          />
        </div>

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

      {/* Live Camera Viewfinder Modal */}
      {isCameraActive && (
        <div className="camera-modal" role="dialog" aria-modal="true" aria-label={t.scanner.openCamera}>
          <div className="camera-modal__backdrop" onClick={stopCamera} />
          <div className="camera-modal__content">
            <div className="camera-viewfinder">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="camera-viewfinder__video"
              />
              <div className="camera-frame-guide">
                <div className="camera-frame-guide__corner camera-frame-guide__corner--tl" />
                <div className="camera-frame-guide__corner camera-frame-guide__corner--tr" />
                <div className="camera-frame-guide__corner camera-frame-guide__corner--bl" />
                <div className="camera-frame-guide__corner camera-frame-guide__corner--br" />
                <p className="camera-frame-guide__hint">{t.scanner.cameraHint}</p>
              </div>
            </div>

            <div className="camera-controls">
              <button
                type="button"
                className="camera-controls__btn camera-controls__btn--secondary"
                onClick={toggleCameraFacing}
                aria-label={t.scanner.switchCamera}
                title={t.scanner.switchCamera}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 2.2.9 4.2 2.3 5.7L4 18h5v-5l-1.8 1.8C6.1 13.6 5.5 11.9 5.5 10c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5c0 1.9-.8 3.6-2.1 4.8l1.4 1.4C19.2 14.8 20 12.5 20 10z" />
                </svg>
              </button>

              <button
                type="button"
                className="camera-controls__shutter"
                onClick={capturePhoto}
                aria-label={t.scanner.takeSnap}
                title={t.scanner.takeSnap}
              >
                <span className="camera-controls__shutter-inner" />
              </button>

              <button
                type="button"
                className="camera-controls__btn camera-controls__btn--close"
                onClick={stopCamera}
                aria-label={t.scanner.closeCamera}
                title={t.scanner.closeCamera}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultsPanel result={result} loading={loading} />
    </>
  );
}


