import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnifiedProcessor, resolveKicdPrompt } from '../processor';
import { extractBandsFromText, normalizeBand, isFallbackExtraction } from '../ocr';
import { handleUSSDSession, USSD_MAX_CHARS } from '../ussd';
import { fallbackOfflineTranslations } from '../claude';
import { OFFLINE_TRANSLATION_BANK } from '../offline-bank';
import { KICD_GRADES, KICD_PROMPTS, pickDailyKicdPrompt } from '../kicd';

const originalKey = process.env.CLAUDE_API_KEY;

beforeEach(() => {
  delete process.env.CLAUDE_API_KEY;
});

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.CLAUDE_API_KEY;
  } else {
    process.env.CLAUDE_API_KEY = originalKey;
  }
});

describe('band normalisation', () => {
  it('maps two-letter codes', () => {
    expect(normalizeBand('EE')).toBe('EE');
    expect(normalizeBand('ME')).toBe('ME');
    expect(normalizeBand('AE')).toBe('AE');
    expect(normalizeBand('BE')).toBe('BE');
  });

  it('maps spelled-out bands without EE/ME collision', () => {
    expect(normalizeBand('meeting')).toBe('ME');
    expect(normalizeBand('exceeding')).toBe('EE');
    expect(normalizeBand('approaching')).toBe('AE');
    expect(normalizeBand('below')).toBe('BE');
  });

  it('rejects unknown tokens', () => {
    expect(normalizeBand('excellent')).toBeNull();
    expect(normalizeBand('')).toBeNull();
  });
});

describe('OCR extraction', () => {
  it('extracts BE for Mathematics and EE for Kiswahili', () => {
    const bands = extractBandsFromText('Mathematics - BE, Kiswahili - EE');

    const math = bands.find((b) => b.subject === 'Mathematics');
    const kiswahili = bands.find((b) => b.subject === 'Kiswahili');

    expect(math?.band).toBe('BE');
    expect(kiswahili?.band).toBe('EE');
    expect(isFallbackExtraction(bands)).toBe(false);
  });

  it('reads spelled-out bands from a table-style row', () => {
    const bands = extractBandsFromText(
      'SUBJECT | RATING\nMathematics | Meeting\nEnglish | Exceeding'
    );

    expect(bands.find((b) => b.subject === 'Mathematics')?.band).toBe('ME');
    expect(bands.find((b) => b.subject === 'English')?.band).toBe('EE');
  });

  it('falls back to demonstration bands when nothing matches', () => {
    const bands = extractBandsFromText('no subject rows on this page');

    expect(bands).toHaveLength(3);
    expect(isFallbackExtraction(bands)).toBe(true);
  });
});

describe('offline fallback', () => {
  it('returns a complete translation for every detected band', () => {
    const translations = fallbackOfflineTranslations([
      { subject: 'Mathematics', band: 'BE', confidence: 0.92 },
      { subject: 'Creative Arts', band: 'EE', confidence: 0.92 }
    ]);

    expect(translations).toHaveLength(2);
    for (const t of translations) {
      expect(t.explanation_sw.length).toBeGreaterThan(0);
      expect(t.explanation_en.length).toBeGreaterThan(0);
      expect(t.activity_sw.length).toBeGreaterThan(0);
      expect(t.diy_materials.length).toBeGreaterThan(0);
    }
  });

  it('covers every subject the extractor can detect, across all four bands', () => {
    const subjects = [
      'Mathematics',
      'English',
      'Kiswahili',
      'Science & Technology',
      'Social Studies',
      'Creative Arts'
    ];

    for (const subject of subjects) {
      for (const band of ['BE', 'AE', 'ME', 'EE'] as const) {
        expect(OFFLINE_TRANSLATION_BANK[subject]?.[band]).toBeDefined();
      }
    }
  });

  it('processes text mode from the offline bank when no API key is set', async () => {
    const result = await UnifiedProcessor.process({
      mode: 'text',
      rawText: 'Mathematics: BE, Kiswahili: EE'
    });

    expect(result.success).toBe(true);
    expect(result.source).toBe('offline_cache');
    expect(result.translations.length).toBeGreaterThan(0);
    expect(result.translations[0].explanation_sw.length).toBeGreaterThan(0);
  });
});

