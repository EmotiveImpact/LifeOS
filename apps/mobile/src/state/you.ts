/**
 * You, Know yourself and Grow: the board's words and figures that no engine produces yet (`core.js` you,
 * `today-plan-you.js`, `body-b.js`, `learn-teach-grow.js`). Screens read them from here, never inline. Levels, the
 * life score and money come from the engine through the seed. Sample-only lists show only when `SHOW_SAMPLES` is on;
 * a real account sees its own records or a plain empty line.
 */
import type { PhotoName } from '@/design/photos';
import type { FeelMoodId } from '@/design/components/V26Feel';
import type { Area } from '@/design/tokens';
import type { ScreenKey } from '@/navigation/screens';
import { seed, seedYearReview, type FiledRecord } from './seed';
import { SHOW_SAMPLES } from './sample';

type Focal = { x?: number; y?: number; zoom?: number };

/* ───────────────────────── You ───────────────────────── */

/** What Ama does, for the eyebrow and Settings ("Ama · Designer · London"). */
export const workTitle = SHOW_SAMPLES ? 'Designer' : '';

/** Who you're becoming: the statement asked every few check-ins, and the last five answers (0 NO to 100 YES). */
export const becoming = { statement: 'I look after future me.', marks: SHOW_SAMPLES ? [52, 70, 64, 88, 80] : [] as number[] };

/** The streak tile: the last 14 days and the best run. */
export const streak = { days: SHOW_SAMPLES ? '11011101101111' : '', best: SHOW_SAMPLES ? 11 : 0 };

/** Your three areas as photographs on You. */
export const youAreas: { title: string; photo: PhotoName; focal?: Focal; to: ScreenKey }[] = [
  { title: 'Home', photo: 'home', to: 'areahome' },
  { title: 'Work', photo: 'work', to: 'areawork' },
  { title: 'People', photo: 'people', to: 'people' },
];

/** The four rows at the foot of You. */
export const youRows: { icon: 'home' | 'heart' | 'people' | 'book'; title: string; sub: string; to: ScreenKey }[] = [
  { icon: 'home', title: 'Your household', sub: 'The people and place you call home.', to: 'household' },
  { icon: 'heart', title: 'Body and habits', sub: 'Sleep, movement and small routines.', to: 'body' },
  { icon: 'people', title: 'People and dates', sub: 'The people you want to show up for.', to: 'people' },
  { icon: 'book', title: 'Your learning', sub: 'Ideas you can actually use.', to: 'learning' },
];

/** The household's single person discount line, by how many live there. */
export function householdLine(n: number) {
  return n === 1 ? 'Living alone: you may get {25% off} council tax.' : `${n} at home: the {25% single person discount} usually stops.`;
}
export function childrenLine(n: number) {
  return n === 0 ? 'None: nothing extra to claim here.' : `${n} ${n === 1 ? 'child' : 'children'}: you may be able to claim {Child Benefit}. life will check.`;
}

/* ── Mood over time ── */

/** Three weeks by weekday, Monday first; '' is a day with no check-in. The third week has only Monday so far. */
export const moodWeeks: (FeelMoodId | '')[][] = SHOW_SAMPLES
  ? [['drained', 'calm', 'calm', 'driven', 'calm', '', 'peaceful'], ['drained', 'calm', 'anxious', 'calm', 'driven', 'calm', ''], ['drained']]
  : [];
/**
 * Three weeks by weekday from your own check-ins: the sample's weeks in development builds, otherwise the last three
 * weeks of the log, Monday first, the latest mood of each day, up to today.
 */
