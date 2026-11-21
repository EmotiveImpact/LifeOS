/**
 * First open and the app's states: the 18+ age check, the recorded health-data consent, the order of setup, and the
 * words and figures the board shows that no engine produces yet. Screens read them from here, never inline.
 *
 * Both records live in `choices` as JSON (no schema change before Phase 21): `age-check` and `health-consent`.
 * The date of birth goes on the profile as `dateOfBirth`, which the phone store already maps to `profile.date_of_birth`.
 */
import { detectCrisis } from '@life/brain';
import type { UserProfile } from '@life/core/types';
import type { PhotoName } from '@/design/photos';
import type { ScreenKey } from '@/navigation/screens';
import type { SeedData } from './SeedProvider';
import { useSeed } from './SeedProvider';
import { SHOW_SAMPLES } from './sample';
import { HEALTH_CONSENT_VERSION, consentFrom, type HealthConsent, type HealthType } from '@/services/health/consent';
import { emptyHealth } from '@/services/health/ingest';
import { disconnectWearable } from '@/services/health/wearables';
import { engineSnapshot, money, seed, seedKnownRecords, seedTaxClaim } from './seed';

type Focal = { x?: number; y?: number };

/* ───────────────────────── The 18+ age check ───────────────────────── */

/** life is for adults at launch (SPEC 9.20). */
export const ADULT_AGE = 18;

export type AgeCheck = { result: 'adult' | 'under'; at: string };

const parse = <T,>(raw: string | undefined): T | null => { if (!raw) return null; try { return JSON.parse(raw) as T; } catch { return null; } };

export function readAgeCheck(data: SeedData): AgeCheck | null {
  return parse<AgeCheck>(data.choices['age-check']);
}

/** A real calendar date from three typed parts, or null. Years must be four digits. */
export function birthDate(day: string, month: string, year: string): Date | null {
  const d = Number(day), m = Number(month), y = Number(year);
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** Whole years between a birth date and now. */
export function ageOn(born: Date, now = new Date()): number {
  let age = now.getFullYear() - born.getFullYear();
  if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) age -= 1;
  return age;
}

/** What's wrong with a typed date, in plain words, or null when it's fine. */
export function birthDateProblem(day: string, month: string, year: string, now = new Date()): string | null {
  if (!day || !month || !year) return null;
  const born = birthDate(day, month, year);
  if (!born) return 'That isn’t a real date. Check the day, month and year.';
  if (born > now) return 'That date is in the future.';
  if (ageOn(born, now) > 120) return 'Check the year: it looks too long ago.';
  return null;
}

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * The age check. An adult's date of birth sets their age on the profile; someone under 18 is stopped, and their date
 * of birth is not kept. The result is remembered, so the check can't simply be retried with another date.
 */
export function useAgeCheck() {
  const { data, update } = useSeed();
  const check = readAgeCheck(data);
  const record = (born: Date) => {
    const age = ageOn(born);
    const result: AgeCheck = { result: age >= ADULT_AGE ? 'adult' : 'under', at: new Date().toISOString() };
    update(c => {
      const choices = { ...c.choices, 'age-check': JSON.stringify(result) };
      if (result.result === 'under') return { ...c, choices };
      const profile: UserProfile & { dateOfBirth?: string } = { ...c.profile, age, dateOfBirth: isoDay(born) };
      return { ...c, profile, choices };
    });
    return result.result;
  };
  return { check, passed: check?.result === 'adult', under: check?.result === 'under', record };
}

/* ───────────────────────── Health-data consent ───────────────────────── */

export { HEALTH_CONSENT_VERSION, type HealthConsent, type HealthType } from '@/services/health/consent';

export const HEALTH_TYPES: { key: HealthType; title: string; why: string; photo: PhotoName; focal: Focal; on: boolean }[] = [
  { key: 'sleep', title: 'Sleep', why: 'For your sleep need, debt and bedtime', photo: 'bedroom', focal: { y: 0.73 }, on: true },
  { key: 'heart', title: 'Heart rate and HRV', why: 'For your readiness score', photo: 'breathe', focal: { y: 0.36 }, on: true },
  { key: 'workouts', title: 'Workouts and steps', why: 'For your load', photo: 'run', focal: { y: 0.64 }, on: true },
  { key: 'food', title: 'Food and water', why: 'Only if you log them elsewhere', photo: 'breakfast', focal: { y: 0.73 }, on: false },
];

const defaultTypes = (): Record<HealthType, boolean> => Object.fromEntries(HEALTH_TYPES.map(h => [h.key, h.on])) as Record<HealthType, boolean>;

