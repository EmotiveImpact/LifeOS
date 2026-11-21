import { computeHealthTargets, computeIncomeBreakdown, computeLifeAreaProgress, computeLifeLevelState, computeLifeScore, DEFAULT_HEALTH_SNAPSHOT, DEFAULT_PROFILE, getEligibleTasks, TASK_CATALOG } from '@life/core/engine';
import { compareUKBusinessStructures } from '@life/core/finance';
import { compareRentAndBuy, type RentBuyInputs } from '@life/core/housing';
import type { LabMarkerId, LabResult, SubscriptionItem, UserProfile } from '@life/core/types';
import type { Area } from '@/design/tokens';
import type { MemoryKind } from '@life/brain';

/** Local-only Track A fixtures. Observations are sample readings, not calculated scores.
 * Tax, take-home, life level, task values and health targets use core.
 * New health/Fuel algorithms remain seeded previews until Track B (core is unchanged). */
export const SEED_DATE = '2026-11-16';
export const seedSubscriptions: SubscriptionItem[] = [
  { id: 'adobe', name: 'Adobe Creative Cloud', monthlyCost: 56.98, category: 'Software', essential: true, cancelled: false },
  { id: 'netflix', name: 'Netflix', monthlyCost: 12.99, category: 'Media', essential: false, cancelled: false },
  { id: 'gym', name: 'Gym Group', monthlyCost: 18.99, category: 'Fitness', essential: false, cancelled: false },
  { id: 'icloud', name: 'iCloud+ 200GB', monthlyCost: 2.99, category: 'Software', essential: true, cancelled: false },
];
export const seedSubscriptionDetails: Record<string, string> = { adobe: 'Renews in 4 days', netflix: 'Not used in 74 days', gym: 'Not used in 61 days', icloud: 'Renews 2 Dec' };
export const seedProfile: UserProfile = {
  ...DEFAULT_PROFILE, name: 'Ama', age: 27, workStatus: 'sole-trader', annualIncome: 48000,
  isBusinessOwner: true, destination: 'buy-home', householdSize: 1,
  monthlyPensionPct: 5, employerMatchPct: 3, habitStreakDays: 4, subscriptions: seedSubscriptions,
  health: { ...DEFAULT_HEALTH_SNAPSHOT, weightKg: 74.2, trainingDays: 4, waterMlToday: 1400, sleepHoursAvg: 7 + 10 / 60 },
};
export const seedPulseLog = ['calm', 'calm', 'driven', 'peaceful', 'restless', 'drained', 'calm', 'calm', 'driven', 'peaceful', 'anxious', 'calm', 'peaceful', 'calm'].map((moodId, i) => ({ at: new Date(Date.UTC(2026, 10, i + 3, 8)).toISOString(), moodId, x: .5, y: .5 }));
export const moodLines: Record<string, [string, string]> = {
  calm: ['A clear head today.', 'Good day for the form you’ve been putting off.'],
  driven: ['You’ve got energy.', 'Put it into your one bigger move.'],
  restless: ['Let’s burn it off.', 'Three five-minute wins first.'],
  anxious: ['Let’s make it smaller.', 'Only what’s due this week is showing.'],
  drained: ['Go gently today.', 'One small thing, then rest.'],
  peaceful: ['A soft, steady day.', 'Health and home come first.'],
};
export const money = (n: number, decimals = 0) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
export const moneyCompact = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', notation: 'compact', maximumFractionDigits: 1 }).format(value).replace('K', 'k').replace('M', 'm');
export function engineSnapshot(profile = seedProfile, completed: string[] = []) {
  const tasks = getEligibleTasks(profile, completed);
  return { tasks, income: computeIncomeBreakdown(profile), level: computeLifeLevelState(profile, tasks, completed), score: computeLifeScore(profile, completed), areas: computeLifeAreaProgress(profile, tasks, completed), targets: computeHealthTargets(profile.health ?? DEFAULT_HEALTH_SNAPSHOT), structures: compareUKBusinessStructures(profile) };
}
const payslipProfile: UserProfile = { ...seedProfile, annualIncome: 30000, workStatus: 'employed', isBusinessOwner: false, monthlyPensionPct: 0, employerMatchPct: 0, taxSettings: {}, taxCode: '1257L' };
export const seedPayslip = computeIncomeBreakdown(payslipProfile);
// Whole-pound picture labels must still add up after presentation rounding.
export const seedPayslipPicture = { pay: Math.round(seedPayslip.grossMonthly), free: Math.floor((seedPayslip.uk?.personalAllowance ?? 0) / 12), taxed: Math.round(seedPayslip.grossMonthly) - Math.floor((seedPayslip.uk?.personalAllowance ?? 0) / 12) };
const codedPay = computeIncomeBreakdown({ ...payslipProfile, taxCode: '961L' });
const workExpenses = 1240;
const afterExpenseClaim = computeIncomeBreakdown({ ...payslipProfile, annualIncome: payslipProfile.annualIncome - workExpenses });
export const seedTaxClaim = {
  workExpenses,
  expenseRelief: Math.round(seedPayslip.incomeTaxAnnual - afterExpenseClaim.incomeTaxAnnual),
  refund: Math.round(Math.max(0, (codedPay.uk?.estimatedWithholdingAnnual ?? codedPay.incomeTaxAnnual) - afterExpenseClaim.incomeTaxAnnual)),
  reference: 'P800-7Q2-K41',
  note: 'Illustrative annual PAYE/expense scenario, calculated by the existing engine; not a live HMRC record.',
};
/** A bill or subscription as Talk filed it: who is paid, how much, how often (when said) and the day it's due. */
export type MoneyDetails = { kind: 'bill'; payee: string; amount: number; frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'; dueDay?: number } | { kind: 'subscription'; service: string; amount: number; frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' };
export type FiledRecord = { id: string; kind: 'fact' | 'insight' | 'mission' | 'decision' | 'goal' | 'answer'; area: Area; label: string; value?: string | number; details?: MoneyDetails; profilePatch?: Partial<UserProfile>; taskId?: string; source: { type: 'talk' | 'chat' | 'question' | 'document' | 'record'; at: string; excerpt?: string }; status: 'proposed' | 'confirmed' | 'removed' };
export type MemoryCategory = 'Money' | 'Body' | 'People';
/** One thing life remembers (services/memory.ts). `validTo` set: no longer true, kept for the record, never used to answer. */
export type MemoryEntry = { id: string; text: string; source: string; category?: MemoryCategory; recordId?: string; kind?: MemoryKind; confidence?: number; validFrom?: string; validTo?: string; lastUsed?: string; uses?: number };
export const seedMemoryCategories: Record<string, MemoryCategory> = { rent: 'Money', kofi: 'People', aim: 'Money' };
export type ChiefAim = { what: string; when: string; give: string; plan: string; createdAt: string; history: string[]; readLog: string[] };
export const seedAim: ChiefAim = { what: 'own a two-bed flat in South London', when: 'June 2029', give: 'save £800 a month and grow my design rate by 20%', plan: 'lifetime ISA first, then a mortgage in principle by 2028', createdAt: SEED_DATE, history: [], readLog: Array.from({ length: 21 }, (_, i) => `${new Date(Date.UTC(2026, 9, 27 + i)).toISOString().slice(0, 10)}-morning`) };
/** Paged UI-repository metadata from the board. Facts coverage is a Track A
 * fixture, not the core’s area-readiness metric or a claimed live calculation. */