export function moodGrid(log: { at: string; moodId: string }[], today = new Date()): (FeelMoodId | '')[][] {
  if (SHOW_SAMPLES) return moodWeeks;
  const day = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const byDay = new Map<string, FeelMoodId>();
  for (const e of log) byDay.set(day(new Date(e.at)), e.moodId as FeelMoodId);
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) - 14);
  return [0, 1, 2].map(w => Array.from({ length: w === 2 ? ((today.getDay() + 6) % 7) + 1 : 7 }, (_, k) => byDay.get(day(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + w * 7 + k))) ?? ''));
}
export const moodSummary = SHOW_SAMPLES ? 'Mostly {calm}, but {drained on Mondays} for three weeks running.' : '';
export const moodPatterns: { mood: FeelMoodId; title: string; sub: string; tag: string; applied?: boolean }[] = SHOW_SAMPLES ? [
  { mood: 'drained', title: 'Mondays are heavy', sub: 'After Sundays with less than 6 hours’ sleep', tag: 'Pattern' },
  { mood: 'calm', title: 'Calmer after admin days', sub: 'Clearing a mission lifts the next day', tag: 'Pattern' },
  { mood: 'peaceful', title: 'Keeping Mondays light', sub: 'life now plans one small task for Mondays', tag: 'Applied', applied: true },
] : [];

/* ── What life knows ── */

/** A photograph for each kind of fact, so the trust screen reads as pictures. */
const factPhotos: Record<string, PhotoName> = { age: 'terrace', rent: 'keys', referral: 'letter', 'sleep-known': 'bedroom', aim: 'keyshome', home: 'home', work: 'work', 'buffer-known': 'freedom' };
const areaPhotos: Record<Area, PhotoName> = { you: 'terrace', home: 'home', work: 'work', money: 'payslip', health: 'walk', goal: 'keyshome' };
export const factPhoto = (r: FiledRecord): PhotoName => factPhotos[r.id] ?? areaPhotos[r.area];
export const knowsFilters = ['All', 'You', 'Home', 'Work', 'Money', 'Health', 'Goals'] as const;
export type KnowsFilter = typeof knowsFilters[number];
export const knowsArea = (f: KnowsFilter): Area | null => f === 'All' ? null : f === 'Goals' ? 'goal' : f.toLowerCase() as Area;

/* ── Your levels ── */

export const season = { label: 'Season 1 · Nov to Feb', toward: 'Your first home' };
export const levelPlan = [
  { name: 'Stabilize', line: 'Know where your cash is going; handle anything time-sensitive.', unlocks: ['30-day cash plan', 'Tax check', 'Sleep basics', '1 habit', 'Room for error', 'Remove before you add'] },
  { name: 'Set your routines', line: 'Bills, care and recurring costs on a routine you can keep.', unlocks: ['Money ledger, subscriptions', 'Body: readiness, fuel, journal, 3 habits', 'Routines: payday sweep, annual tax check'] },
  { name: 'Build momentum', line: 'Use the breathing room for one bigger decision, safely.', unlocks: ['Rent vs buy, income structure, bloodwork', 'Load, trends, journal insights, Teach it back', 'Routines: care review, subscription check'] },
  { name: 'Expand your options', line: 'Build assets, improve your safety nets, review what works.', unlocks: ['Protection review, growth path', 'Advanced sleep planning, habit graduation', 'Season reset: your new normal becomes level 1'] },
];
/** The engine's gate labels in the board's shorter words. */
export const gateWords = (label: string) => label.replace('Review this year’s tax and contributions', 'Review this year’s tax').replace(/^Handle ([A-Z].+)$/, (_, s: string) => `Handle your ${s.toLowerCase()}`);
/** Where each gate opens. */
export const gateTo = (id: string): ScreenKey => id === 'adv-runway' ? 'cashplan' : id === 'adv-tax' ? 'taxcheck' : id === 'adv-subs' ? 'subs' : id === 'adv-health' ? 'healthstack' : id === 'adv-prot' ? 'protect' : 'mission';

/* ── Experiment ── */

export const experiment = SHOW_SAMPLES ? {
  name: 'No caffeine after 12', day: 9, of: 14, tag: 'Looking promising', left: '5 more days until you know',
  vs: [
    { name: 'Time to fall asleep', now: '14 min', base: '22 min', a: 64, b: 100 },
    { name: 'Deep sleep', now: '1h 22m', base: '1h 05m', a: 100, b: 79 },
    { name: 'Readiness', now: '66', base: '59', a: 100, b: 89 },
  ],
  says: '5 more days and life will tell you if it’s a real effect for you or just noise.',
} : null;
export const nextExperiments = ['Morning daylight', 'Bedtime 22:45', 'No screens in bed'];