export function readHealthConsent(data: Pick<SeedData, 'choices'>): HealthConsent | null {
  return consentFrom(data.choices);
}

/**
 * Whether life may use health data. A recorded yes counts; a no or a withdrawal never does. The sample life (dev
 * builds) counts as a yes until you say no, so every Body screen can still be seen.
 */
export function healthAllowed(data: SeedData): boolean {
  if (readHealthConsent(data)) return true;
  if (data.choices['health-consent-declined'] || data.choices['health-consent-withdrawn']) return false;
  return SHOW_SAMPLES;
}

export function useHealthConsent() {
  const { data, update } = useSeed();
  const consent = readHealthConsent(data);
  const give = (from: HealthConsent['from'], types?: Partial<Record<HealthType, boolean>>) => update(c => {
    const prior = readHealthConsent(c);
    const next: HealthConsent = { version: HEALTH_CONSENT_VERSION, at: new Date().toISOString(), scope: ['body', 'readings', 'logs'], types: { ...defaultTypes(), ...prior?.types, ...types }, from };
    return { ...c, choices: { ...c.choices, 'health-consent': JSON.stringify(next), 'health-consent-declined': '', 'health-consent-withdrawn': '' } };
  });
  /** Keeps the yes and its date, and records which reading types are on. */
  const setTypes = (types: Partial<Record<HealthType, boolean>>) => update(c => {
    const prior = readHealthConsent(c);
    if (!prior) return c;
    return { ...c, choices: { ...c.choices, 'health-consent': JSON.stringify({ ...prior, types: { ...prior.types, ...types } }) } };
  });
  const decline = () => update(c => ({ ...c, choices: { ...c.choices, 'health-consent': '', 'health-consent-declined': new Date().toISOString() } }));
  /** Stops all health use at once: the yes is cleared, its withdrawal dated, and connected sources switched off. */
  const withdraw = () => {
    // A connected WHOOP or Oura is disconnected too, so the life API drops its sealed tokens.
    for (const id of ['whoop', 'oura'] as const) if (data.flags[`device-${id}`]) void disconnectWearable(id);
    withdrawHere();
  };
  const withdrawHere = () => update(c => {
    const flags = Object.fromEntries(Object.entries(c.flags).map(([k, v]) => [k, k === 'health-connected' || k.startsWith('device-') ? false : v]));
    // Everything imported goes too: life keeps nothing about the body once the yes is withdrawn.
    return { ...c, flags, health: emptyHealth(), choices: { ...c.choices, 'health-consent': '', 'health-consent-withdrawn': new Date().toISOString() } };
  });
  return { consent, given: !!consent, allowed: healthAllowed(data), declined: !!data.choices['health-consent-declined'], withdrawnAt: data.choices['health-consent-withdrawn'] || null, give, setTypes, decline, withdraw };
}

/** "20 November 2026", for "You said yes on …". */
export const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* ───────────────────────── Setup order ───────────────────────── */

/**
 * The order of first open. Welcome → age → one question → where you live → health consent → body numbers → what you
 * wear → Apple Health → nudges → your Aim → building your plan → save your progress → your first move.
 * Saying no to health skips the body steps.
 */
export function nextAfterConsent(allowed: boolean): ScreenKey { return allowed ? 'measuresetup' : 'notifprimer'; }

export const CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Bristol', 'Cardiff', 'Belfast'] as const;

export const WORK: { value: UserProfile['workStatus']; label: string }[] = [
  { value: 'employed', label: 'Employed' },
  { value: 'sole-trader', label: 'Self-employed' },
  { value: 'director', label: 'Director of my company' },
  { value: 'student-between', label: 'Studying or between jobs' },
];

export const DESTINATIONS: { value: UserProfile['destination']; label: string }[] = [
  { value: 'buy-home', label: 'Buy my first home' },
  { value: 'fix-stabilize', label: 'Clear the chaos' },
  { value: 'launch-business', label: 'Launch or grow a business' },
  { value: 'health-longevity', label: 'Get healthier' },
  { value: 'level-up-career', label: 'Earn more' },
];

