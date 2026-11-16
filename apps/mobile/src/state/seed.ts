import { computeHealthTargets, computeIncomeBreakdown, computeLifeAreaProgress, computeLifeLevelState, computeLifeScore, DEFAULT_HEALTH_SNAPSHOT, DEFAULT_PROFILE, getEligibleTasks, TASK_CATALOG } from '@life/core/engine';
import { compareUKBusinessStructures } from '@life/core/finance';
import { compareRentAndBuy, type RentBuyInputs } from '@life/core/housing';
import type { UserProfile } from '@life/core/types';
import type { Area } from '@/design/tokens';

/** Local-only Track A fixtures. Observations are sample readings, not calculated scores.
 * Tax, take-home, life level, understanding, task values and health targets use core.
 * New health/Fuel algorithms remain seeded previews until Track B (core is unchanged). */
export const SEED_DATE = '2026-11-16';
export const seedProfile: UserProfile = {
  ...DEFAULT_PROFILE, name: 'Ama', age: 27, workStatus: 'sole-trader', annualIncome: 48000,
  isBusinessOwner: true, destination: 'buy-home', householdSize: 3,
  monthlyPensionPct: 0, employerMatchPct: 0, habitStreakDays: 4,
  health: { ...DEFAULT_HEALTH_SNAPSHOT, weightKg: 74.2, trainingDays: 4, waterMlToday: 1400, sleepHoursAvg: 7 + 10 / 60 },
};
export const money = (n: number, decimals = 0) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
export function engineSnapshot(profile = seedProfile, completed: string[] = []) {
  const tasks = getEligibleTasks(profile, completed);
  return { tasks, income: computeIncomeBreakdown(profile), level: computeLifeLevelState(profile, tasks, completed), score: computeLifeScore(profile, completed), areas: computeLifeAreaProgress(profile, tasks, completed), targets: computeHealthTargets(profile.health ?? DEFAULT_HEALTH_SNAPSHOT), structures: compareUKBusinessStructures(profile) };
}
export type FiledRecord = { id: string; kind: 'fact' | 'insight' | 'mission' | 'decision' | 'goal' | 'answer'; area: Area; label: string; value?: string | number; profilePatch?: Partial<UserProfile>; taskId?: string; source: { type: 'talk' | 'chat' | 'question' | 'document' | 'record'; at: string; excerpt?: string }; status: 'proposed' | 'confirmed' | 'removed' };
export type ChiefAim = { what: string; when: string; give: string; plan: string; createdAt: string; history: string[]; readLog: string[] };
export const seedAim: ChiefAim = { what: 'Own a two-bed flat', when: 'June 2029', give: 'Save every payday and grow my design work', plan: 'Claim what I’m owed, then build my deposit', createdAt: SEED_DATE, history: [], readLog: [] };
export const seedRecords: FiledRecord[] = [
  { id: 'age', kind: 'fact', area: 'you', label: 'Age 27, London', value: 27, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'home', kind: 'fact', area: 'home', label: 'Lives with 2 flatmates', value: 3, profilePatch: { householdSize: 3 }, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'work', kind: 'fact', area: 'work', label: 'Self-employed designer', profilePatch: { workStatus: 'sole-trader' }, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'rebate', kind: 'mission', area: 'money', label: 'Overpaid tax in 2024/25', source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'referral', kind: 'mission', area: 'health', label: 'Heart referral, 11 weeks', source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'aim', kind: 'goal', area: 'goal', label: 'Buy a first home', source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
  { id: 'rent', kind: 'fact', area: 'money', label: `Rent ${money(1150)} a month`, value: 1150, source: { type: 'talk', at: SEED_DATE }, status: 'proposed' },
];
export const seedPeople = [
  { id: 'kofi', name: 'Kofi', relation: 'Brother', date: '20 November', days: 4, note: 'Loves cooking. Last year: a good chef’s knife.' },
  { id: 'mum', name: 'Mum', relation: 'Family', date: '8 December', days: 22, note: 'Call on Sundays.' },
  { id: 'sarah', name: 'Sarah', relation: 'Friend', date: '12 January', days: 57, note: 'Met at work.' },
];
export const seedDocuments = [
  { id: 'passport', name: 'Passport', expires: '8 June 2028', actFrom: 'December 2027', reference: '•••• 4821' },
  { id: 'insurance', name: 'Car insurance', expires: '12 December 2026', actFrom: '21 November 2026', reference: 'POL-48210' },
  { id: 'mot', name: 'MOT', expires: '18 March 2027', actFrom: '18 February 2027', reference: 'Saved from your document' },
];
export type MealItem = { name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number; fibre: number; confidence: number };
export const seedMeal: MealItem[] = [
  { name: 'Salmon', grams: 120, kcal: 247, protein: 26, carbs: 0, fat: 15, fibre: 0, confidence: .9 },
  { name: 'Rice', grams: 150, kcal: 195, protein: 4, carbs: 43, fat: 0, fibre: 1, confidence: .8 },
  { name: 'Avocado', grams: 50, kcal: 80, protein: 1, carbs: 4, fat: 7, fibre: 3, confidence: .75 },
  { name: 'Edamame', grams: 40, kcal: 48, protein: 5, carbs: 4, fat: 2, fibre: 2, confidence: .9 },
  { name: 'Egg', grams: 50, kcal: 72, protein: 7, carbs: 0, fat: 5, fibre: 0, confidence: .9 },
];
export const seed = {
  date: SEED_DATE,
  body: { heightCm: 172, weightKg: 74.2, waistCm: 84, bodyFatPct: 22, sexAtBirth: 'Female', activity: 'Active', bp: '118 / 76', bmi: 25.1, waistRatio: .49, rhr: 54, vo2: 44 },
  health: { readiness: 72, sleepMinutes: 430, sleepNeed: 480, sleepDebt: 130, load: 6.2, loadTarget: [11, 14] as [number, number], hrv: 62, hrvBaseline: 54, rhr: 54, resp: 14.6, stress: 1.4, regularity: 78, fitnessAge: 25, loadRatio: 1.12, steps: 8240, waterMl: 1400, forecast: 68,
    sleepTrend: [6.2, 7.1, 6.8, 7.5, 7.2, 8.1, 7.17], readinessTrend: [62, 68, 65, 74, 69, 80, 72], weightTrend: [76.6, 76.1, 75.8, 75.5, 75, 74.8, 74.2],
    sleepWindows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({ day, start: [23.2, 23.4, 23.1, 23.6, 24.1, 25.2, 24.6][i], end: [30.9, 31, 30.8, 31.1, 31.4, 33.1, 32.6][i], highlight: i > 4 })),
    zones: [{ name: 'Zone 5', range: '176–190', minutes: 8 }, { name: 'Zone 4', range: '162–175', minutes: 22 }, { name: 'Zone 3', range: '148–161', minutes: 41 }, { name: 'Zone 2', range: '134–147', minutes: 164 }, { name: 'Zone 1', range: '120–133', minutes: 58 }],
    stages: [{ stage: 'light' as const, minutes: 65 }, { stage: 'deep' as const, minutes: 90 }, { stage: 'rem' as const, minutes: 44 }, { stage: 'awake' as const, minutes: 10 }, { stage: 'light' as const, minutes: 153 }, { stage: 'rem' as const, minutes: 68 }],
  },
  fuel: { kcal: 2300, targetWeight: 70, pace: .5, protein: 140, carbs: 260, fat: 75, fibre: 30, eaten: 1060, burned: 600, mealFit: 8.4, macros: [{ label: 'Protein', value: 112, max: 140, unit: 'g' }, { label: 'Carbs', value: 150, max: 260, unit: 'g' }, { label: 'Fat', value: 48, max: 75, unit: 'g' }],
    savedMeals: [{ name: 'Usual breakfast', detail: 'Yoghurt, berries, oats', kcal: 420 }, { name: 'Salmon rice bowl', detail: 'From Itsu', kcal: 705 }, { name: 'Chicken wrap', detail: 'Homemade', kcal: 560 }, { name: 'Protein shake', detail: 'Whey + oat milk', kcal: 240 }],
    nutrients: [{ label: 'Protein', value: 112, max: 140, unit: 'g' }, { label: 'Fibre', value: 18, max: 30, unit: 'g' }, { label: 'Sugar', value: 42, max: 90, unit: 'g' }, { label: 'Salt', value: 3.2, max: 6, unit: 'g' }, { label: 'Saturated fat', value: 14, max: 20, unit: 'g' }, { label: 'Iron', value: 10, max: 14.8, unit: 'mg' }, { label: 'Calcium', value: 580, max: 700, unit: 'mg' }, { label: 'Vitamin D', value: 6, max: 10, unit: 'µg' }],
  },
  finance: { rent: 1150, councilTaxAnnual: 1812, balance: 12847.5, deposit: 12000, depositGoal: 50000, income: 48000, savingsMonthly: 350, insuranceRenewal: 612, insuranceQuote: 488, bufferMonths: 3, essentials: 1800, expenses: [{ name: 'Rent', amount: 1150 }, { name: 'Bills', amount: 220 }, { name: 'Food', amount: 280 }, { name: 'Travel', amount: 150 }], transactions: [{ name: 'Salary', detail: 'Monzo · today', amount: 2500 }, { name: 'Itsu', detail: 'Lunch · today', amount: -12.5 }, { name: 'TfL', detail: 'Travel · today', amount: -6.8 }, { name: 'Spotify', detail: 'Subscription · yesterday', amount: -10.99 }], },
  habits: [{ id: 'walk', name: 'Morning walk', cue: 'After my first coffee, I will walk for 2 minutes, outside.', last14: [true, true, true, false, true, true, true, true, true, true, true, true, false, false] }, { id: 'water', name: 'A glass of water', cue: 'After the kettle boils, I will drink a glass of water, in the kitchen.', last14: [true, true, false, true, true, true, true, true, true, true, true, false, true, true] }, { id: 'bed', name: 'Wind down', cue: 'After brushing my teeth, I will put my phone away, in the bedroom.', last14: [true, false, true, true, true, true, false, true, true, true, true, true, true, true] }],
  lesson: { topic: 'Tax codes', title: 'What your tax code really means', bites: ['A code, not a tax rate', 'How it works each payday', 'What to check on your payslip'], recap: ['Your tax code tells your employer how much pay is tax-free.', 'The number usually means your allowance, divided by ten.', 'Check your code against your payslip and HMRC record.'], explainBack: 'Explain your tax code to a friend in two sentences.' },
};
export const rentBuyInputs: RentBuyInputs = { price: 350000, deposit: 35000, availableCash: 45000, emergencyBuffer: 6000, purchaseCosts: 4000, saleCostsPct: 2, rentMonthly: seed.finance.rent, ownerCostsMonthly: 250, mortgageRatePct: 4.5, termYears: 30, years: 5, homeGrowthPct: 2, rentGrowthPct: 3, investmentReturnPct: 5 };
export const seedHousing = compareRentAndBuy(rentBuyInputs);
export const rebateTask = TASK_CATALOG.find(t => /rebate|P87|overpaid/i.test(t.title + t.shortTitle)) ?? TASK_CATALOG[0];