/* ── What life remembers ── */

/** The three things life used today, as pictures (board copy). */
export const usedToday: { photo: PhotoName; focal: Focal; title: string; sub: string }[] = SHOW_SAMPLES ? [
  { photo: 'run', focal: { y: 0.45 }, title: 'Prefers morning workouts', sub: 'From 6 workouts' },
  { photo: 'payslip', focal: { y: 0.75 }, title: 'Paid on the 28th', sub: 'From your payslip' },
  { photo: 'bedroom', focal: { y: 0.75 }, title: 'Sleeps worse after late coffee', sub: 'From an experiment' },
] : [];
const memoryPhotos: Record<string, PhotoName> = { rent: 'keys', kofi: 'siblings', aim: 'keyshome' };
export const memoryPhoto = (id: string, category?: string): PhotoName => memoryPhotos[id] ?? (category === 'Body' ? 'walk' : category === 'People' ? 'birthday' : category === 'Money' ? 'payslip' : 'journal');
export const memoryFilters = ['All', 'Money', 'Body', 'People'] as const;

/* ── Shared life ── */

export const shared = SHOW_SAMPLES ? {
  partner: 'Sam', things: 4, ...seed.finance.shared,
  rows: [
    { photo: 'letter' as PhotoName, title: 'Council tax', sub: 'Due 1st · Sam pays', to: 'bill' as ScreenKey },
    { photo: 'home' as PhotoName, title: 'Energy bill', sub: '£96 · split 50/50', to: 'bill' as ScreenKey },
    { photo: 'cook' as PhotoName, title: 'Shopping list', sub: '6 items · Sam added 2', to: 'mealplan' as ScreenKey },
  ],
} : null;

/* ── Your details ── */

export const details = { born: '14 March 1999', bornShort: '14 March', work: 'Freelance designer', area: 'Hackney', payDay: '28th' };

/** How work reads on Your details for a real account, from the profile's work status. */
export const workWords: Record<string, string> = { employed: 'Employed', 'sole-trader': 'Self-employed', director: 'Company director', 'student-between': 'Studying or between jobs' };
/** "1st", "22nd", "28th": the pay day chosen in routines (`payday-day`). */
export const ordinalDay = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/**
 * "14 March 1999" (or "14 March" when short) from the date of birth the age check keeps on the profile. The sample
 * life keeps Ama's board date; a real account without one gets null, so the screen can ask for it.
 */
