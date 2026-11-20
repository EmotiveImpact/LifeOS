/**
 * Learn from the best and Teach me: the board's figures and words that no engine produces yet. Screens read them from
 * here, never inline. Money figures come from the engine through the seed (the payslip, the rebate, the buffer).
 */
import type { ScreenKey } from '@/navigation/screens';
import type { PhotoName } from '@/design/photos';
import { seed, seedPayslip, seedPayslipPicture, seedTaxClaim } from './seed';
import { SHOW_SAMPLES } from './sample';

type Focal = { x?: number; y?: number };

/* ───────────────────────── Ideas ───────────────────────── */

export type IdeaKey = 'barbell' | 'remove' | 'room' | 'invert' | 'antifragile' | 'automatic';
export type Idea = {
  key: IdeaKey; title: string; lens: string; by: string; topic: string;
  photo: PhotoName; focal: Focal;
  /** The idea in one two-tone sentence (braced words bright). */
  sentence: string;
  picture: 'barbell' | 'stress' | 'aim' | 'flow' | 'cycle' | 'compare' | 'funnel';
  use: { label: string; to: ScreenKey; note: string };
};

export const ideas: Record<IdeaKey, Idea> = {
  barbell: {
    key: 'barbell', title: 'The barbell', lens: 'taleb', by: 'Nassim Taleb', topic: 'Risk', photo: 'bench', focal: { y: 0.55 },
    sentence: 'Put most of what you have somewhere {boringly safe,} and a small part into {bold bets} with a capped downside. Avoid the {“medium risk” middle} that can quietly blow up.',
    picture: 'barbell', use: { label: 'Use it today', to: 'cashplan', note: 'Opens your 30-day cash plan: the safe side of your barbell.' },
  },
  remove: {
    key: 'remove', title: 'Remove before you add', lens: 'taleb', by: 'Nassim Taleb', topic: 'Risk', photo: 'calmdesk', focal: { y: 0.5 },
    sentence: 'Before adding something new, {take something away}: a cost, a habit, a commitment. {Less that can go wrong} is often the quickest win.',
    picture: 'funnel', use: { label: 'Use it today', to: 'subs', note: 'Opens your subscriptions: the easiest things to remove.' },
  },
  room: {
    key: 'room', title: 'Room for error', lens: 'housel', by: 'Morgan Housel', topic: 'Money psychology', photo: 'sunday', focal: { y: 0.75 },
    sentence: 'Plan for things to go {a bit wrong.} A {buffer} turns a bad month into an annoying one instead of a crisis.',
    picture: 'compare', use: { label: 'Use it today', to: 'buffer', note: 'Opens your buffer: how much room you have today.' },
  },
  invert: {
    key: 'invert', title: 'Invert the problem', lens: 'munger', by: 'Charlie Munger', topic: 'Thinking clearly', photo: 'aimdesk', focal: { y: 0.5 },
    sentence: 'Instead of asking how to succeed, ask {what would make this fail,} then {avoid those things.} Problems often get easier backwards.',
    picture: 'flow', use: { label: 'Try it on your tax', to: 'taxcheck', note: 'Opens your tax check, where working backwards found money you’re owed.' },
  },
  antifragile: {
    key: 'antifragile', title: 'Fragile, robust, antifragile', lens: 'taleb', by: 'Nassim Taleb', topic: 'Risk', photo: 'letter', focal: { y: 0.5 },
    sentence: 'Some things break under stress, some survive it, and some {get stronger.} Build a life that {gains from surprises} instead of fearing them.',
    picture: 'stress', use: { label: 'Use it today', to: 'protect', note: 'Opens your protection review: fix the things that could ruin you.' },
  },
  automatic: {
    key: 'automatic', title: 'Make it automatic', lens: 'clear', by: 'James Clear', topic: 'Habits and focus', photo: 'work', focal: { y: 0.5 },
    sentence: 'Decide once, then {let the system do it.} A {payday sweep} beats remembering to save every month.',
    picture: 'cycle', use: { label: 'Use it today', to: 'routines', note: 'Opens your routines, where the payday sweep lives.' },
  },
};

/** Ideas the sample life has already used (dev builds only), and what each changed. */
export const sampleApplied: IdeaKey[] = ['remove', 'room', 'automatic', 'invert'];

