/**
 * Plan's chapter figures that aren't in the engine yet, as the V26 board shows them (`core.js` plan, `today-plan-you.js`,
 * `money-docs-aim.js`, `talk-toolkit.js`). Screens read them from here so no figure is typed into a screen.
 * Sample-only lists are used only when `SHOW_SAMPLES` is on; a real account shows its own records instead.
 */
import type { PhotoName } from '@/design';
import type { ScreenKey } from '@/navigation/screens';
import { seed } from './seed';

/** Work: the invoice tracker's open invoices (board copy). */
export const invoices = { unpaid: 3, total: 2400, workAim: 70000, registerBy: '5 Oct' };

/** Money's areas line on Plan and Area: Money. */
export const bufferMonths = seed.finance.balance / seed.finance.essentials;

/** The cleared missions the board's history shows, for development builds while nothing is cleared yet. */
export const sampleCleared: { month: string; photo: PhotoName; title: string; sub: string; end: string; tag?: string }[] = [
  { month: 'NOVEMBER', photo: 'payslip', title: 'HMRC tax rebate', sub: 'Cleared 22 Nov', end: '£840' },
  { month: 'NOVEMBER', photo: 'letter', title: 'Council tax review', sub: 'Cleared 3 Nov · confirmed correct', end: '£0' },
  { month: 'NOVEMBER', photo: 'freedom', title: 'Cancelled 2 subscriptions', sub: 'Cleared 1 Nov', end: '£383/yr' },
  { month: 'OCTOBER', photo: 'aimdesk', title: 'Payday sweep set up', sub: 'Cleared 28 Oct', end: '£180/mo' },
  { month: 'OCTOBER', photo: 'walk', title: 'GP blood test booked', sub: 'Cleared 20 Oct', end: '', tag: 'Health' },
];
export const sampleClearedTotal = 3343;

/** Cash plan: the next five weeks in and out, payday week picked out (board `cashplan`). */
export const cashWeeks = [
  { label: '16 Nov', in: 0, out: 310 }, { label: '23 Nov', in: seed.finance.cashplan.comingIn, out: 1150, now: true },
  { label: '30 Nov', in: 0, out: 388 }, { label: '7 Dec', in: 0, out: 152 }, { label: '14 Dec', in: 0, out: 120 },
];

/** Money hub: this month by week. */
export const monthWeeks = [
  { label: '2 Nov', in: 0, out: 298.4 }, { label: '9 Nov', in: 0, out: 335.08 }, { label: '16 Nov', in: 0, out: 310 },
  { label: '23 Nov', in: 2410.66, out: 1206.98, now: true },
];

/** Net worth across the year, December to November. */
export const netWorthYear = [17360, 17810, 18240, 18900, 19350, 19980, 20410, 21050, 21620, 22310, 22870, 23480];

/** The National Insurance years as the board draws them: ten lived, the sixth the gap. */
export const niYears = Array.from({ length: seed.finance.niRecord.targetYears }, (_, k) => (k === 5 ? 'now' : k < seed.finance.niRecord.years + 1 ? 'on' : '') as '' | 'on' | 'now');

/** This month's gambit choices (board `GAMBITS`). */
export const gambits: { photo: PhotoName; focal: { x?: number; y?: number }; a: string; b: string; t1: string; s1: string; t2: string; s2: string }[] = [
  { photo: 'payslip', focal: { y: 0.45 }, a: 'claim every £ I’m owed', b: 'start a 3-month buffer', t1: 'Claim every £ I’m owed', s1: 'Start with the P87: est. £840 back, one form to go.', t2: 'Start a 3-month buffer', s2: 'Your buffer covers 1.3 months today.' },
  { photo: 'keyshome', focal: { y: 1 }, a: 'open a Lifetime ISA', b: `move £${seed.finance.savingsMonthly} in`, t1: 'Open a Lifetime ISA', s1: 'A 25% bonus on what you save for a first home.', t2: `Move £${seed.finance.savingsMonthly} in`, s2: 'This month’s saving toward the deposit.' },
  { photo: 'desk', focal: { x: 1 }, a: 'raise my design rate by 10%', b: 'send 3 proposals', t1: 'Raise my design rate by 10%', s1: 'Half of the 20% in your Aim.', t2: 'Send 3 proposals', s2: 'At the new rate.' },
];

