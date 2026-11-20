/**
 * Today's moves and briefing, as the V26 board orders them by how you're arriving (`core.js` `MOVES`, `BRIEF`,
 * `moveOrder`). Figures come from the seed and the engine, never typed into the screen.
 */
import type { FeelMoodId, PhotoName } from '@/design';
import type { ScreenKey } from '@/navigation/screens';
import { SEED_DATE, money, seed, seedTaxClaim } from './seed';

/** Whole days from the seed date (or `from`) to an ISO date. */
export const daysUntil = (iso: string, from: string = SEED_DATE) => Math.round((Date.parse(iso) - Date.parse(from)) / 86_400_000);

export const councilTax = { amount: seed.finance.councilTaxMonthly, due: '2026-12-01', days: daysUntil('2026-12-01') };
export const safeToSpend = seed.finance.cashplan.comingIn - seed.finance.cashplan.essentialBills - seed.finance.cashplan.taxSetAside;

export type TodayMove = { key: string; title: string; chip: string; value: string; photo: PhotoName; to: ScreenKey; mission?: string };

export const TODAY_MOVES: TodayMove[] = [
  { key: 'rebate', title: 'Claim your tax rebate', chip: 'One form · about 6 min', value: `est. ${money(seedTaxClaim.refund)} back`, photo: 'payslip', to: 'mission', mission: 'uk-hmrc-tax-code' },
  { key: 'taxcode', title: 'Check your tax code', chip: 'Start with your payslip · 4 min', value: 'Keeps the right tax coming off', photo: 'letter', to: 'taxcheck' },
  { key: 'cashplan', title: 'Set your cash plan', chip: 'Know what the month needs · 10 min', value: `${money(safeToSpend)} safe to spend`, photo: 'work', to: 'cashplan' },
];

/** The order the moves arrive in: drained or anxious starts small, restless starts quick. Board `moveOrder`. */
export function moveOrder(mood: FeelMoodId | null | undefined): number[] {
  if (mood === 'drained' || mood === 'anxious') return [1, 0, 2];
  if (mood === 'restless') return [1, 2, 0];
  return [0, 1, 2];
}

/** The briefing for each mood, in board copy: braces mark the bright words, `@icon` sets an icon inside them. */
export function todayBrief(mood: FeelMoodId | null | undefined): string {
  const days = `${councilTax.days} days`;
  switch (mood) {
    case 'driven': return 'You’ve got energy. {@doc Two moves} today clear your {tax rebate} and set the month.';
    case 'restless': return 'Let’s burn it off. {@check Three quick wins} first, then the {tax form} if you fancy it.';
    case 'anxious': return `Let’s make it smaller. Only {@calendar one date} matters this week, and it’s {${days}} away.`;
    case 'drained': return `Going gently today. Only {@calendar council tax} has a date, and it’s {${days}} away.`;
    case 'peaceful': return 'A steady day. {@walk Your walk} comes first. The {tax form} can wait until this afternoon.';
    default: return `Your {@doc tax rebate} is {one form} away. {@calendar Council tax} is due in {${days}}.`;
  }
}

/** Today's decisions, stored as `<day>|<y/n per move in arrival order>` so they reset each morning. */
export function readDecisions(stored: string | undefined, day: string): string {
  if (!stored) return '';
  const [d, dec = ''] = stored.split('|');
  return d === day ? dec : '';
}

/** Payday, for the payday sweep routine. */
export const payday = { date: '2026-11-28', days: daysUntil('2026-11-28') };

/**
 * The lighter-day scenario Why explains: the three signals life used when readiness was low. A sample day from the
 * board, kept here so the sheet never types its own figures.
 */
export const lighterDay = { readiness: 41, sleep: '5h 50m', need: '8h 05m', hrvNormal: [47, 56] as const };

/** The heavy week Checking in responds to: one letter per day, oldest first, 1 for drained or anxious. */
export const heavyWeek = { days: ['T', 'W', 'T', 'F', 'S', 'S', 'M'], heavy: '1011011' };
export const heavyCount = [...heavyWeek.heavy].filter(c => c === '1').length;

/** The calendar-aware day: busy or free only, never what an event is. */
export const dayShape = {
  booked: '6h 20m',
  blocks: [
    { at: '09:00', kind: 'busy', h: 52 }, { at: '10:30', kind: 'free', h: 30 }, { at: '11:00', kind: 'busy', h: 68 }, { at: '13:00', kind: 'soft', h: 34, label: 'Lunch' },
    { at: '13:40', kind: 'gap', h: 0 }, { at: '14:00', kind: 'busy', h: 96 }, { at: '17:30', kind: 'soft', h: 34, label: 'Run' },
  ] as { at: string; kind: 'busy' | 'free' | 'soft' | 'gap'; h: number; label?: string }[],
};

/** Formats minutes as `7h 10m`. */
export const hm = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
