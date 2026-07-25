import { SubjectBand, TranslationResult, CBCBand } from './types';
import {
  OFFLINE_TRANSLATION_BANK,
  DEFAULT_BANK_SUBJECT,
  DEFAULT_BANK_BAND
} from './offline-bank';

export type TranslationSource = 'online_claude' | 'offline_cache';

export interface TranslationOutcome {
  translations: TranslationResult[];
  source: TranslationSource;
}

const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const DEFAULT_TIMEOUT_MS = 12_000;

function buildPrompt(bands: SubjectBand[]): string {
  return `You are an expert Kenyan CBC (Competency-Based Curriculum) educational coach.
Translate the following student performance bands into parent-friendly Kiswahili and English with practical, low-cost home learning activities using everyday Kenyan household items.

Input Bands:
${JSON.stringify(bands, null, 2)}

Rules:
- Write for a parent who did not attend secondary school. Short sentences, no jargon.
- Every activity must use items already found in an ordinary Kenyan household.
- Never shame the child or the parent, including for a BE band.
- Return one object per input band, in the same order.

Return ONLY valid JSON matching this exact structure:
[
  {
    "subject": "Mathematics",
    "band": "AE",
    "band_name_sw": "Kukaribia Matarajio (AE)",
    "band_name_en": "Approaching Expectation (AE)",
    "explanation_sw": "...",
    "explanation_en": "...",
    "activity_sw": "...",
    "activity_en": "...",
    "diy_materials": ["Vifuniko vya chupa", "Rula"]
  }
]`;
}

/** Strips markdown fences and grabs the outermost JSON array from a model reply. */
function parseModelJson(contentText: string): unknown {
  const withoutFences = contentText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = withoutFences.indexOf('[');
  const end = withoutFences.lastIndexOf(']');
  const candidate =
    start !== -1 && end !== -1 && end > start
      ? withoutFences.slice(start, end + 1)
      : withoutFences;

  return JSON.parse(candidate);
}

const REQUIRED_STRING_FIELDS: Array<keyof TranslationResult> = [
  'subject',
  'band_name_sw',
  'band_name_en',
  'explanation_sw',
  'explanation_en',
  'activity_sw',
  'activity_en'
];

const VALID_BANDS: CBCBand[] = ['BE', 'AE', 'ME', 'EE'];

/**
 * Rejects a model reply that parsed as JSON but is not usable as a
 * TranslationResult list. A malformed reply falls back offline rather than
 * rendering blank cards to a parent.
 */
function isValidTranslationList(value: unknown): value is TranslationResult[] {
  if (!Array.isArray(value) || value.length === 0) return false;

  return value.every((entry) => {
    if (typeof entry !== 'object' || entry === null) return false;
    const record = entry as Record<string, unknown>;

    const stringsOk = REQUIRED_STRING_FIELDS.every(
      (field) =>
        typeof record[field] === 'string' && (record[field] as string).trim().length > 0
    );
    const bandOk = VALID_BANDS.includes(record.band as CBCBand);
    const materialsOk =
      Array.isArray(record.diy_materials) &&
      record.diy_materials.every((m) => typeof m === 'string');

    return stringsOk && bandOk && materialsOk;
  });
}

/** Builds the full translation set from the offline bank. Never throws. */
export function fallbackOfflineTranslations(bands: SubjectBand[]): TranslationResult[] {
  return bands.map((b) => {
    const subjectData =
      OFFLINE_TRANSLATION_BANK[b.subject] ?? OFFLINE_TRANSLATION_BANK[DEFAULT_BANK_SUBJECT];
    const bandData = subjectData[b.band] ?? subjectData[DEFAULT_BANK_BAND];

    return {
      subject: b.subject,
      band: b.band,
      ...bandData
    };
  });
}

/**
 * Requests translations from Claude, falling back to the offline bank whenever
 * the key is absent, the call fails, the call times out, or the reply does not
 * validate. The caller always receives a complete translation set.
 */
export async function generateTranslationsWithClaude(
  bands: SubjectBand[],
  apiKey?: string
): Promise<TranslationOutcome> {
  const effectiveApiKey = apiKey || process.env.CLAUDE_API_KEY;

  if (!effectiveApiKey) {
    return { translations: fallbackOfflineTranslations(bands), source: 'offline_cache' };
  }

  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(process.env.CLAUDE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': effectiveApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: buildPrompt(bands) }]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Claude API error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const contentText: string = data?.content?.[0]?.text ?? '';
    const parsed = parseModelJson(contentText);

    if (!isValidTranslationList(parsed)) {
      throw new Error('Claude reply did not match the expected translation shape');
    }

    return { translations: parsed, source: 'online_claude' };
  } catch (err) {
    console.warn('Claude API unavailable. Serving the offline bank instead:', err);
    return { translations: fallbackOfflineTranslations(bands), source: 'offline_cache' };
  } finally {
    clearTimeout(timer);
  }
}
