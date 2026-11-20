/**
 * One output shape per job. Every job shares the short answer (numbers only as
 * {{fact:id}} references), citations and proposals; jobs that make something
 * (a draft, a lesson, a meal reading) return it in `data`, checked here.
 *
 * Numbers inside `data` follow the job's rule:
 * - facts: only cited {{fact:id}} references (answers, explanations).
 * - grounded: references, or figures that appear in what you said or the file
 *   you shared, or a small count up to twelve ("2 parts"). Drafts need your
 *   dates and reference numbers; lessons need "three steps".
 */
import { BrainError, type Job, type Request, type Sensitivity } from './types.ts';
import { MEMORY_KINDS, type MemoryKind } from './memory.ts';
import { numbersIn, plainWords } from './proposals.ts';

export type DraftData = { kind: 'email' | 'letter' | 'message' | 'form'; subject?: string; to?: string; body: string };
export type LessonPuzzle = { type: 'true-false' | 'choose' | 'fill-gap' | 'order' | 'match'; prompt: string; options?: string[]; answer: string | string[] | boolean };
export type LessonBite = { text: string; picture?: 'flow' | 'compare' | 'cycle' | 'layers' | 'parts'; puzzle?: LessonPuzzle };
export type LessonData = { idea: string; bites: LessonBite[]; recap: string; explainBack: string };
export type AnalyseData = { understood: { part: string; quote: string }[]; gaps: string[] };
export type ShowMeData = { scene: Record<string, unknown> };
export type FoodItem = { name: string; portion?: string; grams?: number; confidence: number };
export type FoodData = { items: FoodItem[] };
export type ReadDocumentData = { document: { kind: 'payslip' | 'bill' | 'letter' | 'statement' | 'other'; from?: string; summary: string } };
/** Memory upkeep: what is worth remembering from what the person said. Each one quotes their words; `replaces`
 * names a memory in the request's context that this makes untrue. */
export type RememberItem = { text: string; kind: MemoryKind; quote: string; sensitivity?: Sensitivity; replaces?: string };
export type RememberData = { memories: RememberItem[] };
export type JobData = { ask: undefined; extract: undefined; coach: undefined; 'plan-explain': undefined; draft: DraftData; lesson: LessonData; analyse: AnalyseData; showMe: ShowMeData; food: FoodData; 'read-document': ReadDocumentData; remember: RememberData };

/** Only these jobs may propose changes to your records. */
export const PROPOSING_JOBS: readonly Job[] = ['ask', 'extract', 'read-document'];

const reject = (): never => { throw new BrainError('INVALID_OUTPUT', 'The answer did not match the required format. Nothing was changed.'); };
const check = (ok: unknown): void => { if (!ok) reject(); };
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const only = (v: Record<string, unknown>, allowed: string[], required: string[]) => check(Object.keys(v).every(k => allowed.includes(k)) && required.every(k => v[k] !== undefined));

/** Strips cited {{fact:id}} references; throws if one is unknown or uncited. */
export function stripFactRefs(value: string, request: Request, citations: readonly string[]): string {
  const facts = new Map(request.context.facts.map(f => [f.id, f]));
  return value.replace(/\{\{fact:([^}]+)\}\}/g, (_match, id: string) => {
    const fact = facts.get(id);
    if (!fact || !citations.includes(fact.source.id)) throw new BrainError('INVALID_OUTPUT', 'A number was not grounded in a cited fact.');
    return '';
  });
}
/** What a "grounded" number may come from: your words, ready files, the
 * conversation so far, and the engine facts supplied with the request. */
export const groundingText = (request: Request): string => [request.text, ...request.attachments.filter(a => a.status === 'ready').map(a => a.text ?? ''), ...request.history.map(m => m.text), ...request.context.facts.map(f => f.value)].join('\n');

