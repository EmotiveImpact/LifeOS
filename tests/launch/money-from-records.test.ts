import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractStatements, validateProposal } from '../../packages/brain/src/index.ts';
import { proposalRecord } from '../../apps/mobile/src/services/brainState.ts';
import { daysToDay, knownMoney } from '../../apps/mobile/src/state/moneyKnown.ts';
import type { FiledRecord } from '../../apps/mobile/src/state/seed.ts';

/**
 * Fix F-37: a real account's Money is built from what the person tells Life (pay, pay day, rent, bills and
 * subscriptions), so the Money pages stop showing day one once Life knows something, and nothing is guessed.
 */
const told = (text: string): FiledRecord[] => extractStatements(text).map(p => ({ ...proposalRecord(p, 'talk', '2026-11-21T08:00:00Z'), status: 'confirmed' as const }));
const pay = (text: string) => extractStatements(text).find(p => p.field === 'payday');

describe('Talk files a pay day', () => {
  test('a day of the month, said several ways', () => {
    for (const [text, day] of [['I get paid on the 28th.', 28], ["I'm paid monthly on the 25th", 25], ['My pay day is the first of the month.', 1], ['Payday is the twenty-eighth.', 28], ['My salary lands on the 15th of each month.', 15]] as const) {
      const p = pay(text);
      expect(p?.value).toBe(day);
      expect(p?.area).toBe('money');
      expect(validateProposal(p, text)).toEqual(p!);
    }
    expect(pay('I get paid on the 28th.')?.label).toBe('Paid on the 28th');
  });

  test('a weekday, a one-off date, a question or a maybe files nothing', () => {
    for (const text of ['I get paid on Fridays.', 'I get paid every two weeks.', 'I get paid on the 25th of November.', 'Do I get paid on the 28th?', 'If I got paid on the 1st that would help.']) expect(pay(text)).toBeUndefined();
  });

  test('a model can only propose a day that was said, next to pay', () => {
    const base = { id: 'profile-payday', field: 'payday', area: 'money', label: 'Paid on the 28th', quote: 'I get paid on the 28th', value: 28 };
    expect(() => validateProposal(base, 'I get paid on the 28th')).not.toThrow();
    expect(() => validateProposal({ ...base, value: 27 }, 'I get paid on the 28th')).toThrow();
    expect(() => validateProposal({ ...base, quote: 'The party is on the 28th', label: 'Paid on the 28th' }, 'The party is on the 28th')).toThrow();
    expect(() => validateProposal({ ...base, value: 32, label: 'Paid', quote: 'I get paid on the 32nd' }, 'I get paid on the 32nd')).toThrow();
  });

  test('confirming it sets the pay day on the profile', () => {
    const [record] = told('I get paid on the 28th.');
    expect(record.id).toBe('payday');
    expect(record.profilePatch).toEqual({ payDay: 28 });
  });

  test('bills and subscriptions keep who, how much, how often and the due day', () => {
    const [bill] = told('My council tax is £142 a month, due on the 1st.');
    expect(bill.details).toEqual({ kind: 'bill', payee: 'Council tax', amount: 142, frequency: 'monthly', dueDay: 1 });
    const [sub] = told('Netflix costs £10.99 a month.');
    expect(sub.details).toEqual({ kind: 'subscription', service: 'Netflix', amount: 10.99, frequency: 'monthly' });
  });
});

