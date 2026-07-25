'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProcessorResult } from '@/lib/types';

const SESSION_ID = 'sim-local-session';
const PHONE_NUMBER = '+254700000000';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export default function UssdPage() {
  const [trail, setTrail] = useState('');
  const [pending, setPending] = useState('');
  const [screen, setScreen] = useState('Dial *384*77# to begin.');
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
        setError(data.error ?? 'The gateway returned nothing usable.');
        return;
      }

      setScreen(data.ussdResponse.message);
      setStatus(data.ussdResponse.responseType === 'CON' ? 'open' : 'ended');
      setTrail(text);
    } catch {
      setError('The simulated gateway could not be reached.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Opening the page dials in, which is what a parent actually does first.
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
      <p className="eyebrow">03 — USSD</p>
      <h1>The same guidance on a feature phone</h1>
      <p className="lede">
        A parent without a smartphone reaches Mzazi Coach over USSD. This page
        replays the gateway locally against the same handler that production
        uses, so the menu you see here is the menu that ships.
      </p>

      <div className="ussd-grid">
        <div>
          <div className="handset">
            <pre className="handset__screen">{screen}</pre>
            <p className="handset__status">
              {loading
                ? 'Sending'
                : status === 'ended'
                  ? 'Session ended'
                  : status === 'open'
                    ? 'Awaiting reply'
                    : 'Ready'}
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
              Send
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setPending('')}
              disabled={pending.length === 0 || loading}
            >
              Clear entry
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={restart}
              disabled={loading}
            >
              Redial
            </button>
          </div>

          <p className="trail">
            Entry: {pending || '—'}
            <br />
            Session text: {trail || '(empty)'}
          </p>

          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
        </div>

        <aside>
          <h2>How the session works</h2>
          <p className="lede">
            The gateway does not keep state between hops. It resends the whole
            path each time, so <code>1*2*4</code> means subject guide, Kiswahili,
            band BE. The handler replays that path on every request, which is
            what makes it safe to run on serverless instances that never share
            memory.
          </p>

          <div className="meta-row">
            <span>Menu map</span>
          </div>

          <ol className="lede" style={{ paddingLeft: '1.2rem' }}>
            <li>
              <strong>1</strong> — subject band guide, then subject, then band.
              Returns the home activity for that pair.
            </li>
            <li>
              <strong>2</strong> — today&apos;s KICD activity, ends the session
              immediately.
            </li>
            <li>
              <strong>3</strong> — language switch, confirmed in the language
              selected.
            </li>
          </ol>

          <p className="muted" style={{ marginTop: '1.5rem' }}>
            Responses are capped to one USSD page. Guidance longer than roughly
            155 characters is trimmed at a word boundary rather than cut mid-word.
          </p>
        </aside>
      </div>
    </>
  );
}
