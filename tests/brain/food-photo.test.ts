import { describe, expect, test } from 'bun:test';
import { BrainError, assertRequest, modelPayload, prepareExternalRequest, validateOutput, type Attachment, type Job, type Request } from '../../packages/brain/src/index.ts';
import { request } from './fixtures.ts';

/** Phase 27: the food job reads the photo itself, a plate or a nutrition label, and its figures must add up. */
const ask = (job: Job, extra: Partial<Request> = {}): Request => ({ ...request('What is on my plate?'), job, ...extra });
const base = { answer: 'Check these and adjust the amounts.', citations: [] as string[], proposals: [] as unknown[] };
const photo = (extra: Partial<Attachment> = {}): Attachment => ({ id: 'p1', name: 'IMG_2041.jpg', mime: 'image/jpeg', uri: 'file:///var/mobile/Containers/IMG_2041.jpg', size: 1200, data: 'AAAA/w==', status: 'needs-reader', ...extra });
const salmon = { name: 'Salmon', portion: 'one fillet', grams: 120, confidence: 0.9, per100g: { kcal: 206, protein: 22, carbs: 0, fat: 13, fibre: 0 } };

describe('a plate', () => {
  test('items may carry typical figures per 100 g, and the energy must add up', () => {
    const ok = { ...base, data: { items: [salmon] } };
    expect(validateOutput(ok, ask('food')).data).toEqual(ok.data);
    const made = (per100g: Record<string, unknown>) => ({ ...base, data: { items: [{ ...salmon, per100g }] } });
    expect(() => validateOutput(made({ kcal: 100, protein: 50, carbs: 50, fat: 50 }), ask('food'))).toThrow(BrainError);
    expect(() => validateOutput(made({ kcal: 1200, protein: 0, carbs: 0, fat: 100 }), ask('food'))).toThrow(BrainError);
    expect(() => validateOutput(made({ kcal: 206, protein: 22, carbs: 0 }), ask('food'))).toThrow(BrainError);
    expect(() => validateOutput(made({ kcal: 206, protein: 22, carbs: 0, fat: 13, sugars: 4 }), ask('food'))).toThrow(BrainError);
    expect(() => validateOutput(made({ kcal: 206, protein: 22, carbs: 0, fat: 13, sodium: 1 }), ask('food'))).toThrow(BrainError);
  });
});

describe('a nutrition label', () => {
  const granola = { name: 'Granola', basis: 'g', per100: { kcal: 412, protein: 11, carbs: 52, fat: 16, fibre: 4, sugars: 21, saturatedFat: 3.1, salt: 0.4 }, servingAmount: 45 };
  test('the figures as printed, per 100 g or ml', () => {
    expect(validateOutput({ ...base, data: { label: granola } }, ask('food')).data).toEqual({ label: granola });
    expect(() => validateOutput({ ...base, data: { label: { ...granola, basis: 'cup' } } }, ask('food'))).toThrow(BrainError);
    expect(() => validateOutput({ ...base, data: { label: { ...granola, per100: { ...granola.per100, saturatedFat: 30 } } } }, ask('food'))).toThrow(BrainError);
  });
  test('neither a plate nor a label is no answer', () => {
    expect(() => validateOutput({ ...base, data: {} }, ask('food'))).toThrow(BrainError);
  });
  test('numbers stay out of the answer line', () => {
    expect(() => validateOutput({ ...base, answer: 'About 412 kcal per 100 g.', data: { label: granola } }, ask('food'))).toThrow(BrainError);
  });
});

describe('the photo leaving the phone', () => {
  test('only the photo goes, for a photo job, without its name or where it lives on the phone', () => {
    const sent = prepareExternalRequest(ask('food', { attachments: [photo()] }));
    expect(sent.attachments).toEqual([{ id: 'p1', name: 'Photo', mime: 'image/jpeg', uri: '', size: 8, data: 'AAAA/w==', status: 'ready' }]);
    expect(prepareExternalRequest(ask('ask', { attachments: [photo()] })).attachments).toEqual([]);
  });
  test('the model reads the photo, not a copy of it inside the words', () => {
    const payload = modelPayload(prepareExternalRequest(ask('food', { attachments: [photo()] })));
    expect(JSON.stringify(payload)).not.toContain('AAAA/w==');
  });
  test('one small photo, for a photo job only', () => {
    expect(() => assertRequest(ask('food', { attachments: [photo()] }))).not.toThrow();
    expect(() => assertRequest(ask('ask', { attachments: [photo()] }))).toThrow(BrainError);
    expect(() => assertRequest(ask('food', { attachments: [photo(), photo({ id: 'p2' })] }))).toThrow(BrainError);
    expect(() => assertRequest(ask('food', { attachments: [photo({ mime: 'image/heic' })] }))).toThrow(BrainError);
    expect(() => assertRequest(ask('food', { attachments: [photo({ data: 'not base64!' })] }))).toThrow(BrainError);
    expect(() => assertRequest(ask('food', { attachments: [photo({ data: 'A'.repeat(2_800_004) })] }))).toThrow(BrainError);
  });
});
