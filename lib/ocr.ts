import { SubjectBand, CBCBand } from './types';

interface SubjectConfig {
  subject: string;
  aliases: string[];
}

const SUBJECT_CONFIGS: SubjectConfig[] = [
  {
    subject: 'Mathematics',
    aliases: ['mathematics', 'maths', 'math', 'hesabu']
  },
  {
    subject: 'English',
    aliases: ['english', 'kiingereza', 'eng']
  },
  {
    subject: 'Kiswahili',
    aliases: ['kiswahili', 'swahili', 'kisw', 'swa']
  },
  {
    subject: 'Science & Technology',
    aliases: [
      'science & technology',
      'science and technology',
      'science & tech',
      'science and tech',
      'science',
      'sayansi',
      'tech'
    ]
  },
  {
    subject: 'Social Studies',
    aliases: ['social studies', 'social study', 'masomo ya jamii', 'social', 'jamii']
  },
  {
    subject: 'Creative Arts',
    aliases: ['creative arts', 'creative art', 'creative', 'sanaa', 'arts']
  }
];

/**
 * Maps a raw band token to a CBCBand.
 */
export function normalizeBand(rawBand: string): CBCBand | null {
  if (!rawBand) return null;
  const token = rawBand.trim().toUpperCase().replace(/[\.\s]/g, '');

  if (token === 'EE' || token === '3E') return 'EE';
  if (token === 'ME' || token === 'M' || token === 'M/E') return 'ME';
  if (token === 'AE' || token === '4E' || token === 'A/E') return 'AE';
  if (token === 'BE' || token === '8E' || token === 'B/E') return 'BE';

  if (token.startsWith('EXCEEDING')) return 'EE';
  if (token.startsWith('MEETING')) return 'ME';
  if (token.startsWith('APPROACHING')) return 'AE';
  if (token.startsWith('BELOW')) return 'BE';

  return null;
}

function findBandInLine(line: string): { band: CBCBand; raw: string } | null {
  const upper = line.toUpperCase();

  // 1. Look for explicit two-letter band codes
  const bandCodeMatch = upper.match(/\b(EE|ME|AE|BE|3E|4E|8E)\b/);
  if (bandCodeMatch) {
    const band = normalizeBand(bandCodeMatch[1]);
    if (band) return { band, raw: bandCodeMatch[0] };
  }

  // 2. Look for spelled-out band words
  const wordMatch = upper.match(/\b(EXCEEDING|MEETING|APPROACHING|BELOW)\b/);
  if (wordMatch) {
    const band = normalizeBand(wordMatch[1]);
    if (band) return { band, raw: wordMatch[0] };
  }

  return null;
}

/**
 * Extracts CBC subject/band pairs from report-card text, whether that text came
 * from OCR or from a parent typing the row out by hand.
 */
export function extractBandsFromText(text: string): SubjectBand[] {
  const bands: SubjectBand[] = [];
  const foundSubjects = new Set<string>();

  if (typeof text === 'string' && text.trim().length > 0) {
    const lines = text.split(/\r?\n/);

    // Technique 1: Line-by-line inspection
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const lowerLine = line.toLowerCase();

      for (const config of SUBJECT_CONFIGS) {
        if (foundSubjects.has(config.subject)) continue;

        const matchedAlias = config.aliases.find((alias) => lowerLine.includes(alias));
        if (matchedAlias) {
          // Check for band on the same line
          let bandResult = findBandInLine(line);

          // If not found on same line, check the next line (useful for two-column OCR line wraps)
          if (!bandResult && i + 1 < lines.length) {
            bandResult = findBandInLine(lines[i + 1]);
          }

          if (bandResult) {
            foundSubjects.add(config.subject);
            bands.push({
              subject: config.subject,
              band: bandResult.band,
              confidence: 0.94,
              raw_match: `${line} (${bandResult.raw})`.trim()
            });
            break;
          }
        }
      }
    }

    // Technique 2: Global regex scan for any subject not found by line inspection
    for (const config of SUBJECT_CONFIGS) {
      if (foundSubjects.has(config.subject)) continue;

      for (const alias of config.aliases) {
        const pattern = new RegExp(
          `\\b${alias.replace('&', '(?:&|and)')}\\b[\\s\\S]*?\\b(exceeding|meeting|approaching|below|EE|ME|AE|BE)\\b`,
          'i'
        );
        const match = text.match(pattern);
        if (match) {
          const band = normalizeBand(match[1]);
          if (band) {
            foundSubjects.add(config.subject);
            bands.push({
              subject: config.subject,
              band,
              confidence: 0.90,
              raw_match: match[0].trim().slice(0, 60)
            });
            break;
          }
        }
      }
    }
  }

  // Fallback demonstration set when nothing is detected from the document
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
 */
export async function runOcr(imageDataUrl: string): Promise<string> {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
    return '';
  }

  try {
    const tesseract = await import('tesseract.js');

    if (typeof window === 'undefined') {
      const path = await import('path');
      const langPath = path.resolve(process.cwd());
      const worker = await tesseract.createWorker('eng', 1, {
        langPath: langPath,
        cachePath: langPath
      });
      const ret = await worker.recognize(imageDataUrl);
      await worker.terminate();
      return ret?.data?.text ?? '';
    }

    const result = await tesseract.recognize(imageDataUrl, 'eng');
    return result?.data?.text ?? '';
  } catch (err) {
    console.warn('OCR worker notice, continuing with fallback parsing:', err);
    try {
      const tesseract = await import('tesseract.js');
      const result = await tesseract.recognize(imageDataUrl, 'eng');
      return result?.data?.text ?? '';
    } catch (e) {
      console.error('OCR recognition failed completely:', e);
      return '';
    }
  }
}