/** Bloodwork reader: where each marker's dot sits in the lab's range (board positions). */
export const bloodTiles: { id: string; name: string; tag: string; tone?: 'live' | 'q'; value: string; unit: string; pos: number }[] = [
  { id: 'bw-vitd', name: 'Vitamin D', tag: 'Low', tone: 'live', value: '38', unit: 'nmol/L', pos: 14 },
  { id: 'bw-ferritin', name: 'Ferritin', tag: 'In range', tone: 'q', value: '64', unit: 'µg/L', pos: 53 },
  { id: 'bw-hba1c', name: 'HbA1c', tag: 'In range', tone: 'q', value: '36', unit: 'mmol/mol', pos: 45 },
  { id: 'bw-apob', name: 'ApoB', tag: 'High end', value: '1.1', unit: 'g/L', pos: 73 },
];

/** Documents: the dates the board counts down to, so screens can count weeks from today. */
export const docDates: Record<string, string> = { insurance: '2027-02-14', mot: '2027-01-12', railcard: '2027-03-03', passport: '2027-08-12' };

/** Subscriptions: days since last used (board copy) and the provider's own page where you cancel. */
export const daysUnused: Record<string, number> = { netflix: 74, gym: 61 };
export const cancelPages: Record<string, string> = {
  netflix: 'https://www.netflix.com/cancelplan', gym: 'https://www.thegymgroup.com/', adobe: 'https://account.adobe.com/plans', icloud: 'https://support.apple.com/en-gb/108047',
};

/** Connect your bank: the banks the preview names. */
export const bankChoices = ['Monzo', 'Starling', 'Barclays', 'HSBC', 'Lloyds', 'Nationwide'];

/** Payday sweep: the next run, as the board shows it on Area: Money. */
export const paydaySweep = { next: '28 Nov' };

/** The toolkit: fourteen tools, each with its area and the level it opens at (board `tools`, fourteen ticks). */
export const TOOLS: { key: ScreenKey; title: string; short?: string; area: 'Money' | 'Home' | 'Work' | 'Health'; level: number; sub: string; photo: PhotoName }[] = [
  { key: 'cashplan', title: '30-day cash plan', area: 'Money', level: 1, sub: 'Know what the month needs', photo: 'payslip' },
  { key: 'taxcheck', title: 'Tax & NI check', area: 'Money', level: 1, sub: 'What you’re owed, your NI record', photo: 'payslip' },
  { key: 'buffer', title: 'How big a buffer?', short: 'Buffer', area: 'Money', level: 1, sub: 'Months of essentials saved', photo: 'aimdesk' },
  { key: 'subs', title: 'Subscriptions', area: 'Money', level: 2, sub: 'What you pay for and don’t use', photo: 'freedom' },
  { key: 'money', title: 'Money & ledger', short: 'Ledger', area: 'Money', level: 2, sub: 'Every account in one place', photo: 'payslip' },
  { key: 'protect', title: 'Protection review', short: 'Protection', area: 'Money', level: 4, sub: 'The safety nets most people never check', photo: 'siblings' },
  { key: 'bedrooms', title: 'Your next home: bedrooms', short: 'Bedrooms', area: 'Home', level: 2, sub: 'What the rooms you need cost', photo: 'bedroom' },
  { key: 'rentbuy', title: 'Rent vs buy', area: 'Home', level: 3, sub: 'Run the real numbers for your first home', photo: 'keyshome' },
  { key: 'income', title: 'Income & structure', short: 'Structure', area: 'Work', level: 3, sub: 'Sole trader or limited company', photo: 'desk' },
  { key: 'growth', title: 'Growth path', short: 'Growth', area: 'Work', level: 4, sub: 'Raise your rate, a second income', photo: 'journal' },
  { key: 'library', title: 'Learn', area: 'Work', level: 1, sub: 'Ideas you can actually use', photo: 'calmdesk' },
  { key: 'body', title: 'Body & habits', short: 'Body', area: 'Health', level: 1, sub: 'Sleep, movement and small routines', photo: 'run' },
  { key: 'healthstack', title: 'Health stack', short: 'Stack', area: 'Health', level: 2, sub: 'What you take, and when', photo: 'food' },
  { key: 'blood', title: 'Bloodwork reader', short: 'Bloodwork', area: 'Health', level: 3, sub: 'A plain-English read of each marker', photo: 'run' },
];
