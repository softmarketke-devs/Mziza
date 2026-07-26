import { ProcessorInput, ProcessorResult, SubjectBand, TranslationResult } from './types';
import { extractBandsFromText, runOcr } from './ocr';
import { generateTranslationsWithClaude } from './claude';
import { handleUSSDSession } from './ussd';
import { resolveKicdPrompt } from './kicd';

// Re-exported so callers keep a single entry point for processing concerns.
export { resolveKicdPrompt };

function buildSpeechText(
  translation: TranslationResult | undefined,
  language: 'sw' | 'en'
): string {

  if (!translation) {
    return language === 'en'
      ? 'Welcome to Mziza.'
      : 'Karibu Mziza.';
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

      let rawText = input.rawText ?? '';

      if (input.mode === 'image') {
        if (!input.imageDataUrl) {
          throw new Error('imageDataUrl is required for image mode');
        }

        if (!rawText || rawText.trim().length === 0) {
          rawText = await runOcr(input.imageDataUrl);
        }
      }

      if (input.mode === 'text' && rawText.trim().length === 0) {
        throw new Error('rawText is required for text mode');
      }

      const detectedBands: SubjectBand[] = extractBandsFromText(rawText);
      const translationRes = await generateTranslationsWithClaude(detectedBands);

      const primarySubject = detectedBands[0]?.subject;
      const kicdPrompt = resolveKicdPrompt({
        grade: input.kicdQuery?.grade,
        subject: input.kicdQuery?.subject ?? primarySubject,
        week: input.kicdQuery?.week
      });

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