describe('Money from what you told Life', () => {
  const life = [
    ...told('I earn £30,000 a year.'), ...told('I get paid on the 28th.'), ...told('My rent is £1,150 a month.'),
    ...told('My council tax is £142 a month, due on the 1st.'), ...told('I pay £45 a month for broadband.'), ...told('My TV licence is £174.50 a year.'),
    ...told('Netflix costs £10.99 a month.'),
  ];

  test('the month adds up from rent, bills and subscriptions', () => {
    const k = knownMoney({ records: life, payDay: 28, takeHomeMonthly: 2093.3, today: '2026-11-21' });
    expect(k.any).toBe(true);
    expect(k.income).toBe(30000);
    expect(k.takeHome).toBe(2093.3);
    expect(k.rent?.monthly).toBe(1150);
    expect(k.bills.map(b => [b.name, b.monthly])).toEqual([['Council tax', 142], ['Broadband', 45], ['TV licence', 14.54]]);
    expect(k.subscriptions.map(s => [s.name, s.monthly])).toEqual([['Netflix', 10.99]]);
    expect(k.out).toBe(1362.53);
    expect(k.left).toBe(730.77);
  });

  test('what comes up next, soonest first', () => {
    const k = knownMoney({ records: life, payDay: 28, takeHomeMonthly: 2093.3, today: '2026-11-21' });
    expect(k.next.map(d => [d.name, d.inDays, d.amount])).toEqual([['Pay day', 7, 2093.3], ['Council tax', 10, 142]]);
  });

  test('nothing is counted that wasn’t said', () => {
    const k = knownMoney({ records: told('My rent is £900 a month.'), takeHomeMonthly: 2093.3, today: '2026-11-21' });
    // No pay said: the engine's take-home for an empty profile is not used.
    expect(k.income).toBeNull();
    expect(k.takeHome).toBeNull();
    expect(k.left).toBeNull();
    expect(k.out).toBe(900);
    expect(k.next).toEqual([]);
  });

  test('a bill said without how often is counted monthly, and marked so', () => {
    const [bill] = knownMoney({ records: told('My water bill is £38.'), today: '2026-11-21' }).bills;
    expect(bill).toMatchObject({ name: 'Water bill', amount: 38, often: null, monthly: 38 });
  });

  test('proposed and removed records are not money yet', () => {
    const proposed = extractStatements('My rent is £900 a month.').map(p => proposalRecord(p, 'talk'));
    expect(knownMoney({ records: proposed, today: '2026-11-21' }).any).toBe(false);
    expect(knownMoney({ records: proposed.map(r => ({ ...r, status: 'removed' as const })), today: '2026-11-21' }).any).toBe(false);
    expect(knownMoney({ records: [], today: '2026-11-21' }).any).toBe(false);
  });

  test('days to a day of the month, across month ends and short months', () => {
    expect(daysToDay(21, '2026-11-21')).toBe(0);
    expect(daysToDay(28, '2026-11-21')).toBe(7);
    expect(daysToDay(1, '2026-11-21')).toBe(10);
    expect(daysToDay(31, '2026-11-21')).toBe(9); // 30 November
    expect(daysToDay(5, '2026-12-28')).toBe(8);
    expect(daysToDay(31, '2027-02-01')).toBe(27); // 28 February
  });
});

describe('the screens', () => {
  const read = (path: string) => readFileSync(join(import.meta.dir, '../..', path), 'utf8');
  const money = read('apps/mobile/src/screens/v26/money.tsx');

  test('Money and the Money area show what Life knows, or day one until it knows anything', () => {
    expect(money).toContain('return known.any ? <MoneyKnownV26 screen={screen} known={known} /> : <MoneyNotYetV26 screen={screen} title={title} />;');
    expect(money).toContain('return SHOW_SAMPLES ? <AreaMoneySampleV26 /> : <MoneyRealV26 screen="area" />;');
    expect(money).toContain('Figures are the ones you’ve told Life. No bank is connected. Guidance, not advice.');
  });

  test('subscriptions told to Life show on Subscriptions, never as unused', () => {
    expect(money).toContain("const told = SHOW_SAMPLES ? [] : knownMoney({ records: data.records, today: dayKey() }).subscriptions");
    expect(money).toContain("essential: true, cancelled: false");
  });

  test('Your details reads the pay day Life was told', () => {
    expect(read('apps/mobile/src/screens/v26/you.tsx')).toContain("const payN = Number(p.payDay ?? data.choices['payday-day']) || 0;");
  });
});
