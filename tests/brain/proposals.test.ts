import { describe, expect, test } from 'bun:test';
import { BrainError, extractStatements, validateOutput, validateProposal, type Proposal } from '../../packages/brain/src/index.ts';
import { request } from './fixtures.ts';

const one = (text: string, field: Proposal['field']) => extractStatements(text).find(p => p.field === field);

describe('rules filing: the kinds Talk could not file before', () => {
  test('a birthday', () => {
    const p = one("Kofi's birthday is 3 March", 'date')!;
    expect(p.details).toEqual({ kind: 'date', person: 'Kofi', occasion: 'birthday', when: { month: 3, day: 3 } });
    expect(p.area).toBe('you');
    expect(p.label).toBe('Kofi’s birthday, 3 March');
  });
  test('a birthday written other ways', () => {
    expect(one("My mum's birthday is on the 21st of June", 'date')?.details).toEqual({ kind: 'date', person: 'Mum', occasion: 'birthday', when: { month: 6, day: 21 } });
    expect(one("It's Efua's birthday on March 3rd", 'date')?.details).toMatchObject({ person: 'Efua', when: { month: 3, day: 3 } });
    expect(one('Our anniversary is 12 June', 'date')?.details).toMatchObject({ person: 'Us', occasion: 'anniversary', when: { month: 6, day: 12 } });
  });
  test('a bill with an amount, how often and a due day', () => {
    const p = one('My council tax is £142 a month, due on the 1st.', 'bill')!;
    expect(p.details).toEqual({ kind: 'bill', payee: 'Council tax', amount: 142, frequency: 'monthly', dueDay: 1 });
    expect(p.value).toBe(142);
    expect(p.area).toBe('money');
    expect(p.label).toBe('Council tax £142 a month');
  });
  test('a bill said the other way round', () => {
    expect(one('I pay £45 a month for broadband', 'bill')?.details).toEqual({ kind: 'bill', payee: 'Broadband', amount: 45, frequency: 'monthly' });
    expect(one('My phone bill is £20.50 a month', 'bill')?.details).toMatchObject({ payee: 'Phone bill', amount: 20.5 });
  });
  test('a subscription', () => {
    expect(one('Netflix is £10.99 a month', 'subscription')?.details).toEqual({ kind: 'subscription', service: 'Netflix', amount: 10.99, frequency: 'monthly' });
    expect(one('I pay £11.99 a month for Spotify', 'subscription')?.details).toMatchObject({ service: 'Spotify', amount: 11.99 });
  });
  test('a document expiry or renewal', () => {
    const passport = one('My passport expires in August 2027', 'document')!;
    expect(passport.details).toEqual({ kind: 'document', document: 'passport', event: 'expires', when: { month: 8, year: 2027 } });
    expect(passport.label).toBe('Passport expires August 2027');
    expect(one('My MOT is due on 4 May', 'document')?.details).toEqual({ kind: 'document', document: 'mot', event: 'due', when: { month: 5, day: 4 } });
    expect(one('Car insurance renews on 1 March 2027', 'document')?.details).toMatchObject({ document: 'car-insurance', event: 'renews', when: { day: 1, month: 3, year: 2027 } });
  });
  test('an appointment with a date and time', () => {
    const p = one('I have a dentist appointment on 4 December at 3pm', 'appointment')!;
    expect(p.details).toEqual({ kind: 'appointment', what: 'Dentist', when: { month: 12, day: 4, time: '15:00' } });
    expect(p.area).toBe('health');
  });
  test('a person and how they relate to you', () => {
    expect(one('My sister is called Efua', 'person')?.details).toEqual({ kind: 'person', name: 'Efua', relation: 'sister' });
    expect(one("My best friend's name is Kwame", 'person')?.details).toEqual({ kind: 'person', name: 'Kwame', relation: 'best friend' });
  });
  test('questions and hypotheticals still file nothing', () => {
    expect(extractStatements("Is Kofi's birthday 3 March? If my council tax is £142 a month I will move.")).toEqual([]);
  });
  test('the existing eight kinds are unchanged', () => {
    expect(extractStatements("I'm 31. I live with two flatmates. I'm self-employed. My annual income is £60,000 per year.").map(p => [p.field, p.value])).toEqual([['age', 31], ['household', 3], ['work', 'sole-trader'], ['income', 60000]]);
  });
  test('every rules proposal passes the schema against its own words', () => {
    const text = "Kofi's birthday is 3 March. My council tax is £142 a month, due on the 1st. Netflix is £10.99 a month. My passport expires in August 2027. I have a dentist appointment on 4 December at 3pm. My sister is called Efua. I'm 31. My rent is £950 a month. Remember that Kofi likes cooking.";
    const proposals = extractStatements(text);
    expect(proposals.length).toBe(9);
    for (const p of proposals) expect(() => validateProposal(p, text)).not.toThrow();
  });
});