export const seedKnowledge = { overall: 64, recordCount: 214, areas: { you: 70, home: 55, work: 40, money: 75, health: 45, goal: 30 } as Record<Area, number> };
export const knowledgeLabels: Record<Area, string> = { you: 'You', home: 'Home', work: 'Work', money: 'Money', health: 'Health', goal: 'Goals' };
export const seedKnownRecords: FiledRecord[] = [
  { id: 'age', kind: 'fact', area: 'you', label: 'Age 27, London', value: 27, source: { type: 'talk', at: '2026-11-12', excerpt: 'From your talk · 12 Nov' }, status: 'confirmed' },
  { id: 'home', kind: 'fact', area: 'home', label: 'Lives alone', value: 1, source: { type: 'talk', at: '2026-11-12', excerpt: 'From your talk · 12 Nov' }, status: 'confirmed' },
  { id: 'work', kind: 'fact', area: 'work', label: 'Self-employed designer', source: { type: 'talk', at: '2026-11-12', excerpt: 'From your talk · 12 Nov' }, status: 'confirmed' },
  { id: 'rent', kind: 'fact', area: 'money', label: `Rent ${money(1150)} a month`, value: 1150, source: { type: 'talk', at: '2026-11-12', excerpt: 'From your talk · 12 Nov' }, status: 'confirmed' },
  { id: 'referral', kind: 'fact', area: 'health', label: 'Heart referral, 11 weeks', source: { type: 'record', at: SEED_DATE, excerpt: 'From your NHS record' }, status: 'confirmed' },
  { id: 'buffer-known', kind: 'goal', area: 'money', label: `Buffer target ${money(1820 * 3)}`, value: 1820 * 3, source: { type: 'record', at: SEED_DATE, excerpt: 'From an idea you read' }, status: 'confirmed' },
  { id: 'aim', kind: 'goal', area: 'goal', label: 'Own a two-bed flat by June 2029', source: { type: 'record', at: SEED_DATE, excerpt: 'Your Chief Aim' }, status: 'confirmed' },
  { id: 'sleep-known', kind: 'fact', area: 'health', label: 'Average sleep 6h 58m', source: { type: 'record', at: SEED_DATE, excerpt: 'From Apple Health' }, status: 'confirmed' },
];
export const seedRecords: FiledRecord[] = [
  { id: 'age', kind: 'fact', area: 'you', label: 'Age 27, London', value: 27, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'home', kind: 'fact', area: 'home', label: 'Lives with 2 flatmates', value: 3, profilePatch: { householdSize: 3 }, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'work', kind: 'fact', area: 'work', label: 'Self-employed designer', profilePatch: { workStatus: 'sole-trader' }, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'rebate', kind: 'mission', area: 'money', label: 'Overpaid tax in 2024/25', source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'referral', kind: 'mission', area: 'health', label: 'Heart referral, 11 weeks', source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'aim', kind: 'goal', area: 'goal', label: 'Buy a first home', source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'rent', kind: 'fact', area: 'money', label: `Rent ${money(1150)} a month`, value: 1150, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
];
export type SeedPerson = { id: string; name: string; relation: string; date: string; days: number; note: string; summary?: string; shortDate?: string };
export const seedPeople: SeedPerson[] = [
  { id: 'kofi', name: 'Kofi', relation: 'Brother', date: '18 November', days: 4, note: 'Running vest · “his old one’s falling apart”', summary: 'Birthday Saturday · turning 31', shortDate: 'Sat' },
  { id: 'efua', name: 'Grandma Efua', relation: 'Grandma', date: '14 December', days: 30, note: 'Call every two weeks.', summary: 'Called 2 weeks ago' },
  { id: 'priya', name: 'Priya', relation: 'Friend', date: '2 December', days: 18, note: '', summary: 'Birthday 2 Dec', shortDate: '2 Dec' },
  { id: 'sam', name: 'Sam', relation: 'Partner', date: '9 January', days: 56, note: '', summary: 'Anniversary 9 Jan', shortDate: '9 Jan' },
  { id: 'tom', name: 'Tom', relation: 'Friend', date: '', days: 0, note: '', summary: 'Haven’t spoken in 6 weeks' },
  { id: 'mum', name: 'Mum', relation: 'Family', date: '29 November', days: 15, note: 'Call on Sundays.' },
  { id: 'daniel', name: 'Daniel Okafor', relation: 'Friend', date: '30 April', days: 167, note: '' },
  { id: 'hannah', name: 'Hannah Lee', relation: 'Friend', date: '', days: 0, note: '' },
  { id: 'sarah', name: 'Sarah', relation: 'Friend', date: '12 January', days: 59, note: 'Met at work.' },
  { id: 'ama-sister', name: 'Ama', relation: 'Sister', date: '3 March', days: 109, note: 'Birthday plans · from Talk.' },
  { id: 'kwame', name: 'Grandpa Kwame', relation: 'Grandpa', date: '14 December', days: 0, note: 'Remembered quietly · no reminder.' },
  { id: 'noa', name: 'Noa', relation: 'Friend', date: '', days: 0, note: '' },
];
export const seedDocuments = [
  { id: 'insurance', name: 'Car insurance', expires: '14 February 2027', actFrom: '22 January 2027', reference: 'POL-48210', summary: 'Renews 14 Feb · compare from 22 Jan', status: 'Act now' },
  { id: 'mot', name: 'Car MOT', expires: '12 January 2027', actFrom: '12 December 2026', reference: 'Saved from your document', summary: 'Due 12 Jan', status: '' },
  { id: 'passport', name: 'Passport', expires: '12 August 2027', expiresISO: '2027-08-12', actFrom: 'February 2027', reference: '•••• 4821', summary: 'Expires Aug 2027', status: '' },
  { id: 'railcard', name: 'Railcard', expires: '3 March 2027', actFrom: 'February 2027', reference: 'Saved from your document', summary: 'Expires 3 Mar', status: '' },
  { id: 'licence', name: 'Driving licence photo', expires: '2031', actFrom: '2030', reference: 'Saved from your document', summary: 'Expires 2031', status: 'Sorted' },
  { id: 'tv', name: 'TV Licence', expires: 'October 2027', actFrom: 'September 2027', reference: 'Saved from your document', summary: 'Paid to Oct 2027', status: 'Sorted' },
];
/** One part of a meal. `needsFigures` marks a part a photo named but gave no figures for (Phase 27). */
export type MealItem = { name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number; fibre: number; confidence: number; needsFigures?: true };
export const seedMeal: MealItem[] = [
  { name: 'Salmon', grams: 120, kcal: 247, protein: 26, carbs: 0, fat: 15, fibre: 0, confidence: .9 },
  { name: 'Rice', grams: 150, kcal: 195, protein: 4, carbs: 43, fat: 0, fibre: 1, confidence: .8 },
  { name: 'Avocado', grams: 50, kcal: 80, protein: 1, carbs: 4, fat: 7, fibre: 3, confidence: .75 },
  { name: 'Edamame', grams: 40, kcal: 48, protein: 5, carbs: 4, fat: 2, fibre: 2, confidence: .9 },
  { name: 'Egg', grams: 50, kcal: 70, protein: 7, carbs: 0, fat: 5, fibre: 0, confidence: .9 },
];
export type SeedHabit = { id: string; name: string; cue: string; last14: (boolean | undefined)[]; day?: number; automaticity?: number; source?: string; shortCue?: string; autoComplete?: boolean };
export const seedHabitStrength = { name: 'Morning walk', strength: 71, beforeMiss: 73, day: 38, typicalDays: 66 };
export const seedYearReview = {
  missionsCleared: 41,
  ideasLearned: 26,
  aimProgressChangePct: 38,
  // Archived observation from the reference, not a sum of current eligible tasks.
  foundOrSaved: 3180,
  source: 'Illustrative archived year review from v17',
};
export const seedLabResults: Partial<Record<LabMarkerId, LabResult>> = { 'bw-vitd': { value: 38, unit: 'nmol/L' }, 'bw-ferritin': { value: 64, unit: 'µg/L' }, 'bw-hba1c': { value: 36, unit: 'mmol/mol' }, 'bw-apob': { value: 1.1, unit: 'g/L' } };
export const seedLabMarkerPositions: Partial<Record<LabMarkerId, number>> = { 'bw-vitd': 18, 'bw-ferritin': 52, 'bw-hba1c': 40, 'bw-apob': 78 };
export const seed = {
  membership: { annual: 79.99, monthly: 7.99, annualRenewal: 79.99 },
  date: SEED_DATE,
  body: { heightCm: 172, weightKg: 74.2, waistCm: 84, bodyFatPct: 22, sexAtBirth: 'Female', activity: 'Active', bp: '118 / 76', bmi: 25.1, waistRatio: .49, rhr: 54, vo2: 44 },
  health: { readiness: 72, sleepMinutes: 430, sleepNeed: 480, sleepDebt: 130, load: 6.2, loadTarget: [11, 14] as [number, number], hrv: 58, hrvBaseline: 52, rhr: 54, resp: 14.8, stress: 1.4, regularity: 78, fitnessAge: 24, loadRatio: 1.12, steps: 8240, waterMl: 1400, forecast: 68,
    sleepTrend: [6.2, 7.1, 6.8, 7.5, 7.2, 8.1, 7.17], readinessTrend: [62, 68, 65, 74, 69, 80, 72], weightTrend: [76.6, 76.1, 75.8, 75.5, 75, 74.8, 74.2],
    sleepWindows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({ day, start: [23.2, 23.4, 23.1, 23.6, 24.1, 25.2, 24.6][i], end: [30.9, 31, 30.8, 31.1, 31.4, 33.1, 32.6][i], highlight: i > 4 })),
    zones: [{ name: 'Zone 5', range: '176–190', minutes: 8 }, { name: 'Zone 4', range: '162–175', minutes: 22 }, { name: 'Zone 3', range: '148–161', minutes: 41 }, { name: 'Zone 2', range: '134–147', minutes: 164 }, { name: 'Zone 1', range: '120–133', minutes: 58 }],
    stages: [{ stage: 'light' as const, minutes: 65 }, { stage: 'deep' as const, minutes: 90 }, { stage: 'rem' as const, minutes: 44 }, { stage: 'awake' as const, minutes: 10 }, { stage: 'light' as const, minutes: 153 }, { stage: 'rem' as const, minutes: 68 }],
  },
  fuel: { kcal: 2300, targetWeight: 70, pace: .5, protein: 140, carbs: 260, fat: 75, fibre: 30, eaten: 1060, burned: 600, mealFit: 8.4, macros: [{ label: 'Protein', value: 112, max: 140, unit: 'g' }, { label: 'Carbs', value: 150, max: 260, unit: 'g' }, { label: 'Fat', value: 48, max: 75, unit: 'g' }],
    savedMeals: [{ name: 'Usual breakfast', detail: 'Yoghurt, berries, oats', kcal: 420 }, { name: 'Salmon rice bowl', detail: 'From Itsu', kcal: 705 }, { name: 'Chicken wrap', detail: 'Homemade', kcal: 560 }, { name: 'Protein shake', detail: 'Whey + oat milk', kcal: 240 }],
    nutrients: [{ label: 'Protein', value: 112, max: 140, unit: 'g' }, { label: 'Fibre', value: 21, max: 30, unit: 'g' }, { label: 'Sugar', value: 48, max: 90, unit: 'g' }, { label: 'Salt', value: 4.1, max: 6, unit: 'g' }, { label: 'Saturated fat', value: 14, max: 20, unit: 'g' }, { label: 'Iron', value: 9.2, max: 14.8, unit: 'mg' }, { label: 'Calcium', value: 820, max: 700, unit: 'mg' }, { label: 'Vitamin D', value: 3, max: 10, unit: 'µg' }],
  },
  finance: {
    rent: 1150, councilTaxAnnual: 1812, councilTaxMonthly: 148, balance: 2340.5, deposit: 11760, depositGoal: 49000,
    income: 48000, structureProfit: 50000, accountantFees: 1000, savingsMonthly: 800, bufferSavingMonthly: 180,
    insuranceRenewal: 612, insuranceQuote: 488, bufferMonths: 3, essentials: 1820,
    cashplan: { comingIn: 2410, essentialBills: 1820, taxSetAside: 300 },
    niRecord: { years: 9, targetYears: 35, gapYear: '2021/22', indicativeCost: 900, indicativeAnnualPension: 340 },
    balanceChange: { pct: 12.4, amount: 260.2 },
    accounts: [{ name: 'Everyday', amount: 612.4 }, { name: 'Bills pot', amount: 1148.1 }, { name: 'Buffer', amount: 580 }],
    expenses: [{ name: 'Rent', amount: 1150 }, { name: 'Bills', amount: 240 }, { name: 'Food', amount: 280 }, { name: 'Travel', amount: 150 }],
    transactions: [{ name: 'Salary · Acme Ltd', detail: 'Income', amount: 2410.66 }, { name: 'Rent', detail: 'Standing order', amount: -1150 }, { name: 'Moved to buffer', detail: 'Payday sweep', amount: -180 }, { name: 'Adobe Creative Cloud', detail: 'Subscription', amount: -56.98 }],
    payment: { name: 'Tesco', detail: '14 Nov, 18:22', amount: -42.17 },
    budget: [{ name: 'Rent', spent: 950, limit: 950 }, { name: 'Groceries', spent: 186, limit: 240 }, { name: 'Going out', spent: 142, limit: 150 }, { name: 'Transport', spent: 48, limit: 120 }, { name: 'Tax pot', spent: 680, limit: 680 }],
    netWorth: [{ name: 'Savings and ISA', amount: 12400 }, { name: 'Pension', amount: 14880 }, { name: 'Student loan', amount: -3800 }],
    netWorthGain: 6120,
    balanceHistory: Array.from({ length: 41 }, (_, i) => i === 40 ? 2340.5 : 1420 + i * 22 + Math.round(Math.sin(i * .7) * 60) + (i > 36 ? (i - 36) * 40 : 0)),
    shared: { deposit: 14200, target: 30000, yours: 8600, sam: 5600 },
  },
  habits: [
    { id: 'water', name: 'Water before coffee', cue: 'After the kettle boils, I will drink a glass of water, in the kitchen.', shortCue: 'After the kettle boils · from Apple Health', day: 41, automaticity: 4, source: 'from Apple Health', last14: [true, true, true, false, true, true, true, true, true, true, true, true, true, true] },
    { id: 'daylight', name: '10 minutes of daylight', cue: 'After breakfast, I will step outside for 10 minutes.', shortCue: 'After breakfast · outside', day: 23, last14: [true, true, true, false, true, true, true, true, false, true, true, true, true, true] },
    { id: 'bed', name: 'In bed by 22:50', cue: 'After brushing my teeth, I will put my phone on the charger in the kitchen.', shortCue: 'After brushing teeth', day: 12, last14: [true, true, false, true, true, true, true, true, true, true, true, true, false, false] },
  ] as SeedHabit[],
  lesson: { topic: 'Tax codes', title: 'What your tax code really means', bites: ['A code, not a tax rate', 'How it works each payday', 'What to check on your payslip'], recap: ['Your tax code tells your employer how much pay is tax-free.', 'The number usually means your allowance, divided by ten.', 'Check your code against your payslip and HMRC record.'], explainBack: 'Explain your tax code to a friend in two sentences.' },
};
export const rentBuyInputs: RentBuyInputs = { price: 425000, deposit: 42500, availableCash: seed.finance.balance, emergencyBuffer: 6000, purchaseCosts: 6500, saleCostsPct: 2, rentMonthly: seed.finance.rent, ownerCostsMonthly: 250, mortgageRatePct: 4.5, termYears: 30, years: 10, homeGrowthPct: 3, rentGrowthPct: 4, investmentReturnPct: 5 };
export const seedHousing = compareRentAndBuy(rentBuyInputs);
export const rebateTask = TASK_CATALOG.find(t => /rebate|P87|overpaid/i.test(t.title + t.shortTitle)) ?? TASK_CATALOG[0];

/** Distinct local diary entries; selection never aliases the latest logged meal. */
/** Today's diary in the sample life: breakfast and the photographed lunch, 1,060 kcal (`seed.fuel.eaten`). */
export const seedDiaryMeals = [
  { id: 'seed-breakfast', name: 'Yoghurt, berries, oats', at: '08:10', via: 'saved' as const, from: 'Usual breakfast', items: [{ name: 'Yoghurt, berries, oats', grams: 300, kcal: 420, protein: 30, carbs: 48, fat: 9, fibre: 7, confidence: .8 }] },
  { id: 'seed-lunch', name: 'Salmon rice bowl', at: '12:40', via: 'photo' as const, items: seedMeal.map(item => ({ ...item })) },
];
