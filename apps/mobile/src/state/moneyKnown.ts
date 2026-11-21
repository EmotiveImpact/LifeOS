import type { FiledRecord, MoneyDetails } from './seed';

/**
 * Money for a real account, from what the person has told Life (F-37): their pay, pay day, rent, bills and
 * subscriptions, as confirmed records. Nothing here is guessed from a bank or the sample life. A bill said without
 * "how often" is counted as monthly, and the page says so on that row.
 */
export type Often = NonNullable<MoneyDetails['frequency']>;
export type KnownCost = { id: string; name: string; amount: number; often: Often | null; monthly: number; dueDay: number | null; kind: 'rent' | 'bill' | 'subscription' };
export type KnownDate = { id: string; name: string; day: number; inDays: number; amount: number | null; kind: 'pay' | 'bill' };
export type KnownMoney = {
  /** True once Life knows anything on this page. */
  any: boolean;
  /** Yearly pay as said, and the engine's monthly take-home from it. */
  income: number | null;
  takeHome: number | null;
  payDay: number | null;
  rent: KnownCost | null;
  bills: KnownCost[];
  subscriptions: KnownCost[];
  /** Rent, bills and subscriptions, per month. */
  out: number;
  /** Take-home less what goes out, when both are known. */
  left: number | null;
  /** Pay day and bills with a due day, soonest first, from `today`. */
  next: KnownDate[];
};

const PER_MONTH: Record<Often, number> = { weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };
const round2 = (n: number) => Math.round(n * 100) / 100;
const sum = (xs: number[]) => round2(xs.reduce((a, b) => a + b, 0));

/** Days from `today` (YYYY-MM-DD) to the next time `day` of the month comes round. A 31st lands on a short month's last day. */
export function daysToDay(day: number, today: string): number {
  const [y, m, d] = today.split('-').map(Number);
  const on = (year: number, month: number) => Math.min(day, new Date(Date.UTC(year, month, 0)).getUTCDate());
  const thisMonth = on(y, m);
  if (thisMonth >= d) return thisMonth - d;
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  return Math.round((Date.UTC(next.y, next.m - 1, on(next.y, next.m)) - Date.UTC(y, m - 1, d)) / 86400000);
}

function cost(record: FiledRecord): KnownCost | null {
  const d = record.details;
  if (!d || (d.kind !== 'bill' && d.kind !== 'subscription') || !(d.amount > 0)) return null;
  const often = d.frequency ?? null;
  return { id: record.id, name: d.kind === 'bill' ? d.payee : d.service, amount: d.amount, often, monthly: round2(d.amount * PER_MONTH[often ?? 'monthly']), dueDay: d.kind === 'bill' && d.dueDay ? d.dueDay : null, kind: d.kind };
}

export function knownMoney(input: { records: FiledRecord[]; payDay?: number | null; takeHomeMonthly?: number | null; today: string }): KnownMoney {
  const confirmed = input.records.filter(r => r.status === 'confirmed');
  const byId = (id: string) => confirmed.find(r => r.id === id);
  const incomeRecord = byId('income'), rentRecord = byId('rent');
  const income = incomeRecord && Number(incomeRecord.value) > 0 ? Number(incomeRecord.value) : null;
  const takeHome = income && input.takeHomeMonthly && input.takeHomeMonthly > 0 ? round2(input.takeHomeMonthly) : null;
  const rentAmount = rentRecord ? Number(rentRecord.value) : NaN;
  const rent: KnownCost | null = rentAmount > 0 ? { id: 'rent', name: 'Rent', amount: rentAmount, often: 'monthly', monthly: rentAmount, dueDay: null, kind: 'rent' } : null;
  const costs = confirmed.map(cost).filter((c): c is KnownCost => !!c);
  const bills = costs.filter(c => c.kind === 'bill'), subscriptions = costs.filter(c => c.kind === 'subscription');
  const payDay = input.payDay && input.payDay >= 1 && input.payDay <= 31 ? Math.floor(input.payDay) : null;
  const out = sum([rent?.monthly ?? 0, ...bills.map(b => b.monthly), ...subscriptions.map(s => s.monthly)]);
  const next: KnownDate[] = [
    ...(payDay ? [{ id: 'payday', name: 'Pay day', day: payDay, inDays: daysToDay(payDay, input.today), amount: takeHome, kind: 'pay' as const }] : []),
    ...bills.filter(b => b.dueDay).map(b => ({ id: b.id, name: b.name, day: b.dueDay!, inDays: daysToDay(b.dueDay!, input.today), amount: b.amount, kind: 'bill' as const })),
  ].sort((a, b) => a.inDays - b.inDays || (a.kind === 'pay' ? -1 : 1));
  return {
    any: !!(income || payDay || rent || costs.length), income, takeHome, payDay, rent, bills, subscriptions, out,
    left: takeHome !== null && out > 0 ? round2(takeHome - out) : null, next,
  };
}
