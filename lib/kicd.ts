import { KICDPrompt } from './types';
import kicdPromptsRaw from './kicd-prompts.json';

/**
 * The KICD curriculum prompt set, loaded once and shared by every surface.
 *
 * Both the web processor and the USSD handler read from here so a parent on a
 * feature phone and a parent on a smartphone are told to do the same activity
 * on the same day. Nothing about the curriculum should be duplicated per
 * channel.
 */
export const KICD_PROMPTS = kicdPromptsRaw as KICDPrompt[];

export type Grade = KICDPrompt['grade'];

/** Grades in curriculum order, restricted to those the dataset actually covers. */
export const KICD_GRADES: Grade[] = (
  ['grade_4', 'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9'] as Grade[]
).filter((grade) => KICD_PROMPTS.some((prompt) => prompt.grade === grade));

export interface KicdQuery {
  grade?: string;
  subject?: string;
  week?: number;
}

/**
 * Picks the closest KICD prompt to the query. Scoring beats filtering here:
 * a parent asking for grade 5 week 9 should still get the grade 5 material
 * rather than an empty result.
 *
 * A query that matches nothing at all returns undefined rather than an
 * arbitrary first row, so callers never present unrelated curriculum material
 * as though it were the answer to the question asked.
 */
export function resolveKicdPrompt(query: KicdQuery): KICDPrompt | undefined {
  if (KICD_PROMPTS.length === 0) return undefined;

  const hasCriteria =
    Boolean(query.grade) || Boolean(query.subject) || typeof query.week === 'number';
  if (!hasCriteria) return undefined;

  const scored = KICD_PROMPTS.map((prompt) => {
    let score = 0;
    if (query.grade && prompt.grade === query.grade) score += 4;
    if (query.subject && prompt.subject === query.subject) score += 2;
    if (typeof query.week === 'number' && prompt.week === query.week) score += 1;
    return { prompt, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].prompt : undefined;
}

/**
 * East Africa Time, fixed at UTC+3 with no daylight saving.
 *
 * The day is counted in Nairobi time rather than the server's local time so a
 * serverless instance in Frankfurt and one in Cape Town roll over to tomorrow's
 * activity at the same moment the parent's day does.
 */
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Whole days since the epoch, counted in East Africa Time. */
function dayIndex(date: Date): number {
  return Math.floor((date.getTime() + EAT_OFFSET_MS) / 86_400_000);
}

/**
 * The KICD activity for a grade on a given day.
 *
 * Selection is deterministic: every parent dialling for the same grade on the
 * same day is given the same activity, and it advances at midnight. That makes
 * the USSD reply reproducible and lets a teacher predict what was sent home,
 * which a random pick would not.
 */
export function pickDailyKicdPrompt(
  grade: string,
  date: Date = new Date()
): KICDPrompt | undefined {
  const matches = KICD_PROMPTS.filter((prompt) => prompt.grade === grade);
  if (matches.length === 0) return undefined;

  return matches[dayIndex(date) % matches.length];
}