describe('model proposals: checked against what you said, not against the patterns', () => {
  const said = 'Kofi turns thirty on the third of March, and the water bill is £38 every month.';
  const birthday: Proposal = { id: 'date-kofi', field: 'date', area: 'you', label: 'Kofi’s birthday, 3 March', quote: 'Kofi turns thirty on the third of March', value: '03-03', details: { kind: 'date', person: 'Kofi', occasion: 'birthday', when: { month: 3, day: 3 } } };
  const water: Proposal = { id: 'bill-water', field: 'bill', area: 'money', label: 'Water £38 a month', quote: 'the water bill is £38 every month', value: 38, details: { kind: 'bill', payee: 'Water', amount: 38, frequency: 'monthly' } };

  test('a well-grounded proposal the patterns missed is accepted', () => {
    expect(validateProposal(birthday, said)).toEqual(birthday);
    expect(validateProposal(water, said)).toEqual(water);
  });
  test('the output check accepts them for ask and extract', () => {
    const out = validateOutput({ answer: 'Review these before filing.', citations: [], proposals: [birthday, water] }, { ...request(said), job: 'extract' });
    expect(out.proposals).toHaveLength(2);
  });
  test('the quote must be your words, whatever the quote marks or spacing', () => {
    expect(() => validateProposal({ ...birthday, quote: 'Kofi turns thirty on the fourth of March' }, said)).toThrow(BrainError);
    expect(validateProposal({ ...water, quote: 'The  water bill is £38 every month' }, 'The water bill is £38 every month')).toBeTruthy();
    expect(validateProposal({ ...birthday, quote: 'Kofi’s birthday is 3 March', label: 'Kofi’s birthday, 3 March' }, "Kofi's birthday is 3 March")).toBeTruthy();
  });
  test('every number must appear in the quote', () => {
    expect(() => validateProposal({ ...water, value: 83, details: { kind: 'bill', payee: 'Water', amount: 83, frequency: 'monthly' } }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...birthday, details: { kind: 'date', person: 'Kofi', occasion: 'birthday', when: { month: 3, day: 4 } } }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...water, label: 'Water £83 a month' }, said)).toThrow(BrainError);
  });
  test('names, months and how often must appear in the quote', () => {
    expect(() => validateProposal({ ...birthday, details: { kind: 'date', person: 'Kwame', occasion: 'birthday', when: { month: 3, day: 3 } } }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...birthday, details: { kind: 'date', person: 'Kofi', occasion: 'birthday', when: { month: 4, day: 3 } } }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...water, details: { kind: 'bill', payee: 'Water', amount: 38, frequency: 'yearly' } }, said)).toThrow(BrainError);
  });
  test('a malformed or unknown shape is rejected', () => {
    expect(() => validateProposal({ ...water, field: 'loan' }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...water, area: 'health' }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...water, extra: true }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...water, details: { kind: 'subscription', service: 'Water', amount: 38 } }, said)).toThrow(BrainError);
    expect(() => validateProposal({ ...water, id: 'has spaces' }, said)).toThrow(BrainError);
  });
  test('a question or hypothetical is never a fact', () => {
    const asked = 'Is the water bill £38 every month?';
    expect(() => validateProposal({ ...water, quote: asked }, asked)).toThrow(BrainError);
    const maybe = 'If the water bill is £38 every month I will switch.';
    expect(() => validateProposal({ ...water, quote: maybe }, maybe)).toThrow(BrainError);
  });
  test('profile fields keep their old limits', () => {
    const young = "I'm 12.";
    expect(() => validateProposal({ id: 'profile-age', field: 'age', area: 'you', label: 'Age 12', quote: young, value: 12 }, young)).toThrow(BrainError);
    const earn = 'I earn £5,000 a month.';
    expect(validateProposal({ id: 'profile-income', field: 'income', area: 'money', label: 'Annual income', quote: earn, value: 60000 }, earn).value).toBe(60000);
  });
  test('jobs that only explain cannot propose changes', () => {
    for (const job of ['coach', 'plan-explain'] as const) expect(() => validateOutput({ answer: 'Here is why.', citations: [], proposals: [water] }, { ...request(said), job })).toThrow(BrainError);
  });
});
