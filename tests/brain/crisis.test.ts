import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { analyseTeachBack, detectCrisis, runBrain, screenWords, settledTranscript, supportResponse, type CrisisKind, type ModelAdapter } from '../../packages/brain/src/index.ts';
import { request } from './fixtures.ts';

type Case = { text: string; expect: 'urgent' | 'concern' | 'none'; kinds?: CrisisKind[]; channel?: 'typed' | 'voice' | 'tellback'; note?: string };
const cases: Case[] = readFileSync(new URL('../../tools/evals/crisis/cases.jsonl', import.meta.url), 'utf8').split('\n').filter(line => line.trim()).map(line => JSON.parse(line));

describe('crisis-language check: the case set', () => {
  test('the set is big enough to mean something and covers each kind and channel', () => {
    expect(cases.filter(c => c.expect !== 'none').length).toBeGreaterThanOrEqual(80);
    expect(cases.filter(c => c.expect === 'none').length).toBeGreaterThanOrEqual(40);
    for (const kind of ['suicide', 'self-harm', 'overdose', 'someone-else', 'unsafe'] as const) expect(cases.some(c => c.kinds?.includes(kind))).toBe(true);
    for (const channel of ['voice', 'tellback'] as const) expect(cases.some(c => c.channel === channel)).toBe(true);
  });
  for (const c of cases) {
    test(`${c.expect === 'none' ? 'leaves alone' : `flags ${c.expect}`}: ${c.text}`, () => {
      const signal = detectCrisis(c.text);
      if (c.expect === 'none') { expect(signal).toBeNull(); return; }
      expect(signal).not.toBeNull();
      expect(signal!.level).toBe(c.expect);
      for (const kind of c.kinds ?? []) expect(signal!.kinds).toContain(kind);
    });
  }
});

describe('crisis-language check: what happens next', () => {
  const adapter = (calls: { n: number }): ModelAdapter => ({ id: 'model', location: 'device', jobs: ['ask', 'extract', 'draft', 'lesson', 'analyse'], available: async () => { calls.n++; return true; }, generate: async () => { calls.n++; return { answer: 'Model reply', citations: [], proposals: [] }; } });

  test('every flagged case is answered by the fixed support reply, never a model', async () => {
    const calls = { n: 0 };
    for (const c of cases.filter(x => x.expect !== 'none')) {
      const result = await runBrain({ ...request(c.text), consent: { requestId: 'request-a', locations: ['cloud'] } }, [adapter(calls)]);
      expect(result.route.location).toBe('rules');
      expect(result.route.model).toBe('life-safety');
      expect(result.proposals).toEqual([]);
      expect(result.safety?.route).toBe('/states/support');
      expect(result.answer).toContain('999');
    }
    expect(calls.n).toBe(0);
  });
  test('the support reply for your own distress names Samaritans and 999', () => {
    const concern = supportResponse(detectCrisis('I want to die')!);
    expect(concern.answer).toContain('116 123');
    expect(concern.answer).toContain('999');
    expect(concern.lines.map(line => line.id)).toEqual(['samaritans', 'shout', 'nhs111', 'emergency']);
  });
  test('an urgent reply leads with 999', () => {
    const urgent = supportResponse(detectCrisis('I took all my pills')!);
    expect(urgent.answer.indexOf('999')).toBeLessThan(urgent.answer.indexOf('116 123') < 0 ? Infinity : urgent.answer.indexOf('116 123'));
    expect(urgent.lines[0].id).toBe('emergency');
  });
  test('worry about someone else gets wording about them, not you', () => {
    const other = supportResponse(detectCrisis('My friend says she wants to kill herself')!);
    expect(other.answer).toMatch(/\bthey\b|\bthem\b/);
    expect(other.answer).toContain('116 123');
  });
  test('feeling unsafe at home names the domestic abuse helpline and the silent 999 option', () => {
    const unsafe = supportResponse(detectCrisis('My partner hits me')!);
    expect(unsafe.answer).toContain('0808 2000 247');
    expect(unsafe.detail).toContain('55');
    expect(unsafe.lines.map(line => line.id)).toContain('domestic-abuse');
  });
  test('support lines carry ready-made phone and text links', () => {
    const lines = supportResponse(detectCrisis('I want to die')!).lines;
    expect(lines.find(line => line.id === 'samaritans')?.href).toBe('tel:116123');
    expect(lines.find(line => line.id === 'shout')?.href).toBe('sms:85258?body=SHOUT');
  });
  test('a crisis message is answered even when it is too long for a normal request', async () => {
    const result = await runBrain(request(`${'Work notes. '.repeat(1200)}I want to die.`));
    expect(result.safety?.level).toBe('concern');
  });
  test('the check runs in every job, filing included, and files nothing', async () => {
    for (const job of ['extract', 'draft', 'lesson', 'analyse'] as const) {
      const result = await runBrain({ ...request("I'm 31 and I want to kill myself"), job });
      expect(result.safety).toBeDefined();
      expect(result.proposals).toEqual([]);
    }
  });
  test('a spoken transcript goes through the same check', async () => {
    const transcript = settledTranscript('um i just', 'um i just dont want to be here anymore');
    expect((await runBrain(request(transcript))).safety?.route).toBe('/states/support');
  });
  test('Talk filing returns support and no proposals', () => {
    const words = screenWords("My rent is £950 a month. I can't go on like this.");
    expect(words.crisis?.level).toBe('concern');
    expect(words.proposals).toEqual([]);
    expect(screenWords('My rent is £950 a month.').proposals.map(p => p.field)).toEqual(['rent']);
  });
  test('a lesson tell-back with distress returns support alongside the rules feedback', () => {
    expect(analyseTeachBack('The number is the tax-free allowance. I want to die.').support?.route).toBe('/states/support');
    expect(analyseTeachBack('The number is the tax-free allowance.').support).toBeUndefined();
  });
  test('the check stays fast on long, awkward input', () => {
    const awkward = ['a '.repeat(6000), "can't ".repeat(1500), 'i '.repeat(6000), 'k*'.repeat(6000)];
    const start = performance.now();
    for (const text of awkward) detectCrisis(text);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
