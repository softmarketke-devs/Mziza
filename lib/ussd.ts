import { CBCBand, KICDPrompt } from './types';
import { OFFLINE_TRANSLATION_BANK } from './offline-bank';
import kicdPromptsRaw from './kicd-prompts.json';
import { KICD_GRADES, pickDailyKicdPrompt } from './kicd';

export interface USSDResponse {
  responseType: 'CON' | 'END';
  message: string;
}

export interface USSDPayload {
  sessionId: string;
  phoneNumber: string;
  text: string;
}

type Lang = 'sw' | 'en';

export const USSD_MAX_CHARS = 182;

const KICD_PROMPTS = kicdPromptsRaw as KICDPrompt[];

/** Menu order is the contract with the printed digits — keep index = digit - 1. */
const SUBJECTS: Array<{ key: string; sw: string; en: string }> = [
  { key: 'Mathematics', sw: 'Hisabati', en: 'Mathematics' },
  { key: 'English', sw: 'Kiingereza', en: 'English' },
  { key: 'Kiswahili', sw: 'Kiswahili', en: 'Kiswahili' },
  { key: 'Science & Technology', sw: 'Sayansi & Tek', en: 'Science & Tech' },
  { key: 'Social Studies', sw: 'Maarifa ya Jamii', en: 'Social Studies' },
  { key: 'Creative Arts', sw: 'Sanaa za Ubunifu', en: 'Creative Arts' }
];

const BANDS: Array<{ key: CBCBand; sw: string; en: string }> = [
  { key: 'EE', sw: 'EE - Kupita Matarajio', en: 'EE - Exceeding' },
  { key: 'ME', sw: 'ME - Kufikia Matarajio', en: 'ME - Meeting' },
  { key: 'AE', sw: 'AE - Kukaribia', en: 'AE - Approaching' },
  { key: 'BE', sw: 'BE - Chini ya Matarajio', en: 'BE - Below' }
];

const GRADES = KICD_GRADES;

const T = {
  welcome: {
    sw: 'CON Karibu Mziza (CBC)\n1. Mwongozo wa Daraja\n2. Shughuli ya KICD Leo\n3. English',
    en: "CON Welcome to Mziza (CBC)\n1. Band Guide\n2. Today's KICD Activity"
  },
  chooseSubject: { sw: 'CON Chagua Somo:', en: 'CON Select Subject:' },
  chooseBand: { sw: 'CON Chagua Daraja:', en: 'CON Select Band:' },
  chooseGrade: { sw: 'CON Chagua Gredi:', en: 'CON Select Grade:' },
  resultOptions: { sw: '1. Shughuli ya nyumbani\n2. Vifaa', en: '1. Home activity\n2. Materials' },
  materialsTitle: { sw: 'Vifaa vya nyumbani:', en: 'Household materials:' },
  invalid: {
    sw: 'END Chaguo si sahihi. Piga *384*77# tena kuanza upya.',
    en: 'END Invalid choice. Dial *384*77# again to restart.'
  },
  bye: { sw: 'END Asante kwa kutumia Mziza.', en: 'END Thank you for using Mziza.' }
} as const;

function con(message: string): USSDResponse {
  return { responseType: 'CON', message };
}

function end(message: string): USSDResponse {
  return { responseType: 'END', message };
}

function invalidChoice(lang: Lang): USSDResponse {
  return end(T.invalid[lang]);
}

/** Trims text on a word boundary so the whole page stays within `limit`. */
function fitWords(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, Math.max(0, limit - 3));
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

/** Builds `head\nbody` with the body shortened until the page fits the gateway cap. */
function page(head: string, body: string, tail = ''): string {
  const fixed = head.length + 1 + (tail ? tail.length + 1 : 0);
  const bodyFit = fitWords(body, USSD_MAX_CHARS - fixed);
  return tail ? `${head}\n${bodyFit}\n${tail}` : `${head}\n${bodyFit}`;
}

function numberedMenu(title: string, labels: string[]): string {
  return [title, ...labels.map((label, i) => `${i + 1}. ${label}`)].join('\n');
}

/**
 * Band guidance branch: subject -> band -> explanation hub -> activity/materials.
 */
function handleBandGuide(parts: string[], lang: Lang): USSDResponse {
  if (parts.length === 0) {
    return con(numberedMenu(T.chooseSubject[lang], SUBJECTS.map((s) => s[lang])));
  }

  const subject = SUBJECTS[Number(parts[0]) - 1];
  if (!subject || String(Number(parts[0])) !== parts[0]) {
    return invalidChoice(lang);
  }

  if (parts.length === 1) {
    return con(numberedMenu(T.chooseBand[lang], BANDS.map((b) => b[lang])));
  }

  const band = BANDS[Number(parts[1]) - 1];
  if (!band) {
    return invalidChoice(lang);
  }

  const entry = OFFLINE_TRANSLATION_BANK[subject.key]?.[band.key];
  if (!entry) {
    return invalidChoice(lang);
  }

  const bandName = lang === 'sw' ? entry.band_name_sw : entry.band_name_en;
  const explanation = lang === 'sw' ? entry.explanation_sw : entry.explanation_en;
  const activity = lang === 'sw' ? entry.activity_sw : entry.activity_en;

  if (parts.length === 2) {
    return con(page(`CON ${subject[lang]}: ${bandName}`, explanation, T.resultOptions[lang]));
  }

  if (parts[2] === '1') {
    return end(page(`END ${subject[lang]} ${band.key}`, activity));
  }

  if (parts[2] === '2') {
    return end(page(`END ${T.materialsTitle[lang]}`, entry.diy_materials.join('; ')));
  }

  return invalidChoice(lang);
}

/**
 * KICD branch: grade -> today's activity for that grade.
 */
function handleKicdActivity(parts: string[], lang: Lang, now = new Date()): USSDResponse {
  if (parts.length === 0) {
    return con(
      numberedMenu(T.chooseGrade[lang], GRADES.map((g) => (lang === 'sw' ? `Gredi ${g.slice(-1)}` : `Grade ${g.slice(-1)}`)))
    );
  }

  const gradeIndex = Number(parts[0]) - 1;
  const grade = GRADES[gradeIndex];
  if (!grade) {
    return invalidChoice(lang);
  }

  const prompt = pickDailyKicdPrompt(grade, now);
  if (!prompt) {
    return invalidChoice(lang);
  }

  const activity = lang === 'sw' ? prompt.activity_sw : prompt.activity_en;
  const head = `END [KICD ${lang === 'sw' ? 'Gredi' : 'Grade'} ${grade.slice(-1)}] ${prompt.subject}`;
  return end(page(head, activity));
}

/**
 * Drives the USSD menu from the accumulated Africa's Talking `text` value.
 */
export function handleUSSDSession(payload: USSDPayload): USSDResponse {
  const raw = payload?.text ?? '';
  let parts = raw ? raw.split('*').filter((p) => p !== '') : [];

  let lang: Lang = 'sw';
  if (parts[0] === '3') {
    lang = 'en';
    parts = parts.slice(1);
  }

  if (parts.length === 0) {
    return con(T.welcome[lang]);
  }

  if (parts[0] === '1') {
    return handleBandGuide(parts.slice(1), lang);
  }

  if (parts[0] === '2') {
    return handleKicdActivity(parts.slice(1), lang);
  }

  return invalidChoice(lang);
}