describe('USSD sessions', () => {
  it('opens with the main menu on an empty session', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '' });

    expect(res.responseType).toBe('CON');
    expect(res.message).toContain('Karibu Mziza');
  });

  it('lists every offline-bank subject in the subject menu', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '1' });

    expect(res.responseType).toBe('CON');
    for (const label of ['Hisabati', 'Kiingereza', 'Kiswahili', 'Sayansi', 'Jamii', 'Sanaa']) {
      expect(res.message).toContain(label);
    }
  });

  it('returns the band menu after a subject is chosen', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '1*1' });

    expect(res.responseType).toBe('CON');
    expect(res.message).toContain('Chagua Daraja');
  });

  it('shows the real explanation hub once a band is chosen', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '1*3*4' });

    expect(res.responseType).toBe('CON');
    expect(res.message).toContain('Kiswahili');
    expect(res.message).toContain(
      OFFLINE_TRANSLATION_BANK['Kiswahili'].BE.explanation_sw.split(' ').slice(0, 4).join(' ')
    );
    expect(res.message).toContain('1. Shughuli');
  });

  it('ends with the concrete home activity from the hub', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '1*1*4*1' });

    expect(res.responseType).toBe('END');
    expect(res.message).toContain(
      OFFLINE_TRANSLATION_BANK['Mathematics'].BE.activity_sw.split(' ').slice(0, 4).join(' ')
    );
  });

  it('lists DIY materials from the hub', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '1*1*4*2' });

    expect(res.responseType).toBe('END');
    expect(res.message).toContain('Vifaa');
  });

  it('runs the whole session in English behind the 3 prefix', () => {
    const menu = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '3' });
    expect(menu.responseType).toBe('CON');
    expect(menu.message).toContain('Welcome to Mziza');

    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '3*1*1*4*1' });
    expect(res.responseType).toBe('END');
    expect(res.message).toContain(
      OFFLINE_TRANSLATION_BANK['Mathematics'].BE.activity_en.split(' ').slice(0, 4).join(' ')
    );
  });

  it('serves a grade-matched KICD activity', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '2*2' });

    expect(res.responseType).toBe('END');
    expect(res.message).toContain('Gredi 5');
  });

  it('keeps every reachable response within one USSD page', () => {
    const paths = ['', '1', '2', '3', '3*1', '3*2', '9'];

    for (const subject of ['1', '2', '3', '4']) {
      paths.push(`1*${subject}`);
      for (const band of ['1', '2', '3', '4']) {
        paths.push(`1*${subject}*${band}`);
      }
    }

    for (let i = 1; i <= KICD_GRADES.length; i += 1) {
      paths.push(`2*${i}`);
    }

    for (const text of paths) {
      const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text });
      expect(
        res.message.length,
        `path "${text}" produced ${res.message.length} chars`
      ).toBeLessThanOrEqual(USSD_MAX_CHARS);
    }
  });

  it('rejects an out-of-range menu choice', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '1*9' });

    expect(res.responseType).toBe('END');
    expect(res.message).toContain('si sahihi');
  });

  it('asks for a grade before serving the daily KICD activity', () => {
    const res = handleUSSDSession({ sessionId: 's', phoneNumber: 'p', text: '2' });

    expect(res.responseType).toBe('CON');
    expect(res.message).toMatch(/(Select Grade|Chagua Gredi)/);
    for (const grade of KICD_GRADES) {
      expect(res.message).toMatch(new RegExp(`(Grade|Gredi) ${grade.replace('grade_', '')}`));
    }
  });

  it('serves real KICD curriculum content, not a hardcoded string', () => {
    for (const [index, grade] of KICD_GRADES.entries()) {
      const res = handleUSSDSession({
        sessionId: 's',
        phoneNumber: 'p',
        text: `2*${index + 1}`
      });
      const expected = pickDailyKicdPrompt(grade);

      expect(expected).toBeDefined();
      expect(res.responseType).toBe('END');
      expect(res.message).toMatch(new RegExp(`(Grade|Gredi) ${grade.replace('grade_', '')}`));
      expect(res.message).toContain(expected!.subject);

      // The body is the activity from kicd-prompts.json, truncated to the page.
      const body = res.message.split('\n').slice(1).join('\n').replace(/\.\.\.$/, '');
      expect(expected!.activity_sw.startsWith(body) || expected!.activity_en.startsWith(body)).toBe(true);
    }
  });

  it('rejects a grade choice that is not on the menu', () => {
    const res = handleUSSDSession({
      sessionId: 's',
      phoneNumber: 'p',
      text: `2*${KICD_GRADES.length + 1}`
    });

    expect(res.responseType).toBe('END');
    expect(res.message).toContain('si sahihi');
  });

  it('routes USSD mode through the processor', async () => {
    const result = await UnifiedProcessor.process({
      mode: 'ussd',
      ussdPayload: { sessionId: 's', phoneNumber: 'p', text: '1*1' }
    });

    expect(result.success).toBe(true);
    expect(result.ussdResponse?.responseType).toBe('CON');
    expect(result.source).toBe('offline_cache');
  });
});

