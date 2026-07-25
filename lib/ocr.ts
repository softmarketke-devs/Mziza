import { SubjectBand, CBCBand } from './types';

interface SubjectPattern {
  subject: string;
  regex: RegExp;
}

/**
 * Subject patterns seen on Kenyan CBC report cards. Each capture group holds
 * either the two-letter band code or the spelled-out band name, in either
 * column order (subject then band).
 */
const SUBJECT_PATTERNS: SubjectPattern[] = [
  {
    subject: 'Mathematics',
    regex:
      /(?:mathematics|maths|math|hesabu)\s*[:\-=|]?\s*(exceeding|meeting|approaching|below|EE|ME|AE|BE)\b/i
  },
  {
    subject: 'English',
    regex:
      /(?:english|kiingereza)\s*[:\-=|]?\s*(exceeding|meeting|approaching|below|EE|ME|AE|BE)\b/i
  },
  {
    subject: 'Kiswahili',
    regex:
      /(?:kiswahili|swahili)\s*[:\-=|]?\s*(exceeding|meeting|approaching|below|EE|ME|AE|BE)\b/i
  },
  {
    subject: 'Science & Technology',
    regex:
      /(?:science\s*(?:&|and)?\s*tech(?:nology)?|science|sayansi)\s*[:\-=|]?\s*(exceeding|meeting|approaching|below|EE|ME|AE|BE)\b/i
  },
  {
    subject: 'Social Studies',
    regex:
      /(?:social\s*studies|masomo\s*ya\s*jamii|jamii)\s*[:\-=|]?\s*(exceeding|meeting|approaching|below|EE|ME|AE|BE)\b/i
  },
  {
    subject: 'Creative Arts',
    regex:
      /(?:creative\s*arts?|sanaa)\s*[:\-=|]?\s*(exceeding|meeting|approaching|below|EE|ME|AE|BE)\b/i
  }
];

/**
 * Maps a raw band token to a CBCBand.
 *
 * Order matters and substring checks alone are not safe: "MEETING" contains the
 * substring "EE", so any EE-first substring test misclassifies every ME row on
 * the card. Exact-token checks run first, and the spelled-out words are matched
 * by prefix rather than by `includes`.
 */
export function normalizeBand(rawBand: string): CBCBand | null {
  const token = rawBand.trim().toUpperCase();

  if (token === 'EE') return 'EE';
  if (token === 'ME') return 'ME';
  if (token === 'AE') return 'AE';
  if (token === 'BE') return 'BE';

  if (token.startsWith('EXCEEDING')) return 'EE';
  if (token.startsWith('MEETING')) return 'ME';
  if (token.startsWith('APPROACHING')) return 'AE';
  if (token.startsWith('BELOW')) return 'BE';

  return null;
}

/**
 * Extracts CBC subject/band pairs from report-card text, whether that text came
 * from OCR or from a parent typing the row out by hand.
 *
 * When nothing matches, a small demonstration set is returned so the downstream
 * pipeline still has something to translate. `confidence` distinguishes the two:
 * matched rows report high confidence, demonstration rows report low.
 */
export function extractBandsFromText(text: string): SubjectBand[] {
  const bands: SubjectBand[] = [];

  if (typeof text === 'string' && text.trim().length > 0) {
    for (const item of SUBJECT_PATTERNS) {
      const match = text.match(item.regex);
      if (!match) continue;

      const band = normalizeBand(match[1]);
      if (!band) continue;

      bands.push({
        subject: item.subject,
        band,
        confidence: 0.92,
        raw_match: match[0].trim()
      });
    }
  }

  if (bands.length === 0) {
    return [
      { subject: 'Mathematics', band: 'AE', confidence: 0.35 },
      { subject: 'Kiswahili', band: 'ME', confidence: 0.35 },
      { subject: 'Science & Technology', band: 'BE', confidence: 0.35 }
    ];
  }

  return bands;
}

/** True when every band came from the demonstration fallback rather than a real match. */
export function isFallbackExtraction(bands: SubjectBand[]): boolean {
  return bands.length > 0 && bands.every((b) => b.confidence < 0.5);
}

/**
 * Runs Tesseract over an image data URL and returns the recognised text.
 *
 * tesseract.js is imported dynamically so a missing or failed install degrades
 * to "no text recognised" instead of breaking the build or the request. Callers
 * fall back to whatever text they already have.
 */
export async function runOcr(imageDataUrl: string): Promise<string> {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
    return '';
  }

  try {
    const tesseract = await import('tesseract.js');
    const result = await tesseract.recognize(imageDataUrl, 'eng');
    return result?.data?.text ?? '';
  } catch (err) {
    console.warn('OCR unavailable, continuing without recognised text:', err);
    return '';
  }
}
