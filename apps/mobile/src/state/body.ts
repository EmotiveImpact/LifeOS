/**
 * Body's board-only figures (V26 `core.js` body, readiness and strength, `body-a.js`, `body-b.js`): a week of readings,
 * last night in stages, today in half hours. Each agrees with the seed's headline readings (`seed.health`), so Today,
 * Body and the pages behind it never disagree. Sample data for development builds; Phase 26 replaces it with real
 * readings, and real accounts see Body's empty state until then.
 */
import type { PhotoName, SleepTrackStage } from '@/design';
import { seed, seedHabitStrength } from './seed';

const h = seed.health;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Minutes as the board writes them: "7h 10m", "8h", "20m". */
export const dur = (minutes: number) => {
  const m = Math.round(minutes), hh = Math.floor(m / 60), mm = m % 60;
  return hh ? (mm ? `${hh}h ${String(mm).padStart(2, '0')}m` : `${hh}h`) : `${mm}m`;
};
/** Minutes after midnight as a clock time ("22:50"). */
export const clock = (minutes: number) => { const m = ((Math.round(minutes) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

/* ───────────────────────── Readiness and what drives it ───────────────────────── */

/** The 60 to 70 normal is a placeholder until the engine learns it from 60 days (owner decision 4). */
export const readiness = {
  today: h.readiness,
  week: [58, 64, 55, 70, 62, 66, h.readiness],
  normal: [60, 70] as [number, number],
  luteal: 64,
};

const sleepPerf = Math.round(h.sleepMinutes / h.sleepNeed * 100);
export const drivers = {
  hrv: { value: h.hrv, baseline: h.hrvBaseline, normal: [47, 56] as [number, number], week: [49, 52, 47, 55, 51, 54, h.hrv],
    month: [55, 57, 53, 56, 58, 54, 45, 52, 56, 59, 55, 57, 50, 54, 58, 56, 53, 57, 46, 53, 56, 58, 56, 49, 52, 47, 55, 51, 54, h.hrv] },
  rhr: { value: h.rhr, baseline: 56, normal: [55, 59] as [number, number], week: [57, 58, 56, 57, 55, 56, h.rhr] },
  sleep: { value: sleepPerf, normal: [82, 96] as [number, number], week: [80, 92, 84, 95, 88, 100, sleepPerf] },
  resp: { value: h.resp, normal: [14.2, 15.2] as [number, number], week: [14.6, 14.9, 14.7, 14.8, 14.6, 14.8, h.resp] },
};
export const hrvAverage = Math.round(sum(drivers.hrv.month) / drivers.hrv.month.length);
/** What moves your HRV, from the journal: change in ms and how many nights it's seen on. */
export const hrvMovers = [{ d: -9, text: 'Alcohol the night before', n: '12 nights' }, { d: 6, text: 'In bed before 23:00', n: '18 nights' }, { d: -4, text: 'Hard workout the day before', n: '9 days' }];

/* ───────────────────────── Sleep ───────────────────────── */

/** Last night from 23:20 to 06:45: 430 minutes asleep (the seed's figure) and 15 awake. */
const stages: { stage: SleepTrackStage; minutes: number }[] = (
  [['light', 15], ['deep', 45], ['light', 30], ['rem', 20], ['light', 35], ['deep', 25], ['light', 25], ['rem', 30], ['awake', 3], ['light', 65],
    ['deep', 10], ['rem', 25], ['light', 30], ['awake', 7], ['rem', 15], ['light', 35], ['awake', 5], ['rem', 20], ['light', 5]] as const
).map(([stage, minutes]) => ({ stage, minutes }));
const stageTotal = (s: SleepTrackStage) => sum(stages.filter(x => x.stage === s).map(x => x.minutes));

/** The week, Monday to last night. The four short nights add up to the seed's sleep debt. */
const nights = [440, 492, 470, 485, 450, 504, h.sleepMinutes];
export const sleep = {
  need: h.sleepNeed, last: h.sleepMinutes, debt: h.sleepDebt, perf: sleepPerf,
  bed: 23 * 60 + 20, wake: 6 * 60 + 45, latency: 14,
  stages, totals: { deep: stageTotal('deep'), rem: stageTotal('rem'), light: stageTotal('light'), awake: stageTotal('awake') },
  nights, reached: nights.filter(n => n >= h.sleepNeed).length,
  /** How far bedtime moves night to night, in minutes, and where each night fell in your usual window (0–100). */
  consistency: 38, bedtimes: [39.5, 73.2, 32.6, 60.5, 82.6, 24.7, 36.8],
  tonight: { bed: 22 * 60 + 50, reminder: 22 * 60 + 5, payback: 40 },
};

/** One night opened up (Monday), with its stages as four lanes. */
export const monday = {
  bed: '23:18', wake: '06:51', asleep: nights[0], ofNeed: Math.round(nights[0] / h.sleepNeed * 100), deep: 92, lowest: 49, lowestAt: '03:10', lowestPct: 51.2,
  stages: ([['awake', 5], ['light', 18], ['deep', 34], ['light', 22], ['rem', 12], ['light', 30], ['deep', 30], ['light', 26], ['rem', 22], ['awake', 4],
    ['light', 20], ['deep', 18], ['light', 42], ['rem', 30], ['light', 40], ['deep', 10], ['light', 22], ['rem', 40], ['awake', 4], ['light', 24]] as const)
    .map(([stage, minutes]) => ({ stage: stage as SleepTrackStage, minutes })),
};

/** Sleep regularity: each night's bed and wake in hours after 21:00, Monday first. */
export const regularity = {
  score: h.regularity, shift: 80,
  nights: [[2.33, 9.75], [2.17, 9.67], [2.58, 9.83], [2.25, 9.75], [2.5, 9.75], [3.83, 11.17], [3.5, 11]] as [number, number][],
  weekday: [2.33, 9.75] as [number, number],
};

/** Plan tonight: wake times and how recovered, in minutes asleep. */
export const sleepPlan = {
  wakes: [6 * 60 + 30, 7 * 60, 7 * 60 + 30, 8 * 60],
  goals: [{ name: 'Minimum', need: 420, why: 'gets you by' }, { name: 'Enough', need: h.sleepNeed, why: 'your usual need' }, { name: 'Full recovery', need: h.sleepNeed + 45, why: 'pays back today’s debt' }],
  usualBed: sleep.tonight.bed,
};

/** Tomorrow's readiness for three bedtimes. */
export const forecast = [
  { bed: '22:45', score: h.forecast, means: 'High enough for your run', photo: 'run' as PhotoName, focal: { y: 0.53 } },
  { bed: '23:30', score: 61, means: 'Fine for a normal day', photo: 'desk' as PhotoName, focal: { y: 0.5 } },
  { bed: '00:30', score: 52, means: 'Plan a lighter day', photo: 'calmdesk' as PhotoName, focal: { y: 0.85 } },
];

/* ───────────────────────── Load, zones, stress ───────────────────────── */

/** Today's load is the seed's (6.2): the walk and the ride to work. */
export const load = {
  today: h.load, target: h.loadTarget,
  week: [9.8, 6.2, 12.6, 4.1, 14.9, 7.3, h.load], weekLabels: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'],
  made: [{ what: 'Morning walk', when: '08:10', mins: '25 min', n: 2.1 }, { what: 'Cycle to work', when: '08:50', mins: '20 min', n: 4.1 }],
  /** Minutes in each heart-rate zone today, Z1 first. */
  zonesToday: [38, 24, 11, 4, 0],
  /** Weekly load for eight weeks, this week last; the sweet spot is 0.8 to 1.3 times the last four. */
  weekly: [50, 54, 49, 57, 60, 59, 63, 67], weeklyLabels: ['28 Sep', '', '', '', '26 Oct', '', '', 'This week'],
  ratio: h.loadRatio,
  maxHr: 190,
};

/** Stress every 30 minutes from 08:00 to 20:00 (0 calm to 3 high); the busy stretch is 13:30 to 15:00. */
export const stress = {
  now: h.stress,
  day: [0.6, 0.8, 1.2, 1.1, 0.9, 1.3, 1.5, 1.2, 0.8, 0.7, 1.4, 2.6, 2.9, 2.5, 1.7, 1.3, 1.1, 1.4, 1.6, 1.2, 0.9, 0.7, 1.0, 1.2, 1.4],
  busy: [11, 13] as [number, number], busyMins: 52, calmMins: 370, calmPct: 62,
  usual: [0.5, 1.6] as [number, number],
  week: [1.9, 1.3, 2.2, 1.6, 1.2, 1.5, h.stress],
  breatheHr: 72,
};

/** The four body signals against your own range. Positions are 0–100 along the range bar; the soft band is 30–70. */
export const signals = {
  today: [
    { name: 'Skin temperature', value: '+0.1', unit: '°C', sub: 'vs your normal', at: 57, off: false },
    { name: 'Breathing rate', value: String(h.resp), unit: '/min', sub: 'normal 14.6–15.2', at: 43, off: false },
    { name: 'Resting heart rate', value: String(h.rhr), unit: 'bpm', sub: 'normal 54–57', at: 32, off: false },
    { name: 'Blood oxygen', value: '96', unit: '%', sub: 'normal 95–98%', at: 43, off: false },
  ],
  drift: [
    { name: 'Skin temperature', value: '+0.6', unit: '°C', sub: 'vs your normal', at: 90, off: true },
    { name: 'Breathing rate', value: '15.9', unit: '/min', sub: 'normal 14.6–15.2', at: 94, off: true },
    { name: 'Resting heart rate', value: '61', unit: 'bpm', sub: 'normal 54–57', at: 96, off: true },
    { name: 'Blood oxygen', value: '96', unit: '%', sub: 'normal 95–98%', at: 43, off: false },
  ],
  /** The illness flag: three signals at once, and the three things life changed. */
  illness: [{ name: 'Skin temperature', value: '+0.6 °C above normal', at: 79 }, { name: 'Resting heart rate', value: '61 bpm, usual 54', at: 84 }, { name: 'Breathing rate', value: '16.8, usual 14.6', at: 81 }],
};

/* ───────────────────────── Journal ───────────────────────── */

export const journalTags = ['Alcohol', 'Caffeine after 2pm', 'Screens in bed', 'Late meal', 'Morning daylight', 'Hydrated', 'Meditated', 'Travelled', 'Sick or run down'];
/** Evenings logged before tonight, of the 14 it takes to unlock insights. */
export const journalLogged = 9;
/** Readiness the day after each tag, against days without it; how many days it's been seen. */
export const journalEffects = {
  help: [{ name: 'In bed before 23:00', v: 11, days: 18 }, { name: 'Morning daylight', v: 6, days: 22 }, { name: 'Hydrated', v: 4, days: 25 }],
  cost: [{ name: 'Screens in bed', v: -5, days: 20 }, { name: 'Caffeine after 2pm', v: -7, days: 15 }, { name: 'Alcohol', v: -14, days: 12 }],
};

/* ───────────────────────── Workouts ───────────────────────── */

export const liveWorkout = { kind: 'Run', strap: 'Polar H10', bpm: 157, zone: 3, load: 6.5, startSeconds: 24 * 60 + 10 };

/** Activity a watch saw that you didn't log: heart rate across it, against your usual at rest. */
export const spotted = [
  { id: 'run', name: 'Run', mins: '32 min', when: '07:10', bpm: 'avg 148 bpm', load: 6.1, types: ['Run', 'Walk', 'Gym', 'Other'],
    hr: [64, 66, 68, 96, 128, 142, 149, 152, 150, 151, 147, 149, 138, 104, 86, 76, 72, 70], rest: [58, 76] as [number, number], ends: ['06:55', '07:55'] },
  { id: 'cycle', name: 'Cycle', mins: '21 min', when: '18:20', bpm: 'avg 131 bpm', load: 3.4, types: ['Cycle', 'Walk', 'Gym', 'Other'],
    hr: [70, 72, 74, 98, 118, 128, 133, 135, 131, 134, 126, 104, 88, 80, 76], rest: [60, 80] as [number, number], ends: ['18:10', '18:55'] },
];

export const pastRun = { km: 5.2, time: '28:40', pace: '5:31', zones: [{ z: 2, pct: 58 }, { z: 3, pct: 30 }, { z: 4, pct: 12 }], recovery: 31, load: 11.4 };

/* ───────────────────────── Fitness, sources, the basics ───────────────────────── */

export const fitness = {
  age: h.fitnessAge, sixMonths: [25.3, 25.2, 25, 24.7, 24.3, h.fitnessAge],
  vo2: { value: seed.body.vo2, week: [42, 42, 43, 43, 44, seed.body.vo2], up: 2 },
  rhr: { week: [57, 57, 56, 55, 55, h.rhr], down: 3 },
  zone2: { value: 160, week: [140, 150, 145, 155, 165, 160] },
};

export const sources = [
  { name: 'Sleep', dev: 'Oura ring', why: 'Best overnight', when: '07:02' },
  { name: 'HRV', dev: 'Oura ring', why: 'Measured all night', when: '07:02' },
  { name: 'Workouts and heart rate', dev: 'Garmin watch', why: 'Chest-strap accurate', when: '08:52' },
  { name: 'Steps', dev: 'iPhone', why: 'Always with you', when: 'Just now' },
  { name: 'Weight', dev: 'Smart scale', why: 'Via Apple Health', when: 'Yesterday' },
];
export const sleepDisagreed = { oura: 432, garmin: 468 };

/** Glucose through today, in mmol/L at each hour; lunch and dinner times. */
export const glucose = {
  points: [[6, 5.1], [7.4, 5], [8.2, 6.1], [9.2, 5.2], [11, 5], [12.6, 5.2], [13.5, 8.1], [14.6, 5.5], [16, 5.1], [18.6, 5.2], [19.4, 5.9], [20.3, 5.3], [22, 5.1]] as [number, number][],
  usual: [4.4, 6.9] as [number, number], lunch: 12.67, dinner: 18.75,
};

export const basics = { sittingMins: 110, freeUntil: '14:00', hrRecovery: 31, hrRecoveryAvg: 27, hrRecoveryWeek: [26, 28, 27, 29, 28, 30, 31] };

/** Daily weigh-ins for four weeks around a gentle trend (kg). */
export const weightDays = Array.from({ length: 28 }, (_, k) => {
  const trend = 75.36 - 0.0429 * k + 0.06 * Math.sin(k / 4);
  return { trend, day: trend + 0.34 * Math.sin(k * 2.3) + 0.2 * Math.cos(k * 1.1), weighed: k % 9 !== 5 };
});
export const weightWeekChange = -0.3;

/* ───────────────────────── Cycle ───────────────────────── */

export const cycle = { day: 22, phases: [{ name: 'Period', days: 5 }, { name: 'Follicular', days: 8 }, { name: 'Ovul.', days: 3 }, { name: 'Luteal', days: 12 }], now: 'Luteal phase', extraSleep: 20 };

/* ───────────────────────── The week, and habits ───────────────────────── */

export const digest = {
  nights7h: 5, zone2: h.zones.find(z => z.name === 'Zone 2')?.minutes ?? 0, rhrDown: 2,
  watch: 'Saturday bedtime was 2 hours later than usual.',
  pattern: { steps: 8000, longer: 24 },
};

/** Trends against your normal, for four weeks or three months. */
export const trends = {
  '4 weeks': { sleep: { value: '7h 38m', series: [7.3, 7.9, 7.4, 7.6, 7.2, 8.0, 7.5, 7.75] }, readiness: { value: '61', series: [58, 63, 55, 66, 61, 57, 64, 66] }, mood: { value: '3.5', series: [3, 4, 3, 4, 2, 4, 4, 4] } },
  '3 months': { sleep: { value: '7h 31m', series: [7.1, 7.4, 7.6, 7.3, 7.5, 7.8, 7.4, 7.6] }, readiness: { value: '60', series: [56, 59, 61, 58, 62, 60, 59, 63] }, mood: { value: '3.4', series: [3, 3, 4, 3, 4, 3, 4, 4] } },
};
export const pattern = { hours: 7, points: 9 };

/** Habits: the gentler time offered after a missed night. */
export const rescue = { habit: 'bed', time: '23:15' };

/** The habit strength sample (board `strength`): 66 days, 37 lived, two misses forgiven. */
export const strengthSample = {
  ...seedHabitStrength, cue: 'after breakfast', misses: [17, 30], week: '11011101101111', thisWeek: 5, streak: 4, felt: [40, 55, 62, 70, 78],
};
