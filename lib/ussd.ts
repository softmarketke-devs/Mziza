import { CBCBand } from './types';
import { OFFLINE_TRANSLATION_BANK } from './offline-bank';

export interface USSDResponse {
  responseType: 'CON' | 'END';
  message: string;
}

export interface USSDPayload {
  sessionId: string;
  phoneNumber: string;
  text: string;
}

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
 * Daily KICD activity served over USSD. Kept short because a USSD page is
 * capped at roughly 160 characters on most Kenyan networks.
 */
const DAILY_KICD_ACTIVITY =
  'Leo: Jaribu kutenganisha mchanga na maji kwa kutumia kitambaa safi cha nyumbani. Muulize mtoto aeleze kilichotokea.';

function mainMenu(): USSDResponse {
  return {
    responseType: 'CON',
    message: `CON Karibu Mzazi Coach (CBC Assistant)
1. Check Subject Band Guide
2. Get Today's KICD Activity
3. Switch Language (Kiswahili/English)`
  };
}

function subjectMenu(): USSDResponse {
  return {
    responseType: 'CON',
    message: `CON Select Subject:
1. Mathematics
2. Kiswahili
3. Science & Tech
4. English`
  };
}

function bandMenu(): USSDResponse {
  return {
    responseType: 'CON',
    message: `CON Select Band:
1. EE (Exceeding)
2. ME (Meeting)
3. AE (Approaching)
4. BE (Below)`
  };
}

function invalidChoice(): USSDResponse {
  return {
    responseType: 'END',
    message: 'END Chaguo si sahihi. Piga tena kuanza upya.'
  };
}

/** Trims guidance to one USSD page without cutting a word in half. */
function truncateForUssd(text: string, limit = 155): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
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

    return {
      responseType: 'END',
      message: `END ${subject} - ${band}
${truncateForUssd(entry.activity_sw)}`
    };
  }

  // Branch 2: today's KICD home-learning activity.
  if (parts[0] === '2') {
    return {
      responseType: 'END',
      message: `END [KICD Activity Grade 5]
${DAILY_KICD_ACTIVITY}`
    };
  }

  // Branch 3: language switch. The confirmation itself is shown in the target
  // language so the parent can tell immediately whether the switch worked.
  if (parts[0] === '3') {
    if (parts.length === 1) {
      return {
        responseType: 'CON',
        message: `CON Chagua lugha / Choose language:
1. Kiswahili
2. English`
      };
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