/* ───────────────────────── Lenses ───────────────────────── */

export type Lens = { id: string; initials: string; first: string; name: string; photo: PhotoName; focal: Focal; area: string; books?: string[] };
/** The ten thinkers in the library row. `id` matches the engine's `THINKER_ATEAM`, except Napoleon Hill, who has his own page. */
export const lenses: Lens[] = [
  { id: 'naval', initials: 'NR', first: 'Naval', name: 'Naval Ravikant', books: ['The Almanack of Naval Ravikant'], photo: 'freedom', focal: { y: 0.5 }, area: 'Wealth and leverage' },
  { id: 'taleb', initials: 'NT', first: 'Nassim', name: 'Nassim Taleb', books: ['Antifragile', 'Skin in the Game'], photo: 'run', focal: { y: 0.62 }, area: 'Risk and antifragility' },
  { id: 'housel', initials: 'MH', first: 'Morgan', name: 'Morgan Housel', books: ['The Psychology of Money'], photo: 'sunday', focal: { y: 0.75 }, area: 'Money psychology' },
  { id: 'munger', initials: 'CM', first: 'Charlie', name: 'Charlie Munger', books: ['Poor Charlie’s Almanack'], photo: 'aimdesk', focal: { y: 0.5 }, area: 'Thinking clearly' },
  { id: 'clear', initials: 'JC', first: 'James', name: 'James Clear', books: ['Atomic Habits'], photo: 'walk', focal: { y: 0.4 }, area: 'Habits and focus' },
  { id: 'newport', initials: 'CN', first: 'Cal', name: 'Cal Newport', books: ['Deep Work'], photo: 'calmdesk', focal: { y: 0.5 }, area: 'Deep work' },
  { id: 'attia', initials: 'PA', first: 'Peter', name: 'Peter Attia', books: ['Outlive'], photo: 'breathe', focal: { y: 0.3 }, area: 'Health and longevity' },
  { id: 'huberman', initials: 'AH', first: 'Andrew', name: 'Andrew Huberman', books: [], photo: 'bedroom', focal: { y: 0.5 }, area: 'Sleep and focus' },
  { id: 'sethi', initials: 'RS', first: 'Ramit', name: 'Ramit Sethi', books: ['I Will Teach You to Be Rich'], photo: 'payslip', focal: { y: 0.78 }, area: 'Money psychology' },
  { id: 'hill', initials: 'NH', first: 'Napoleon', name: 'Napoleon Hill', books: ['Think and Grow Rich'], photo: 'aimwrite', focal: { y: 0.58 }, area: 'Definiteness of purpose' },
];

/** Taleb's page as the board shows it: his ideas (two open, the rest unlock with level), where life uses the lens, his books. */
export const talebLens = {
  ideas: [
    { key: 'remove' as IdeaKey, tag: 'Applied' }, { key: 'barbell' as IdeaKey, tag: 'In progress' }, { key: 'antifragile' as IdeaKey, tag: '60 sec' },
    { title: 'Skin in the game', photo: 'friends' as PhotoName, tag: 'Level 3', level: 3 }, { title: 'The Lindy effect', photo: 'terrace' as PhotoName, tag: 'Level 4', level: 4 },
  ],
  uses: [
    { icon: 'cash' as const, title: '30-day cash plan', sub: 'The safe side of your barbell', to: 'cashplan' as ScreenKey },
    { icon: 'repeat' as const, title: 'Subscriptions', sub: 'Remove before you add', to: 'subs' as ScreenKey },
    { icon: 'shield' as const, title: 'Protection review', sub: 'Fix the things that could ruin you', to: 'protect' as ScreenKey, level: 4 },
  ],
  books: [{ title: 'Antifragile', sub: 'Book · the core of this lens' }, { title: 'Skin in the Game', sub: 'Book' }],
};

/** Collections in the library, each opening the lens that leads it. */
export const collections: { photo: PhotoName; title: string; count: string; focal: Focal; lens: string }[] = [
  { photo: 'payslip', title: 'Money psychology', count: '6 ideas', focal: { y: 0.78 }, lens: 'housel' },
  { photo: 'letter', title: 'Risk', count: '5 ideas', focal: { y: 0.5 }, lens: 'taleb' },
  { photo: 'freedom', title: 'Wealth & leverage', count: '5 ideas · L3', focal: { y: 0.5 }, lens: 'naval' },
  { photo: 'walk', title: 'Habits & focus', count: '7 ideas', focal: { y: 0.5 }, lens: 'clear' },
  { photo: 'run', title: 'Health', count: '6 ideas', focal: { y: 0.62 }, lens: 'attia' },
  { photo: 'journal', title: 'Thinking clearly', count: '4 ideas', focal: { y: 0.5 }, lens: 'munger' },
];