describe('speech output', () => {
  it('emits Swahili speech data by default', async () => {
    const result = await UnifiedProcessor.process({
      mode: 'text',
      rawText: 'Mathematics: AE'
    });

    expect(result.speechData?.language).toBe('sw-KE');
    expect(result.speechData?.textToSpeak.length).toBeGreaterThan(0);
  });

  it('switches to English when the caller asks for it', async () => {
    const result = await UnifiedProcessor.process({
      mode: 'text',
      rawText: 'Mathematics: AE',
      language: 'en'
    });

    expect(result.speechData?.language).toBe('en-US');
    expect(result.speechData?.textToSpeak).toContain('Band:');
  });
});

describe('KICD resolution', () => {
  it('prefers a prompt matching the requested grade', () => {
    const prompt = resolveKicdPrompt({ grade: 'grade_7' });
    expect(prompt?.grade).toBe('grade_7');
  });

  it('prefers grade over subject when both are supplied', () => {
    const prompt = resolveKicdPrompt({ grade: 'grade_9', subject: 'Mathematics' });
    expect(prompt?.grade).toBe('grade_9');
  });

  it('still returns a prompt for an unmatched week', () => {
    const prompt = resolveKicdPrompt({ grade: 'grade_4', week: 99 });
    expect(prompt).toBeDefined();
  });

  it('returns nothing rather than an arbitrary prompt for an empty query', () => {
    expect(resolveKicdPrompt({})).toBeUndefined();
  });

  it('returns nothing when no field matches any prompt', () => {
    expect(resolveKicdPrompt({ grade: 'grade_12', subject: 'Astrophysics' })).toBeUndefined();
  });

  it('picks the same daily activity for a grade throughout one Nairobi day', () => {
    // 03:30 and 23:30 on 26 July 2026 in Nairobi (UTC+3), from either end of
    // the day, must land on the same activity regardless of server timezone.
    const morning = new Date('2026-07-26T00:30:00Z');
    const night = new Date('2026-07-26T20:30:00Z');

    for (const grade of KICD_GRADES) {
      const first = pickDailyKicdPrompt(grade, morning);
      const second = pickDailyKicdPrompt(grade, night);

      expect(first).toBeDefined();
      expect(first?.grade).toBe(grade);
      expect(second?.id).toBe(first?.id);
    }
  });

  it('rolls the daily activity over at Nairobi midnight, not UTC midnight', () => {
    const grade = KICD_GRADES.find(
      (g) => KICD_PROMPTS.filter((p) => p.grade === g).length > 1
    );
    expect(grade).toBeDefined();

    // 20:59Z is 23:59 in Nairobi; 21:01Z is 00:01 the next day there.
    const beforeMidnight = pickDailyKicdPrompt(grade!, new Date('2026-07-26T20:59:00Z'));
    const afterMidnight = pickDailyKicdPrompt(grade!, new Date('2026-07-26T21:01:00Z'));

    expect(afterMidnight?.id).not.toBe(beforeMidnight?.id);
  });

  it('advances the daily activity for a grade that has several', () => {
    const grade = KICD_GRADES.find(
      (g) => KICD_PROMPTS.filter((p) => p.grade === g).length > 1
    );
    expect(grade).toBeDefined();

    const ids = new Set(
      Array.from({ length: 7 }, (_, offset) =>
        pickDailyKicdPrompt(grade!, new Date(2026, 6, 26 + offset))?.id
      )
    );

    expect(ids.size).toBeGreaterThan(1);
  });

  it('returns a KICD prompt through kicd mode without calling the model', async () => {
    const result = await UnifiedProcessor.process({
      mode: 'kicd',
      kicdQuery: { grade: 'grade_5', subject: 'Science & Technology' }
    });

    expect(result.success).toBe(true);
    expect(result.kicdPrompt?.grade).toBe('grade_5');
    expect(result.translations).toHaveLength(0);
  });
});

describe('input validation', () => {
  it('fails cleanly when image mode has no image', async () => {
    const result = await UnifiedProcessor.process({ mode: 'image' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('imageDataUrl');
  });

  it('fails cleanly when text mode has no text', async () => {
    const result = await UnifiedProcessor.process({ mode: 'text', rawText: '   ' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('rawText');
  });

  it('fails cleanly when USSD mode has no payload', async () => {
    const result = await UnifiedProcessor.process({ mode: 'ussd' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('ussdPayload');
  });
});