export function bornOn(profile: object, short = false): string | null {
  const iso = (profile as { dateOfBirth?: unknown }).dateOfBirth;
  const m = typeof iso === 'string' ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  if (m && MONTHS[Number(m[2]) - 1]) return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}${short ? '' : ` ${m[1]}`}`;
  return SHOW_SAMPLES ? (short ? details.bornShort : details.born) : null;
}

/* ───────────────────────── Know yourself ───────────────────────── */

export type TestKey = 'personality' | 'clock' | 'values' | 'money';
export const tests: { key: TestKey; photo: PhotoName; focal: Focal; name: string; what: string; why: string; time: string; to: ScreenKey }[] = [
  { key: 'personality', photo: 'desk', focal: { x: 0.78, y: 0.3 }, name: 'Personality', what: 'The Big Five · 10 min', why: 'How life words nudges, and how much it nudges', time: '10 min', to: 'bigfive' },
  { key: 'clock', photo: 'calmdesk', focal: { y: 0.92 }, name: 'Your body clock', what: 'Morning or evening type · 2 min', why: 'When life plans focus, workouts and wind-down', time: '2 min', to: 'chronotype' },
  { key: 'values', photo: 'freedom', focal: { y: 0.78 }, name: 'What matters most', what: 'Values', why: 'Shapes your Aim and bigger decisions', time: '3 min', to: 'values' },
  { key: 'money', photo: 'payslip', focal: { y: 0.89 }, name: 'You and money', what: 'Money mindset', why: 'How life talks about spending and saving', time: '3 min', to: 'tests' },
];
/** Which tests the sample life has done. */
export const sampleTestsDone: TestKey[] = SHOW_SAMPLES ? ['personality', 'clock'] : [];

export const likertLabels = ['Not like me at all', 'Not really', 'Somewhat', 'Mostly', 'Very like me'];
/** IPIP Big Five markers (public domain). Answers stay on the phone. */
export const personalityStatements = ['I am the life of the party.', 'I feel little concern for others.', 'I am always prepared.', 'I get stressed out easily.', 'I have a rich vocabulary.', 'I don’t talk a lot.', 'I am interested in people.', 'I leave my belongings around.', 'I am relaxed most of the time.', 'I have difficulty understanding abstract ideas.', 'I feel comfortable around people.', 'I insult people.', 'I pay attention to details.', 'I worry about things.', 'I have a vivid imagination.', 'I keep in the background.', 'I sympathise with others’ feelings.', 'I make a mess of things.', 'I seldom feel blue.', 'I am not interested in abstract ideas.', 'I start conversations.', 'I am not interested in other people’s problems.', 'I get chores done right away.', 'I am easily disturbed.', 'I have excellent ideas.', 'I have little to say.', 'I have a soft heart.', 'I often forget to put things back in their proper place.', 'I get upset easily.', 'I do not have a good imagination.', 'I talk to a lot of different people at parties.', 'I am not really interested in others.', 'I like order.', 'I change my mood a lot.', 'I am quick to understand things.', 'I don’t like to draw attention to myself.', 'I take time out for others.', 'I shirk my duties.', 'I have frequent mood swings.', 'I use difficult words.', 'I don’t mind being the centre of attention.', 'I feel others’ emotions.', 'I follow a schedule.', 'I get irritated easily.', 'I spend time reflecting on things.', 'I am quiet around strangers.', 'I make people feel at ease.', 'I am exacting in my work.', 'I often feel blue.', 'I am full of ideas.'];
export const moneyStatements = ['I feel calmer when I know where every pound is going.', 'I’d rather save for freedom than buy something today.', 'Unexpected bills make it hard for me to think clearly.', 'I’m comfortable talking about money with people close to me.', 'I leave room for enjoyment in my spending plan.'];

/** The Big Five read back in plain words: where each trait sits (0 to 100) and what it changes. */
export const bigFive = {
  sentence: 'You’re {curious} and {warm}, you {follow through}, and you recharge {on your own}.',
  traits: [
    { name: 'Openness', plain: 'Curious, likes new ideas', at: 80, so: 'life offers more experiments and new ideas' },
    { name: 'Conscientiousness', plain: 'Organised, follows through', at: 74, so: 'Fewer reminders; plans stay as you set them' },
    { name: 'Extraversion', plain: 'Energised by people', at: 26, so: 'Suggestions that work solo come first' },
    { name: 'Agreeableness', plain: 'Warm, cooperative', at: 76, so: 'Drafts stay friendly but firm when money’s at stake' },
    { name: 'Stress sensitivity', plain: 'Feels pressure strongly', at: 64, so: 'Gentler wording, and one thing at a time on hard days' },
  ],
};

/** Your body clock: the day from 6am to 11pm with each block placed where it works (percent of the day). */
export const bodyClock = {
  type: 'Moderate morning type', sleep: 'Your sleep agrees: you’re usually asleep by 23:20.',
  blocks: [{ left: 2.9, width: 11.8, icon: 'fitness' as const }, { left: 17.6, width: 17.6, icon: 'bulb' as const, deep: true }, { left: 64.7, width: 11.8, icon: 'fitness' as const }, { left: 90.4, width: 8.4, icon: 'moon' as const }],
  ticks: [[0, '6am'], [35.3, '12pm'], [70.6, '6pm'], [100, '11pm']] as [number, string][],
  rows: [
    { icon: 'bulb' as const, title: 'Deep work', sub: '9:00 – 12:00, your sharpest hours', to: 'focus' as ScreenKey },
    { icon: 'fitness' as const, title: 'Workouts', sub: 'Morning or early evening', to: 'workout' as ScreenKey },
    { icon: 'bell' as const, title: 'Nudges', sub: 'Never after 21:30', to: 'notifs' as ScreenKey },
    { icon: 'moon' as const, title: 'Wind-down', sub: 'Starts 22:30', to: 'sleepplan' as ScreenKey },
  ],
};

/** Your top five values, each with its photograph, and the order they started in. */
export const valuePhotos: Record<string, { photo: PhotoName; focal: Focal }> = {
  Freedom: { photo: 'freedom', focal: { y: 0.65 } }, Family: { photo: 'siblings', focal: { y: 0.51 } }, Growth: { photo: 'aimwrite', focal: { y: 0.49 } },
  Security: { photo: 'keyshome', focal: { y: 0.82 } }, Creativity: { photo: 'areawork', focal: { y: 0.54 } },
};
export const defaultValues = ['Freedom', 'Family', 'Growth', 'Security', 'Creativity'];
/** Card heights from first to fifth, largest first (board). */
export const valueHeights = [150, 116, 96, 80, 68];

/* ───────────────────────── Grow ───────────────────────── */

export type WeekKey = 'now' | 'w45' | 'w44';
export const weeks: Record<WeekKey, { tag: string; photo: PhotoName; focal: Focal; line: string }> = {
  now: { tag: 'This week · 10 – 16 Nov', photo: 'sunday', focal: { y: 0.78 }, line: `You cleared {@checkCircle 3 missions} and moved {@wallet £${seed.finance.bufferSavingMonthly}} to your buffer.` },
  w45: { tag: 'Week 45 · 3 – 9 Nov', photo: 'bedroom', focal: { y: 0.5 }, line: 'You found {@cash £840} and slept {@moon 7.1h} a night.' },
  w44: { tag: 'Week 44 · 27 Oct – 2 Nov', photo: 'desk', focal: { y: 0.5 }, line: 'You cleared {@checkCircle 1} mission.' },
};
export const weekStats = { missions: 3, missionsUp: 2, moved: seed.finance.bufferSavingMonthly, stackDays: 4, stackDots: '1011010' };

/** Your year, on your birthday: four calm figures (an archived sample review until a year has been lived in life). */
export const yearReview = SHOW_SAMPLES ? seedYearReview : null;

/** Vantage point: what the next level opens, in the board's words (index by the level you're heading to). */
export const vantageReach = ['', 'your cash plan, your tax and anything urgent', 'your routines, your money in full view, and your health stack', 'one bigger decision, made safely, with room to breathe', 'your assets, your safety nets and a season reset'];

/** Level up: the four pages of the moment. The first one speaks to the level just reached. */
export const levelupFirst: Record<number, { title: string; line: string }> = {
  1: { title: 'You’ve made a start.', line: 'life knows enough to help. Next, {your cash plan} and {anything urgent}.' },
  2: { title: 'You’re on stable ground.', line: 'Your cash plan is saved and {nothing is overdue}. Next, life puts {bills and care on a routine}.' },
  3: { title: 'Your routines are running.', line: 'Bills and care {look after themselves}. Next, life helps with {one bigger decision}.' },
  4: { title: 'You’ve built real momentum.', line: 'You made a big call {safely}. Next, life helps you {build assets and safety nets}.' },
};
export const levelupMore: { chip: string; title: string; line: string; photo: PhotoName; focal: Focal; to: 'body' | 'routines' | 'aim' }[] = [
  { chip: 'New: Body', title: 'Sleep, readiness and fuel.', line: 'Plan your day around {how you slept}, from a watch or ring {you connect}.', photo: 'run', focal: { y: 0.45 }, to: 'body' },
  { chip: 'New routine', title: 'Your payday sweep.', line: 'On payday, what’s left after bills {moves to your buffer}. {You approve every move.}', photo: 'sunday', focal: { y: 0.6 }, to: 'routines' },
  { chip: 'On your path', title: 'Closer to your Aim.', line: 'Your deposit is {DEPOSIT% of the way} to your first home.', photo: 'keyshome', focal: { y: 0.5 }, to: 'aim' },
];