/** Today's idea, tall at the top of the library. */
export const todaysIdea = { key: 'barbell' as IdeaKey, sub: 'Keep most of your money boringly safe so you can afford a few small, bold bets.' };

/** Ideas you've used: the sample life's (dev builds only) plus any you've opened with "Use it today". */
export function appliedIdeas(flags: Record<string, boolean | undefined>): Set<IdeaKey> {
  const used = (Object.keys(ideas) as IdeaKey[]).filter(k => flags[`idea-used-${k}`]);
  return new Set([...(SHOW_SAMPLES ? sampleApplied : []), ...used]);
}

/** How far along an idea is: applied, the one in progress (the sample life is learning the barbell), or new. */
export function ideaTag(key: IdeaKey, applied: Set<IdeaKey>) {
  return applied.has(key) ? 'Applied' : SHOW_SAMPLES && key === 'barbell' ? 'In progress' : '60 sec';
}

/** The library's "for where you are" cards: what each idea is to you right now. */
export const forYou: { key: IdeaKey; tag: string; sub?: string }[] = [
  { key: 'remove', tag: 'Applied', sub: 'You cancelled Netflix' },
  { key: 'room', tag: 'In progress', sub: 'Your buffer' },
  { key: 'invert', tag: 'New · 60 sec' },
];

/* ───────────────────────── What learning changed ───────────────────────── */

/** The sample life's learning so far (dev builds only); a real account starts at nothing. */
export const learning = SHOW_SAMPLES
  ? { applied: 7, thinkers: 4, worthYear: 1210, learnedMonth: 7, recallsDue: 2, streakDays: [3, 6, 10, 13, 17, 20, 24, 25, 28] }
  : { applied: 0, thinkers: 0, worthYear: 0, learnedMonth: 0, recallsDue: 0, streakDays: [] as number[] };

/** Each idea beside its real result. */
export const results: { photo: PhotoName; focal: Focal; title: string; sub: string; worth: string; to: ScreenKey }[] = [
  { photo: 'calmdesk', focal: { y: 0.5 }, title: 'Remove before you add', sub: 'Cancelled 2 unused subscriptions', worth: '£383/yr', to: 'subs' },
  { photo: 'sunday', focal: { y: 0.75 }, title: 'Room for error', sub: `Buffer up to ${bufferCover().toFixed(1)} months`, worth: '£580', to: 'buffer' },
  { photo: 'work', focal: { y: 0.5 }, title: 'Make it automatic', sub: 'Payday sweep set up', worth: `£${seed.finance.bufferSavingMonthly}/mo`, to: 'routines' },
  { photo: 'aimdesk', focal: { y: 0.5 }, title: 'Invert the problem', sub: `Found the £${seedTaxClaim.refund} rebate`, worth: `£${seedTaxClaim.refund}`, to: 'taxcheck' },
];

/** How many months your buffer covers today (the same sum as the buffer tool). */
export function bufferCover() { return seed.finance.balance / seed.finance.cashplan.essentialBills; }

/** What you've learned, recalls due first. */
export const shelf: { photo: PhotoName; focal: Focal; tag: string; title: string; from: string; due?: boolean; to: ScreenKey }[] = [
  { photo: 'breathe', focal: { y: 0.4 }, tag: 'Recall due today', title: 'Heart rate variability', from: 'From Body · Tuesday', due: true, to: 'recall' },
  { photo: 'bedroom', focal: { y: 0.5 }, tag: 'Recall due today', title: 'Sleep debt', from: 'From Body · 2 weeks ago', due: true, to: 'recall' },
  { photo: 'payslip', focal: { y: 0.75 }, tag: 'Led to action', title: 'Tax codes', from: 'From your payslip · today\nLed to: checked your code', to: 'lessonready' },
  { photo: 'sunday', focal: { y: 0.75 }, tag: 'Led to action', title: 'Emergency buffer', from: 'From your cash plan · last week\nLed to: £600 set aside', to: 'buffer' },
  { photo: 'bench', focal: { y: 0.55 }, tag: 'Sticking well', title: 'The barbell', from: 'Lens · Taleb · last week', to: 'idea' },
];

