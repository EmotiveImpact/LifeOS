import { describe, expect, test } from 'bun:test';
import { BrainError, runBrain, validateOutput, type Job, type ModelAdapter, type Request } from '../../packages/brain/src/index.ts';
import { request } from './fixtures.ts';

const ask = (job: Job, text = 'Please help', extra: Partial<Request> = {}): Request => ({ ...request(text), job, ...extra });
const base = { answer: 'Here it is.', citations: [] as string[], proposals: [] as unknown[] };

describe('one output shape per job', () => {
  test('draft: the body may use dates and references you gave, never invented figures', () => {
    const req = ask('draft', 'Write to the council about reference AB123456 and my payment on 12 March 2027.');
    const ok = { ...base, data: { kind: 'letter', subject: 'Reference AB123456', body: 'Dear Sir or Madam, I am writing about reference AB123456 and my payment on 12 March 2027.' } };
    expect(validateOutput(ok, req).data).toEqual(ok.data);
    expect(() => validateOutput({ ...base, data: { kind: 'letter', body: 'I paid £450 on 12 March 2027.' } }, req)).toThrow(BrainError);
    expect(() => validateOutput({ ...base, data: { kind: 'letter' } }, req)).toThrow(BrainError);
    expect(() => validateOutput({ ...base, data: { kind: 'poem', body: 'Hello' } }, req)).toThrow(BrainError);
  });
  test('draft: an engine figure goes in as a cited fact reference', () => {
    const req = ask('draft', 'Draft a note about my take-home pay.');
    expect(validateOutput({ answer: 'Draft ready.', citations: ['engine:income'], proposals: [], data: { kind: 'message', body: 'My take-home is {{fact:net}} a month.' } }, req).data).toBeTruthy();
    expect(() => validateOutput({ ...base, data: { kind: 'message', body: 'My take-home is {{fact:net}} a month.' } }, req)).toThrow(BrainError);
  });
  test('lesson: the Feynman shape with two or three bites', () => {
    const lesson = { idea: 'Your tax code tells payroll your tax-free amount.', bites: [{ text: 'The number is your allowance.', picture: 'parts', puzzle: { type: 'true-false', prompt: 'The letter sets the rules.', answer: true } }, { text: 'The letter tells payroll which rules apply.', picture: 'flow' }], recap: 'Number, then letter.', explainBack: 'Tell me what the number means.' };
    expect(validateOutput({ ...base, data: lesson }, ask('lesson', 'Teach me my tax code')).data).toEqual(lesson);
    expect(() => validateOutput({ ...base, data: { ...lesson, bites: [lesson.bites[0]] } }, ask('lesson'))).toThrow(BrainError);
    expect(() => validateOutput({ ...base, data: { ...lesson, bites: [...lesson.bites, ...lesson.bites] } }, ask('lesson'))).toThrow(BrainError);
    expect(() => validateOutput({ ...base, data: { ...lesson, recap: 'You will save £1,200 a year.' } }, ask('lesson'))).toThrow(BrainError);
    expect(validateOutput({ ...base, data: { ...lesson, recap: 'Remember these 2 parts.' } }, ask('lesson')).data).toBeTruthy();
  });
  test('analyse: what you explained well is quoted in your own words', () => {
    const said = 'The number is how much I can earn before tax.';
    expect(validateOutput({ ...base, data: { understood: [{ part: 'allowance', quote: 'how much I can earn before tax' }], gaps: ['what the letter does'] } }, ask('analyse', said)).data).toBeTruthy();
    expect(() => validateOutput({ ...base, data: { understood: [{ part: 'allowance', quote: 'the personal allowance is a threshold' }], gaps: [] } }, ask('analyse', said))).toThrow(BrainError);
  });
  test('food: each item carries a confidence for you to confirm', () => {
    const food = { items: [{ name: 'Salmon', portion: 'one fillet', grams: 140, confidence: 0.8 }, { name: 'Rice', confidence: 0.6 }] };
    expect(validateOutput({ ...base, data: food }, ask('food', 'What is in this meal?')).data).toEqual(food);
    expect(() => validateOutput({ ...base, data: { items: [{ name: 'Salmon' }] } }, ask('food'))).toThrow(BrainError);
    expect(() => validateOutput({ ...base, data: { items: [{ name: 'Salmon', confidence: 1.4 }] } }, ask('food'))).toThrow(BrainError);
  });
  test('showMe: a scene object for the drawing kit', () => {
    expect(validateOutput({ ...base, data: { scene: { kind: 'flow', steps: ['a', 'b'] } } }, ask('showMe')).data).toBeTruthy();
    expect(() => validateOutput({ ...base, data: { scene: 'draw a box' } }, ask('showMe'))).toThrow(BrainError);
  });
  test('read-document: a summary plus proposals quoted from the file', () => {
    const letter = 'Council Tax bill 2027/28. Amount due: £142 per month from 1 April. Pay by Direct Debit on the 1st.';
    const req = ask('read-document', 'Read this letter', { attachments: [{ id: 'a', name: 'Extracted text', mime: 'text/plain', uri: '', size: letter.length, text: letter, status: 'ready' }] });
    const proposal = { id: 'bill-council-tax', field: 'bill', area: 'money', label: 'Council tax £142 a month', quote: 'Amount due: £142 per month', value: 142, details: { kind: 'bill', payee: 'Council tax', amount: 142, frequency: 'monthly' } };
    // "Council tax" is not in the quoted words, so this one is refused; the next names the payee in its quote.
    expect(() => validateOutput({ ...base, proposals: [proposal], data: { document: { kind: 'bill', from: 'Council', summary: 'Your council tax for the year.' } } }, req)).toThrow(BrainError);
    const quoted = { ...proposal, quote: 'Council Tax bill 2027/28. Amount due: £142 per month', label: 'Council tax £142 a month' };
    expect(validateOutput({ ...base, proposals: [quoted], data: { document: { kind: 'bill', from: 'Council', summary: 'Your council tax for the year: £142 a month.' } } }, req).proposals).toHaveLength(1);
  });
  test('ask, extract, coach and plan-explain carry no extra data', () => {
    for (const job of ['ask', 'extract', 'coach', 'plan-explain'] as const) expect(() => validateOutput({ ...base, data: { anything: true } }, ask(job))).toThrow(BrainError);
  });
  test('runBrain fills fact references inside job data too', async () => {
    const model: ModelAdapter = { id: 'draft-model', location: 'device', jobs: ['draft'], available: async () => true, generate: async () => ({ answer: 'Draft ready.', citations: ['engine:income'], proposals: [], data: { kind: 'message', body: 'My take-home is {{fact:net}}.' } }) };
    const result = await runBrain(ask('draft', 'Draft a note about my pay'), [model]);
    expect((result.data as { body: string }).body).toBe('My take-home is £2,400.');
  });
});
