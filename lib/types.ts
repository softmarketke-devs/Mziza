// CBC Performance Bands
export type CBCBand = 'BE' | 'AE' | 'ME' | 'EE'; // Below, Approaching, Meeting, Exceeding Expectation

export interface SubjectBand {
  subject: string;
  band: CBCBand;
  confidence: number; // 0.0 - 1.0
  raw_match?: string;
}

export interface TranslationResult {
  subject: string;
  band: CBCBand;
  band_name_sw: string; // e.g. "Kufikia Matarajio"
  band_name_en: string; // e.g. "Meeting Expectation"
  explanation_sw: string; // Plain Kiswahili explanation for parents
  explanation_en: string; // Plain English explanation
  activity_sw: string;    // Practical home learning activity in Swahili
  activity_en: string;    // Practical home learning activity in English
  diy_materials: string[];// Local low-cost materials (e.g., bottle caps, sticks)
}

export interface KICDPrompt {
  id: string;
  grade: 'grade_4' | 'grade_5' | 'grade_6' | 'grade_7' | 'grade_8' | 'grade_9';
  term: 1 | 2 | 3;
  week: number;
  subject: string;
  strand: string;
  sub_strand: string;
  slo: string; // Specific Learning Outcome
  prompt_sw: string;
  prompt_en: string;
  activity_sw: string;
  activity_en: string;
  diy_materials: string[];
}

export interface USSDSessionState {
  sessionId: string;
  phoneNumber: string;
  text: string; // Accumulated USSD string e.g. "1*2*1"
  currentStep: 'MAIN_MENU' | 'SELECT_GRADE' | 'SELECT_SUBJECT' | 'VIEW_EXPLANATION' | 'DAILY_PROMPT';
  grade?: string;
  subject?: string;
}

export type InputMode = 'image' | 'text' | 'kicd' | 'ussd';

export interface ProcessorInput {
  mode: InputMode;
  imageDataUrl?: string; // Data URL for OCR
  rawText?: string;       // Direct report text input
  kicdQuery?: {
    grade: string;
    subject?: string;
    week?: number;
  };
  ussdPayload?: {
    sessionId: string;
    phoneNumber: string;
    text: string;
  };
  language?: 'sw' | 'en';
}

export interface ProcessorResult {
  success: boolean;
  mode: InputMode;
  detectedBands: SubjectBand[];
  translations: TranslationResult[];
  kicdPrompt?: KICDPrompt;
  ussdResponse?: {
    responseType: 'CON' | 'END';
    message: string;
  };
  speechData?: {
    textToSpeak: string;
    language: 'sw-KE' | 'en-US';
  };
  source: 'online_claude' | 'offline_cache';
  executionTimeMs: number;
  error?: string;
}