function grounded(value: string, request: Request, citations: readonly string[], evidence: number[]): void {
  const rest = stripFactRefs(value, request, citations);
  check(!/\{\{/.test(rest));
  for (const m of rest.matchAll(/([£$€])?\s?(\d[\d,]*(?:\.\d+)?)(\s?%|k\b)?/g)) {
    const n = Number(m[2].replace(/,/g, '').replace(/\.$/, '')) * (m[3]?.trim() === 'k' ? 1000 : 1);
    const counting = !m[1] && !m[3] && Number.isInteger(n) && n <= 12;
    check(counting || evidence.some(x => Math.abs(x - n) < 0.005));
  }
}

/** Checks `data` for the job. Returns it, or throws. The one change it makes: a remembered detail that looks like
 * health is marked health. */
export function validateJobData(job: Job, data: unknown, request: Request, citations: readonly string[]): unknown {
  const evidence = numbersIn(groundingText(request));
  const g = (value: string) => grounded(value, request, citations, evidence);
  switch (job) {
    case 'ask': case 'extract': case 'coach': case 'plan-explain':
      check(data === undefined);
      return undefined;
    case 'draft': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['kind', 'subject', 'to', 'body'], ['kind', 'body']);
      check(['email', 'letter', 'message', 'form'].includes(d.kind as string) && text(d.body, 20000));
      if (d.subject !== undefined) check(text(d.subject, 300));
      if (d.to !== undefined) check(text(d.to, 300));
      for (const v of [d.subject, d.to, d.body]) if (typeof v === 'string') g(v);
      return data;
    }
    case 'lesson': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['idea', 'bites', 'recap', 'explainBack'], ['idea', 'bites', 'recap', 'explainBack']);
      check(text(d.idea, 400) && text(d.recap, 600) && text(d.explainBack, 400));
      check(Array.isArray(d.bites) && d.bites.length >= 2 && d.bites.length <= 3);
      const strings: string[] = [d.idea as string, d.recap as string, d.explainBack as string];
      for (const raw of d.bites as unknown[]) {
        check(isObject(raw)); const b = raw as Record<string, unknown>;
        only(b, ['text', 'picture', 'puzzle'], ['text']);
        check(text(b.text, 800)); strings.push(b.text as string);
        if (b.picture !== undefined) check(['flow', 'compare', 'cycle', 'layers', 'parts'].includes(b.picture as string));
        if (b.puzzle !== undefined) {
          check(isObject(b.puzzle)); const p = b.puzzle as Record<string, unknown>;
          only(p, ['type', 'prompt', 'options', 'answer'], ['type', 'prompt', 'answer']);
          check(['true-false', 'choose', 'fill-gap', 'order', 'match'].includes(p.type as string) && text(p.prompt, 400));
          if (p.options !== undefined) check(Array.isArray(p.options) && p.options.length <= 8 && p.options.every(o => text(o, 200)));
          check(typeof p.answer === 'boolean' || text(p.answer, 200) || (Array.isArray(p.answer) && p.answer.length <= 8 && p.answer.every(a => text(a, 200))));
          strings.push(p.prompt as string, ...((p.options as string[] | undefined) ?? []));
        }
      }
      strings.forEach(g);
      return data;
    }
    case 'analyse': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['understood', 'gaps'], ['understood', 'gaps']);
      check(Array.isArray(d.understood) && d.understood.length <= 8 && Array.isArray(d.gaps) && d.gaps.length <= 8);
      const said = plainWords(request.text);
      for (const raw of d.understood as unknown[]) {
        check(isObject(raw)); const u = raw as Record<string, unknown>;
        only(u, ['part', 'quote'], ['part', 'quote']);
        check(text(u.part, 120) && text(u.quote, 400) && said.includes(plainWords(u.quote as string)));
      }
      for (const gap of d.gaps as unknown[]) { check(text(gap, 300)); g(gap as string); }
      return data;
    }
    case 'showMe': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['scene'], ['scene']);
      check(isObject(d.scene) && JSON.stringify(d.scene).length <= 20000);
      return data;
    }
    case 'food': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['items'], ['items']);
      check(Array.isArray(d.items) && d.items.length >= 1 && d.items.length <= 20);
      for (const raw of d.items as unknown[]) {
        check(isObject(raw)); const i = raw as Record<string, unknown>;
        only(i, ['name', 'portion', 'grams', 'confidence'], ['name', 'confidence']);
        check(text(i.name, 80) && typeof i.confidence === 'number' && i.confidence >= 0 && i.confidence <= 1);
        if (i.portion !== undefined) check(text(i.portion, 80));
        if (i.grams !== undefined) check(typeof i.grams === 'number' && i.grams > 0 && i.grams <= 5000);
      }
      return data;
    }
    case 'remember': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['memories'], ['memories']);
      check(Array.isArray(d.memories) && d.memories.length <= 8);
      const said = plainWords([request.text, ...request.history.filter(m => m.role === 'user').map(m => m.text)].join('\n'));
      const known = new Set(request.context.memories.map(m => m.id));
      for (const raw of d.memories as unknown[]) {
        check(isObject(raw)); const m = raw as Record<string, unknown>;
        only(m, ['text', 'kind', 'quote', 'sensitivity', 'replaces'], ['text', 'kind', 'quote']);
        check(text(m.text, 200) && text(m.quote, 400) && MEMORY_KINDS.includes(m.kind as MemoryKind) && said.includes(plainWords(m.quote as string)));
        if (m.sensitivity !== undefined) check(['health', 'money', 'other'].includes(m.sensitivity as string));
        if (m.replaces !== undefined) check(typeof m.replaces === 'string' && known.has(m.replaces));
        // A memory's numbers come from the words it quotes, nowhere else.
        const quoted = numbersIn(m.quote as string);
        check(numbersIn(m.text as string).every(n => quoted.some(q => Math.abs(q - n) < 0.005)));
        // Health stays health even when the model forgets to say so, so it never leaves the phone by accident.
        if (looksHealth(`${m.text} ${m.quote}`)) m.sensitivity = 'health';
      }
      return data;
    }
    case 'read-document': {
      check(isObject(data)); const d = data as Record<string, unknown>;
      only(d, ['document'], ['document']);
      check(isObject(d.document)); const doc = d.document as Record<string, unknown>;
      only(doc, ['kind', 'from', 'summary'], ['kind', 'summary']);
      check(['payslip', 'bill', 'letter', 'statement', 'other'].includes(doc.kind as string) && text(doc.summary, 2000));
      if (doc.from !== undefined) check(text(doc.from, 120));
      g(doc.summary as string);
      return data;
    }
  }
}

