'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProcessorResult } from '@/lib/types';

const SESSION_ID = 'sim-local-session';
const PHONE_NUMBER = '+254700000000';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export default function UssdPage() {
  const [trail, setTrail] = useState('');
  const [pending, setPending] = useState('');
  const [screen, setScreen] = useState('Dial *384*77# to initiate session.');
  const [status, setStatus] = useState<'idle' | 'open' | 'ended'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
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
        setError(data.error ?? 'The USSD gateway returned an unparseable response.');
        return;
      }

      setScreen(data.ussdResponse.message);
      setStatus(data.ussdResponse.responseType === 'CON' ? 'open' : 'ended');
      setTrail(text);
    } catch {
      setError('The simulated USSD gateway could not be reached.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void send('');
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

  return (
    <>
      <span className="eyebrow">03 — Feature Phone USSD</span>
      <h1>Feature phone USSD simulator</h1>
      <p className="lede">
        Parents without smartphones reach Mziza via USSD dial string (*384*77#). This page executes the identical production handler locally against a simulated handset interface.
      </p>

      <div className="ussd-grid">
        <div>
          <div className="handset">
            <pre className="handset__screen">{screen}</pre>
            <p className="handset__status">
              {loading
                ? 'Communicating with Gateway...'
                : status === 'ended'
                  ? 'Session Terminated'
                  : status === 'open'
                    ? 'Awaiting Input Reply'
                    : 'System Ready'}
            </p>
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
              Send Entry
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setPending('')}
              disabled={pending.length === 0 || loading}
            >
              Clear
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={restart}
              disabled={loading}
            >
              Redial Session
            </button>
          </div>

          <div className="trail">
            <div>Current Buffer: <strong>{pending || '(empty)'}</strong></div>
            <div>Full Path String: <strong>{trail || '(root)'}</strong></div>
          </div>

          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
        </div>

        <aside className="stitch-card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Stateless Protocol Specifications</h2>
          <p className="lede" style={{ fontSize: '1rem', marginTop: 0 }}>
            USSD gateways are completely stateless. The gateway prepends historical inputs on each request (e.g. <code>1*2*4</code>), allowing serverless workers to execute deterministically without session database overhead.
          </p>

          <div className="meta-row" style={{ margin: '1.5rem 0 1rem' }}>
            <span>Menu Navigation Map</span>
          </div>

          <ol style={{ paddingLeft: '1.25rem', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
            <li>
              <strong>1</strong> — Band guide: Subject &rarr; Band &rarr; explanation, then <strong>1</strong> for the
              home activity or <strong>2</strong> for the materials list. All six CBC subjects.
            </li>
            <li>
              <strong>2</strong> — Today&apos;s KICD activity: pick a grade (4&ndash;9); the activity rotates daily.
            </li>
            <li>
              <strong>3</strong> — English session: prefix that reruns the whole menu tree in English
              (e.g. <code>3*1*1*4*1</code>).
            </li>
          </ol>

          <p className="muted" style={{ marginTop: '1.5rem' }}>
            Output messages fit within standard USSD 160-character boundaries with word-boundary wrapping.
          </p>
        </aside>
      </div>
    </>
  );
}
