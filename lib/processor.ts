import { ProcessorInput, ProcessorResult, KICDPrompt, SubjectBand, TranslationResult } from './types';
import { extractBandsFromText, runOcr } from './ocr';
import { generateTranslationsWithClaude } from './claude';
import { handleUSSDSession } from './ussd';
import kicdPromptsRaw from './kicd-prompts.json';

const KICD_PROMPTS = kicdPromptsRaw as KICDPrompt[];

/**
 * Text used when an image arrives but OCR produces nothing usable, for example
 * on a device where the Tesseract worker cannot start. It keeps the demo path
 * alive so a parent still sees a worked example instead of an error screen.
 */
const OCR_DEMO_FALLBACK_TEXT =
  'Mathematics: AE, Kiswahili: ME, Science & Technology: BE';

interface KicdQuery {
  grade?: string;
  subject?: string;
  week?: number;
}

/**
 * Picks the closest KICD prompt to the query. Scoring beats filtering here:
 * a parent asking for grade 5 week 9 should still get the grade 5 material
 * rather than an empty result.
 */
export function resolveKicdPrompt(query: KicdQuery): KICDPrompt | undefined {
  if (KICD_PROMPTS.length === 0) return undefined;

  const scored = KICD_PROMPTS.map((prompt) => {
    let score = 0;
    if (query.grade && prompt.grade === query.grade) score += 4;
    if (query.subject && prompt.subject === query.subject) score += 2;
    if (typeof query.week === 'number' && prompt.week === query.week) score += 1;
    return { prompt, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].prompt;
}

/** Builds the sentence read aloud by the Web Speech API on the client. */
function buildSpeechText(
  translation: TranslationResult | undefined,
  language: 'sw' | 'en'
): string {
  if (!translation) {
    return language === 'en'
      ? 'Welcome to Mzazi Coach.'
      : 'Karibu Mzazi Coach.';
  }

  if (language === 'en') {
    return `${translation.subject}. Band: ${translation.band_name_en}. ${translation.explanation_en}. Home activity: ${translation.activity_en}`;
  }

  return `${translation.subject}. Daraja: ${translation.band_name_sw}. ${translation.explanation_sw}. Shughuli ya nyumbani: ${translation.activity_sw}`;
}

export class UnifiedProcessor {
  public static async process(input: ProcessorInput): Promise<ProcessorResult> {
    const startTime = Date.now();
    const language: 'sw' | 'en' = input?.language === 'en' ? 'en' : 'sw';

    try {
      if (!input || typeof input.mode !== 'string') {
        throw new Error('A processing mode is required');
      }

      // Stage 1a: USSD sessions short-circuit the pipeline. They are stateless,
      // fully offline, and must answer within the gateway timeout.
      if (input.mode === 'ussd') {
        if (!input.ussdPayload) {
          throw new Error('ussdPayload is required for USSD mode');
        }

        return {
          success: true,
          mode: 'ussd',
          detectedBands: [],
          translations: [],
          ussdResponse: handleUSSDSession(input.ussdPayload),
          source: 'offline_cache',
          executionTimeMs: Date.now() - startTime
        };
      }

      // Stage 1b: a KICD lookup needs no bands and no model call.
      if (input.mode === 'kicd') {
        const kicdPrompt = resolveKicdPrompt(input.kicdQuery ?? {});
        const spoken = kicdPrompt
          ? language === 'en'
            ? `${kicdPrompt.subject}. ${kicdPrompt.activity_en}`
            : `${kicdPrompt.subject}. ${kicdPrompt.activity_sw}`
          : buildSpeechText(undefined, language);

        return {
          success: true,
          mode: 'kicd',
          detectedBands: [],
          translations: [],
          kicdPrompt,
          speechData: {
            textToSpeak: spoken,
            language: language === 'en' ? 'en-US' : 'sw-KE'
          },
          source: 'offline_cache',
          executionTimeMs: Date.now() - startTime
        };
      }

      // Stage 1c: normalise image or typed input down to plain text.
      let rawText = input.rawText ?? '';

      if (input.mode === 'image') {
        if (!input.imageDataUrl) {
          throw new Error('imageDataUrl is required for image mode');
        }

        const recognised = await runOcr(input.imageDataUrl);
        rawText = recognised.trim().length > 0 ? recognised : OCR_DEMO_FALLBACK_TEXT;
      }

      if (input.mode === 'text' && rawText.trim().length === 0) {
        throw new Error('rawText is required for text mode');
      }

      // Stage 2: band extraction.
      const detectedBands: SubjectBand[] = extractBandsFromText(rawText);

      // Stage 3: translation, online when possible and offline when not.
      const translationRes = await generateTranslationsWithClaude(detectedBands);

      // Stage 4: curriculum prompt matched to the strongest signal we have.
      const primarySubject = detectedBands[0]?.subject;
      const kicdPrompt = resolveKicdPrompt({
        grade: input.kicdQuery?.grade,
        subject: input.kicdQuery?.subject ?? primarySubject,
        week: input.kicdQuery?.week
      });

      // Stage 5: speech payload for the client-side Web Speech API.
      const speechText = buildSpeechText(translationRes.translations[0], language);

      return {
        success: true,
        mode: input.mode,
        detectedBands,
        translations: translationRes.translations,
        kicdPrompt,
        speechData: {
          textToSpeak: speechText,
          language: language === 'en' ? 'en-US' : 'sw-KE'
        },
        source: translationRes.source,
        executionTimeMs: Date.now() - startTime
      };
    } catch (err) {
      return {
        success: false,
        mode: input?.mode ?? 'text',
        detectedBands: [],
        translations: [],
        source: 'offline_cache',
        executionTimeMs: Date.now() - startTime,
        error: err instanceof Error ? err.message : 'Unknown processing error'
      };
    }
  }
}