const HEALTH = /\b(?:sleep|slept|insomnia|pain|ache|injur\w*|ill|illness|sick|period|pregnan\w*|fertility|medication|medicine|meds|pills?|prescri\w*|doctor|gp|hospital|therap\w*|anxi\w*|depress\w*|panic|diagnos\w*|blood|weight|diet\w*|calorie\w*|allerg\w*|asthma|diabet\w*|heart|mental health|mood|alcohol|drinking|smok\w*|vap\w*|iron|vitamin\w*)\b/i;
/** A cautious test for health details in a memory: when in doubt, it is health. */
export const looksHealth = (value: string) => HEALTH.test(value);

/** Fills {{fact:id}} references in every string inside job data. */
export function renderData(data: unknown, render: (value: string) => string): unknown {
  if (typeof data === 'string') return render(data);
  if (Array.isArray(data)) return data.map(item => renderData(item, render));
  if (isObject(data)) return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, renderData(v, render)]));
  return data;
}

/** The shape each job must return, for the model's instructions. */
export const JOB_SHAPES: Record<Job, string> = {
  ask: 'answer, optional detail, citations, proposals (record changes you heard stated, or []). No data.',
  extract: 'answer, citations, proposals (every record change stated in the words). No data.',
  coach: 'answer, optional detail, citations, proposals: []. Explain the engine\'s reasons; never new numbers. No data.',
  'plan-explain': 'answer, optional detail, citations, proposals: []. Explain why this move was picked from its reasons. No data.',
  draft: 'answer (one line), citations, proposals: [], data: { kind: email|letter|message|form, subject?, to?, body }. Use only dates and references the person gave.',
  lesson: 'answer, citations, proposals: [], data: { idea, bites: 2 or 3 of { text, picture?: flow|compare|cycle|layers|parts, puzzle?: { type: true-false|choose|fill-gap|order|match, prompt, options?, answer } }, recap, explainBack }.',
  analyse: 'answer, citations, proposals: [], data: { understood: [{ part, quote }] with quote copied exactly from what the person said, gaps: [] }.',
  showMe: 'answer, citations, proposals: [], data: { scene } for the drawing kit.',
  food: 'answer, citations, proposals: [], data: { items: [{ name, portion?, grams?, confidence 0 to 1 }] }. The person confirms every item.',
  'read-document': 'answer, citations, proposals quoted from the file, data: { document: { kind: payslip|bill|letter|statement|other, from?, summary } }.',
  remember: 'answer (one line), citations, proposals: [], data: { memories: up to 8 of { text: a short sentence about the person no record holds, kind: preference|goal|person|pattern|event|fact, quote: their exact words, sensitivity?: health|money|other, replaces?: id of a supplied memory this makes untrue } }. Only what they said about themselves, never a question, a maybe or someone else\'s private details.',
};