/* ───────────────────────── Quick recall ───────────────────────── */

export const recallLadder = ['1d', '3d', '7d', '21d', '60d'] as const;
/** When the next recall comes, in words, for each step of the ladder. */
export const recallWhen = ['tomorrow', 'in 3 days', 'in a week', 'in 3 weeks', 'in 2 months'] as const;
export const recall = {
  idea: 'barbell' as IdeaKey,
  question: 'With the barbell, {what do you fill first?}',
  options: [{ key: 'bold', label: 'The bold bets' }, { key: 'safe', label: 'The safe side' }, { key: 'even', label: 'A bit of both, evenly' }],
  answer: 'safe',
  right: 'Yes. Boringly safe first, so you can afford a few small, bold bets.',
  wrong: 'It’s the safe side. Boringly safe first, so the bold bets can stay small.',
};

/* ───────────────────────── Ask through a lens ───────────────────────── */

/** A capped bet: about a tenth, rounded to £10. */
export const cappedBet = (total: number) => Math.max(10, Math.round(total * 0.1 / 10) * 10);

export function lensAnswers(rebate: number) {
  const cover = bufferCover().toFixed(1), bet = cappedBet(rebate);
  return {
    Taleb: `First ask what could {ruin you}. You have {${cover} months} of buffer and a tax bill coming. Crypto with your rebate is fine only as a {small, capped bet}: say £${bet} of it, never the lot.`,
    Housel: `Leave {room for error}. Your buffer covers {${cover} months}; topping it up with the rebate buys calm that a quick gain can’t. If you bet, keep it to {£${bet}}.`,
    Munger: `Invert it: what would make this {go badly}? Needing the money soon, then selling low. Protect your {buffer and tax pot} first, and only risk what you could lose, say {£${bet}}.`,
  } as const;
}

/* ───────────────────────── Teach it back (the barbell) ───────────────────────── */

export const barbellCheck = {
  sample: 'Keep most of your money really safe, like a buffer, and only put a small bit into risky stuff, so a bad bet can’t wreck you.',
  parts: [
    { label: 'Safe side first', words: /safe|buffer|secure|savings?/i },
    { label: 'A small bold part', words: /small|little|bit|few|bold|risky|risk/i },
    { label: 'Capped downside', words: /wreck|ruin|lose|cap|can.t hurt|limit|afford/i },
  ],
  gap: { label: 'The “medium risk” middle', words: /middle|medium|in between|in-between/i, why: 'You didn’t say to avoid it, and it’s the part that can quietly blow up.' },
};

/* ───────────────────────── Napoleon Hill ───────────────────────── */

/** Your Chief Aim, said the way the principles show it: "A two-bed flat", "June 2029", "£800 a month". */
export function aimChips(aim: { what: string; when: string; give: string } | null) {
  if (!aim) return { what: '', when: '', give: '' };
  const what = aim.what.trim().replace(/^(to\s+)?(own|buy|get|have|be|become|build|start|run|reach|save|pay off)\s+/i, '').replace(/\s+(in|by|near|around)\s+.*$/i, '');
  const give = aim.give.match(/£[\d,.]+k?(\s+(a|per|each)\s+(month|week|year))?/i)?.[0] ?? aim.give.trim().split(/\s+and\s+/)[0];
  return { what: what ? what[0].toUpperCase() + what.slice(1) : '', when: aim.when.trim(), give };
}

export const hillPrinciples = [
  { title: 'Decide exactly what you want', sub: 'Something you could photograph' },
  { title: 'Set a date', sub: 'Deadlines turn wishes into plans' },
  { title: 'Name what you’ll give', sub: 'Effort, money, time' },
  { title: 'Read it twice a day', sub: 'Morning and night, about 20 seconds' },
];

/* ───────────────────────── Pictures that teach ───────────────────────── */