export const TELL_TOPICS: { photo: PhotoName; focal: Focal; title: string; heard: RegExp }[] = [
  { photo: 'terrace', focal: { x: 0.66 }, title: 'Where you live and who with', heard: /\b(live|living|flat|house|rent|renting|move|moved|with my|alone|partner|flatmate|city|london|manchester)\b/i },
  { photo: 'desk', focal: { x: 0.88 }, title: 'What you do for work', heard: /\b(work|job|employ|self-employed|freelance|designer|business|company|salary|boss|career)\b/i },
  { photo: 'payslip', focal: { y: 1 }, title: 'Anything worrying you about money', heard: /\b(money|debt|owe|bill|bills|tax|overdraft|loan|credit|savings|save|pay|payslip|afford)\b/i },
  { photo: 'walk', focal: { y: 0.15 }, title: 'Health things you’ve been putting off', heard: /\b(health|doctor|gp|dentist|sleep|tired|back|knee|weight|exercise|gym|run|referral|appointment)\b/i },
  { photo: 'keyshome', focal: { y: 0.9 }, title: 'Where you want to be in a few years', heard: /\b(years|future|want to|hope|plan|goal|dream|buy a home|own|someday|eventually)\b/i },
];

/* ───────────────────────── Building your plan ───────────────────────── */

/** What setup found, from the engine: money you may be owed, the urgent deadline, and the things to set up. */
export function planFound(profile: UserProfile, completed: string[] = []) {
  const { tasks } = engineSnapshot(profile, completed);
  const council = tasks.find(t => t.id === 'uk-single-person-council');
  const lisa = tasks.find(t => t.id === 'uk-lifetime-isa');
  const startup = tasks.find(t => t.id === 'uk-startup-loan');
  const urgent = tasks.filter(t => t.urgency === 'urgent');
  // The tax refund is the sample life's own P800. A real account's tax line appears only when the engine suggests a code check.
  const tax = SHOW_SAMPLES ? undefined : tasks.find(t => t.id === 'uk-hmrc-tax-code');
  const owed = (SHOW_SAMPLES ? seedTaxClaim.refund : tax?.estimatedValueAmount ?? 0) + (council?.estimatedValueAmount ?? 0) + (lisa?.estimatedValueAmount ?? 0);
  const setUp = tasks.filter(t => (t.chapter === 1 || t.chapter === 2) && t.urgency !== 'urgent').length;
  const schemes = [startup ? 'Start Up Loans' : null, lisa ? 'LISA' : null].filter(Boolean) as string[];
  const referral = urgent.find(t => t.id === 'nhs-outpatient-referral');
  const findings: { photo: PhotoName; focal: Focal; tag: string; urgent?: boolean; title: string; sub: string; to: ScreenKey }[] = [
    ...(SHOW_SAMPLES ? [{ photo: 'payslip' as const, focal: { y: 1 }, tag: `${money(seedTaxClaim.refund)} back`, title: 'Your tax record', sub: 'HMRC · 2024/25', to: 'taxcheck' as const }]
      : tax ? [{ photo: 'payslip' as const, focal: { y: 1 }, tag: tax.estimatedValueAmount ? `About ${money(tax.estimatedValueAmount)}` : 'Worth a check', title: 'Your tax code', sub: 'HMRC · this tax year', to: 'taxcheck' as const }] : []),
    ...(council ? [{ photo: 'terrace' as const, focal: { x: 0.72 }, tag: '25% off', title: 'Council tax discounts', sub: profile.city ? `${profile.city} · single occupancy` : 'Single occupancy', to: 'bill' as const }] : []),
    ...(referral ? [{ photo: 'walk' as const, focal: { y: 0.3 }, tag: 'Urgent', urgent: true, title: 'NHS waiting times', sub: SHOW_SAMPLES ? 'Cardiology · Guy’s' : profile.referralSpecialty || 'Your referral', to: 'areahealth' as const }] : []),
    ...(schemes.length ? [{ photo: 'keyshome' as const, focal: { y: 0.88 }, tag: `${schemes.length} found`, title: 'Schemes you qualify for', sub: schemes.join(' · '), to: 'missions' as const }] : []),
  ];
  return { owed, urgent: urgent.length, setUp, findings };
}

/* ───────────────────────── States ───────────────────────── */

const seedIds = new Set(seedKnownRecords.map(r => r.id));

/**
 * Day one: a real account (no sample life) that hasn't filed anything of its own yet. Today and Plan show the board's
 * day-one states until then, never a zero dressed up as a reading.
 */
export function isDayOne(data: SeedData): boolean {
  return !SHOW_SAMPLES && !data.records.some(r => r.status === 'confirmed' && !seedIds.has(r.id));
}

