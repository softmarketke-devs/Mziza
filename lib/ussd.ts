import { CBCBand } from './types';
import { OFFLINE_TRANSLATION_BANK } from './offline-bank';
import { KICD_GRADES, Grade, pickDailyKicdPrompt } from './kicd';

export interface USSDResponse {
  responseType: 'CON' | 'END';
  message: string;
}

export interface USSDPayload {
  sessionId: string;
  phoneNumber: string;
  text: string;
}

/**
 * Hard character ceiling for one USSD page on the Kenyan networks Africa's
 * Talking fronts. Every reply is assembled against this budget rather than
 * trimmed to a guessed constant, because the header length varies with the
 * subject name and a long subject used to push the page over the edge.
 */
export const USSD_MAX_CHARS = 182;

/** Menu index to subject, matching the order printed in the subject menu. */
const SUBJECT_MENU: Record<string, string> = {
  '1': 'Mathematics',
  '2': 'Kiswahili',
  '3': 'Science & Technology',
  '4': 'English'
};

/** Menu index to band, matching the order printed in the band menu. */
const BAND_MENU: Record<string, CBCBand> = {
  '1': 'EE',
  '2': 'ME',
  '3': 'AE',
  '4': 'BE'
};

/**
 * Menu index to grade, derived from the curriculum data rather than written by
 * hand. Adding a grade to `kicd-prompts.json` extends the USSD menu with it and
 * cannot leave the menu pointing at a grade that has no activities.
 */
const GRADE_MENU: Record<string, Grade> = Object.fromEntries(
  KICD_GRADES.map((grade, index) => [String(index + 1), grade])
);

/** "grade_5" -> "5", for menu lines and reply headers. */
function gradeNumber(grade: string): string {
  return grade.replace('grade_', '');
}

/** Trims a body to the space left on the page without cutting a word in half. */
function truncateForUssd(text: string, limit: number): string {
  if (limit <= 0) return '';
  if (text.length <= limit) return text;

  // The ellipsis has to fit inside the limit, not be appended past it.
  const room = limit - 3;
  const cut = text.slice(0, room);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

/**
 * Assembles one USSD page, giving the header priority and fitting the body into
 * whatever room is left. Callers cannot accidentally exceed the page limit.
 */
function page(
  responseType: 'CON' | 'END',
  header: string,
  body: string
): USSDResponse {
  const prefix = `${responseType} ${header}\n`;
  return {
    responseType,
    message: `${prefix}${truncateForUssd(body, USSD_MAX_CHARS - prefix.length)}`
  };
}

function menu(lines: string[]): USSDResponse {
  return { responseType: 'CON', message: `CON ${lines.join('\n')}` };
}

function mainMenu(): USSDResponse {
  return menu([
    'Karibu Mzazi Coach (CBC Assistant)',
    '1. Check Subject Band Guide',
    "2. Get Today's KICD Activity",
    '3. Switch Language (Kiswahili/English)'
  ]);
}

function subjectMenu(): USSDResponse {
  return menu([
    'Select Subject:',
    '1. Mathematics',
    '2. Kiswahili',
    '3. Science & Tech',
    '4. English'
  ]);
}

function bandMenu(): USSDResponse {
  return menu([
    'Select Band:',
    '1. EE (Exceeding)',
    '2. ME (Meeting)',
    '3. AE (Approaching)',
    '4. BE (Below)'
  ]);
}

function gradeMenu(): USSDResponse {
  return menu([
    'Select Grade:',
    ...KICD_GRADES.map((grade, index) => `${index + 1}. Grade ${gradeNumber(grade)}`)
  ]);
}

function invalidChoice(): USSDResponse {
  return {
    responseType: 'END',
    message: 'END Chaguo si sahihi. Piga tena kuanza upya.'
  };
}

/**
 * Drives the USSD menu from the accumulated Africa's Talking `text` value.
 *
 * The session is stateless: the full path is replayed from `text` on every hop,
 * which is what the gateway sends and what keeps the handler safe to run on
 * serverless instances that do not share memory between requests.
 */
export function handleUSSDSession(payload: USSDPayload): USSDResponse {
  const raw = payload?.text ?? '';
  const parts = raw ? raw.split('*').filter((p) => p !== '') : [];

  if (parts.length === 0) {
    return mainMenu();
  }

  // Branch 1: subject band guidance drawn from the offline bank.
  if (parts[0] === '1') {
    if (parts.length === 1) {
      return subjectMenu();
    }

    const subject = SUBJECT_MENU[parts[1]];
    if (!subject) {
      return invalidChoice();
    }

    if (parts.length === 2) {
      return bandMenu();
    }

    const band = BAND_MENU[parts[2]];
    if (!band) {
      return invalidChoice();
    }

    const entry = OFFLINE_TRANSLATION_BANK[subject]?.[band];
    if (!entry) {
      return invalidChoice();
    }

    return page('END', `${subject} - ${band}`, entry.activity_sw);
  }

  // Branch 2: today's activity, read from the KICD curriculum set. The grade is
  // asked for first because a KICD activity is only meaningful against one.
  if (parts[0] === '2') {
    if (parts.length === 1) {
      return gradeMenu();
    }

    const grade = GRADE_MENU[parts[1]];
    if (!grade) {
      return invalidChoice();
    }

    const prompt = pickDailyKicdPrompt(grade);
    if (!prompt) {
      return invalidChoice();
    }

    return page(
      'END',
      `Grade ${gradeNumber(prompt.grade)} ${prompt.subject} Wk${prompt.week}`,
      prompt.activity_sw
    );
  }

  // Branch 3: language switch. The confirmation itself is shown in the target
  // language so the parent can tell immediately whether the switch worked.
  if (parts[0] === '3') {
    if (parts.length === 1) {
      return menu(['Chagua lugha / Choose language:', '1. Kiswahili', '2. English']);
    }

    if (parts[1] === '1') {
      return {
        responseType: 'END',
        message: 'END Lugha imebadilishwa kuwa Kiswahili. Asante kwa kutumia Mzazi Coach.'
      };
    }

    if (parts[1] === '2') {
      return {
        responseType: 'END',
        message: 'END Language set to English. Thank you for using Mzazi Coach.'
      };
    }

    return invalidChoice();
  }

  return {
    responseType: 'END',
    message: 'END Asante kwa kutumia Mzazi Coach.'
  };
}