export const devices = [
  { key: 'flow', title: 'Flow', sub: 'How one thing leads to the next' }, { key: 'cycle', title: 'Cycle', sub: 'A loop that repeats' },
  { key: 'compare', title: 'Compare', sub: 'Two options, side by side' }, { key: 'layers', title: 'Layers', sub: 'What sits on what' },
  { key: 'timeline', title: 'Timeline', sub: 'When things happen' }, { key: 'venn', title: 'Venn', sub: 'Where two things overlap' },
  { key: 'funnel', title: 'Funnel', sub: 'Narrowing down' }, { key: 'things', title: 'Things', sub: 'Drawn objects, 208 of them' },
] as const;

/* ───────────────────────── Teach me: tax codes ───────────────────────── */

const allowance = seedPayslip.uk?.personalAllowance ?? 12570;
/** The lesson's numbers, from your payslip: the code, its parts, and the twelfth taken off each payday. */
export const lessonNumbers = {
  allowance, number: String(Math.floor(allowance / 10)), letter: 'L', code: `${Math.floor(allowance / 10)}L`,
  /** The guess compares your code with a smaller one. */
  lower: 11000, lowerCode: '1100L',
  twelfth: seedPayslipPicture.free,
};

/** Tax and NI on the payslip so far this tax year (monthly figures from the engine, times the paydays since April). */
export function taxSoFar(today = new Date()) {
  const paid = (today.getMonth() - 3 + 12) % 12 || 12;
  return { tax: Math.round(seedPayslip.incomeTaxMonthly * paid), ni: Math.round(seedPayslip.socialSecurityMonthly * paid), months: paid };
}

export const lesson = {
  topic: 'Tax codes',
  title: 'What your tax code means',
  bites: [
    { mini: 'parts' as const, title: 'The code is two parts', sub: 'A number and a letter' },
    { mini: 'twelfth' as const, title: 'How it works each payday', sub: 'With one guess from you' },
    { mini: 'wrong' as const, title: 'When it goes wrong', sub: 'And how to spot it' },
  ],
  puzzle: {
    options: [{ key: 'little', label: 'It means you’ve paid too little' }, { key: 'details', label: 'Your employer doesn’t have your details yet' }, { key: 'self', label: 'You’re self-employed' }],
    answer: 'details',
  },
  recap: [
    'The {number} is your tax-free pay, without the last zero.',
    'Each payday, {a twelfth} comes off before tax.',
    'A letter like {M1} means a stopgap, so {check it}.',
  ],
  /** The board's telling-back, shown in dev builds until you speak. */
  sampleTelling: [
    { who: 'you' as const, text: 'It’s like… the number is how much you earn before tax kicks in, so 1257 is about twelve and a half grand. And the letter is the type.' },
    { who: 'life' as const, text: 'Oh nice. So why would the letter matter if the number’s the same?' },
    { who: 'you' as const, text: 'Because M1 means they’re guessing, so you can end up paying too much…' },
  ],
  question: 'Oh nice. So why would the letter matter if the number’s the same?',
  /** The three links in the chain, and the words that show each one was said. */
  links: [
    { label: 'The number', words: /tax.?free|before tax|allowance|12,?570|twelve|grand|earn/i, gap: 'What the number means', fix: 'The number is your tax-free pay for the year, without the last zero: 1257 means £12,570.' },
    { label: 'What M1 means', words: /m1|guess|emergency|stopgap|temporary|details|month one/i, gap: 'What M1 means', fix: 'M1 means your tax is worked out on each month alone, usually because your employer doesn’t have your details yet.' },
    { label: 'How to fix it', words: /hmrc|payroll|tell|fix|update|personal tax account|call|contact/i, gap: 'What to do about a wrong code', fix: 'Check your code in your Personal Tax Account, tell HMRC or your payroll team what’s wrong, then check your next payslip. Overpaid tax comes back through your pay.' },
  ],
};

/** The code on the sample payslip: your allowance code with an emergency basis, which is what Teach me explains. */
export const payslipCode = { code: lessonNumbers.code, basis: 'M1', label: `${lessonNumbers.code} M1` };

/** The words from a telling-back that show a link was said: the clause it was said in. */
export function quoteFor(text: string, words: RegExp) {
  const clause = text.split(/[.!?…]\s+|,\s+|\s+and\s+|\s+so\s+/i).find(c => words.test(c));
  return clause ? clause.replace(/^[\s“"]+|[\s”".…]+$/g, '').replace(/^(because|and|so|well|like|um|er)\s+/i, '') : '';
}
