'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import type { ProcessorResult } from '@/lib/types';

const SESSION_ID = 'sim-local-session';
const PHONE_NUMBER = '+254700000000';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export default function UssdPage() {
  const { t } = useLanguage();
  const [trail, setTrail] = useState('');
  const [pending, setPending] = useState('');
  const [screen, setScreen] = useState('Dial *384*77# to initiate session.');
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const [status, setStatus] = useState<'idle' | 'open' | 'ended'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gateway replies type onto the handset screen like a real terminal.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(screen);
      setTyping(false);
      return;
    }

    let i = 0;
    setTyped('');
    setTyping(true);
    const interval = setInterval(() => {
      i += 3;
      setTyped(screen.slice(0, i));
      if (i >= screen.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [screen]);

  const send = useCallback(
    async (text: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'ussd',
            ussdPayload: { sessionId: SESSION_ID, phoneNumber: PHONE_NUMBER, text }
          })
        });

        const data: ProcessorResult = await response.json();

        if (!data.success || !data.ussdResponse) {
          setError(data.error ?? t.ussd.parseError);
          return;
        }

        setScreen(data.ussdResponse.message);
        setStatus(data.ussdResponse.responseType === 'CON' ? 'open' : 'ended');
        setTrail(text);
      } catch {
        setError(t.ussd.gatewayError);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    void send('');
    // Dialling happens once on mount; re-sending on every `send` identity change
    // would restart the parent's session each time the language switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitPending() {
    if (pending.length === 0 || status === 'ended') return;
    const next = trail.length > 0 ? `${trail}*${pending}` : pending;
    setPending('');
    void send(next);
  }

  function restart() {
    setTrail('');
    setPending('');
    setStatus('idle');
    void send('');
  }

  const statusLabel = loading
    ? t.ussd.statusLoading
    : status === 'ended'
      ? t.ussd.statusEnded
      : status === 'open'
        ? t.ussd.statusOpen
        : t.ussd.statusReady;

  return (
    <>
      <span className="eyebrow">{t.ussd.eyebrow}</span>
      <h1>{t.ussd.title}</h1>
      <p className="lede">{t.ussd.lede}</p>

      <div className="ussd-grid">
        <div>
          <div className="handset">
            <pre className="handset__screen" aria-live="polite">
              {typed || screen}
              {typing && <span className="handset__caret" aria-hidden="true" />}
            </pre>
            <p className="handset__status">{statusLabel}</p>
          </div>

          <div className="keypad">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPending((p) => p + key)}
                disabled={status === 'ended' || loading}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="controls">
            <button
              type="button"
              className="button"
              onClick={submitPending}
              disabled={pending.length === 0 || status === 'ended' || loading}
            >
              {t.ussd.send}
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setPending('')}
              disabled={pending.length === 0 || loading}
            >
              {t.ussd.clear}
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={restart}
              disabled={loading}
            >
              {t.ussd.restart}
            </button>
          </div>

          <div className="trail">
            <div>
              {t.ussd.buffer}: <strong>{pending || t.ussd.bufferEmpty}</strong>
            </div>
            <div>
              {t.ussd.path}: <strong>{trail || t.ussd.pathRoot}</strong>
            </div>
          </div>

          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
        </div>

        <aside className="stitch-card">
          <h2 className="aside__title">{t.ussd.specTitle}</h2>
          <p className="lede aside__lede">
            {t.ussd.specBodyPrefix}
            <code>1*2*4</code>
            {t.ussd.specBodySuffix}
          </p>

          <div className="meta-row meta-row--tight">
            <span>{t.ussd.menuMapLabel}</span>
          </div>

          <ol className="menu-map">
            <li>
              <strong>1</strong> {t.ussd.menu1}
            </li>
            <li>
              <strong>2</strong> {t.ussd.menu2}
            </li>
            <li>
              <strong>3</strong> {t.ussd.menu3}
            </li>
          </ol>

          <p className="muted aside__note">{t.ussd.charNote}</p>
        </aside>
      </div>
    </>
  );
}