/** Money offline: what was saved on this phone, and when. Sample figures (dev builds) until sync lands (Phase 22). */
export const offlineMoney = {
  savedAgo: '2h ago',
  balance: seed.finance.balance,
  days14: Array.from({ length: 14 }, (_, k) => (k < 12 ? 'on' : 'miss') as 'on' | 'miss'),
  unsynced: 2,
  saved: [
    { photo: 'terrace' as PhotoName, focal: { x: 0.7 }, title: 'Rent', sub: 'Standing order · yesterday', amount: 1150 },
    { photo: 'payslip' as PhotoName, focal: { y: 0.82 }, title: 'Moved to buffer', sub: 'Payday sweep', amount: 180 },
  ],
};

/** The tax year in months: the one on this phone (full) and this one, counted from 6 April. */
export function taxYearMonths(now = new Date()) {
  const start = new Date(now.getFullYear(), 3, 6);
  const began = now >= start ? start : new Date(now.getFullYear() - 1, 3, 6);
  const months = (now.getFullYear() - began.getFullYear()) * 12 + now.getMonth() - began.getMonth() - (now.getDate() < 6 ? 1 : 0);
  return { into: Math.max(0, Math.min(11, months)), began };
}

/** The helplines on Support, plain and checked: free, confidential, any time. */
export const HELPLINES = [
  { name: 'Samaritans', number: '116 123', how: 'Call · any time', action: 'Call', url: 'tel:116123' },
  { name: 'Shout', number: '85258', how: 'Text SHOUT to 85258', action: 'Text', url: 'sms:85258?body=SHOUT' },
  { name: 'NHS 111', number: '111', how: 'Choose the mental health option', action: 'Call', url: 'tel:111' },
] as const;

/** For someone under 18: Childline is free and confidential. */
export const CHILDLINE = { number: '0800 1111', url: 'tel:08001111', web: 'childline.org.uk' } as const;

/** What still works when chat is paused, as pictures. */
export const STILL_WORKING: { photo: PhotoName; focal: Focal; title: string; to: ScreenKey }[] = [
  { photo: 'desk', focal: { x: 0.74 }, title: 'Today', to: 'today' },
  { photo: 'payslip', focal: { y: 0.8 }, title: 'Missions', to: 'missions' },
  { photo: 'work', focal: {}, title: 'Tools', to: 'tools' },
  { photo: 'run', focal: { y: 0.62 }, title: 'Body', to: 'body' },
];

/** Body from the phone alone (no watch or ring): steps and a sleep estimate. Sample figures until Phase 26 reads the phone. */
export const phoneOnly = { steps: 6240, sleep: '~7h' };

/** A device that stopped syncing: which one, and when it last sent anything. Sample until Phase 26 watches sync times. */
export const quietDevice = { name: 'Oura', last: 'yesterday', url: 'oura://' };

/** Two phones changed the same thing while offline (Phase 22 brings real conflicts). Phone only at launch, so "your other phone". */
export const syncConflict = { label: 'pay day', here: 28, there: 25, where: 'your other phone' };

/** The week on the share card: nothing personal, no £ unless chosen. Sample week until the recap engine lands (Phase 27). */
export const shareWeek = { missions: 3, nights: '1101110', habits: 3 };
/** The week on the share card: the board's week for the sample life, a real account's own (missions, nights of 7h+). */
export function shareWeekOf(data: Pick<SeedData, 'completed' | 'health'>): typeof shareWeek {
  if (SHOW_SAMPLES) return shareWeek;
  const days = data.health.days.slice(-7);
  const nights = Array.from({ length: 7 }, (_, i) => { const sleep = days[days.length - 7 + i]?.sleep; return sleep && sleep.asleepMinutes >= 420 ? '1' : '0'; }).join('');
  return { missions: data.completed.length, nights, habits: 0 };
}

/** ISO week number, for "Week 46" on the share card. */
export function isoWeek(d = new Date()): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - start.getTime()) / 86400000 + 1) / 7);
}

/** Which day of life this is, counted from the age check on first open (day 1 if unknown). */
export function lifeDay(data: SeedData, now = new Date()): number {
  const at = readAgeCheck(data)?.at;
  if (!at) return 1;
  const a = new Date(at), b = now;
  const days = Math.floor((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
  return Math.max(1, days + 1);
}

/** Messages typed while chat was paused, answered when it is back. Kept on the phone in `choices`. */
export function readChatQueue(data: SeedData): string[] {
  try { const v = JSON.parse(data.choices['chat-queue'] ?? '[]'); return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []; } catch { return []; }
}

/**
 * Words that need support now, not filing: the brain's own crisis check (`detectCrisis` in packages/brain),
 * the same one `runBrain` runs before any model, so setup and Talk can never drift apart. Setup's
 * "Or just tell life" files nothing and opens Support when it fires, as Talk does.
 */
export const needsSupport = (text: string) => detectCrisis(text) !== null;
