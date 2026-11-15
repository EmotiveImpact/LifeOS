import type { GrowthCheckInId, GrowthPlan, LessonDepth, LessonId } from '../types/lifeos';

type Prompt = { id: string; text: string; options?: string[]; correct?: number; explanation?: string };
type CheckIn = {
  id: GrowthCheckInId;
  label: string;
  daysAfterStart: number;
  intro: string;
  prompts: Prompt[];
  optional?: boolean;
};

const PREFERENCES = [
  { id: 'energy', codes: ['E', 'I'], labels: ['Talking things through', 'Thinking in quiet first'], prompts: [
    ['When an idea is half-formed, what helps you find the next step?', 'Talk with someone', 'Make notes on my own'],
    ['After a demanding day, what usually restores your energy?', 'Time with people I enjoy', 'Quiet time by myself'],
    ['Which kickoff feels easier?', 'A quick group conversation', 'A few minutes to read and think'],
  ] },
  { id: 'information', codes: ['S', 'N'], labels: ['Concrete examples', 'Patterns and possibilities'], prompts: [
    ['When learning a tool, where do you start?', 'Walk through a working example', 'Understand what it can make possible'],
    ['What do you reach for when reviewing a new project?', 'Details and evidence already on hand', 'The bigger pattern and future directions'],
    ['How do you prefer a tricky idea to be explained?', 'Show me one real example', 'Show me how it fits the big picture'],
  ] },
  { id: 'decisions', codes: ['T', 'F'], labels: ['Consistent decision criteria', 'Personal values and effects'], prompts: [
    ['When choosing between good options, what do you check first?', 'Which criteria can I apply consistently?', 'How will each choice affect the people involved?'],
    ['What helps you accept difficult feedback?', 'A clear reason and an example', 'A conversation that shows they understand the context'],
    ['When you disagree, where do you usually begin?', 'Identify the reasoning behind each position', 'Identify what matters to each person'],
  ] },
  { id: 'structure', codes: ['J', 'P'], labels: ['A clear plan', 'Room to adapt'], prompts: [
    ['How would you start an open afternoon?', 'Choose a plan and block the time', 'Keep a few options and see how it goes'],
    ['For a new project, what is more reassuring?', 'A decision and the first milestones', 'An easy way to change direction as I learn'],
    ['What helps you complete a lesson?', 'A short checklist I can follow', 'A few formats and freedom to choose one'],
  ] },
];

export const GROWTH_CHECK_INS: CheckIn[] = [
  {
    id: 'preferences', label: 'Personality preferences', daysAfterStart: 0,
    intro: 'Choose what feels more natural lately. This short reflection uses four preference pairs to suggest ways to work and learn.',
    prompts: PREFERENCES.flatMap((axis) => axis.prompts.map(([text, first, second], index) => ({
      id: `${axis.id}-${index}`, text, options: [first, second],
    }))),
  },
  {
    id: 'swot', label: 'Personal SWOT', daysAfterStart: 1,
    intro: 'Pick one current situation. Use a few words for each answer.',
    prompts: [
      { id: 'strength', text: 'What strengths already help, including skills, experience or support?' },
      { id: 'weakness', text: 'Where do you need help, practice or more time?' },
      { id: 'opportunity', text: 'What opportunity could you act on this month?' },
      { id: 'threat', text: 'What outside constraint could make the plan harder?' },
    ],
  },
  {
    id: 'patterns', label: 'Motivation and routines', daysAfterStart: 2,
    intro: 'Think about a regular day and what you want to keep or change.',
    prompts: [
      { id: 'pattern', text: 'What moment in your day tends to pull you away from what matters?' },
      { id: 'anti-vision', text: 'If that pattern carried on, what would you want to avoid?' },
      { id: 'vision', text: 'What would an ordinary, better day look like?' },
      { id: 'support', text: 'What support or environment makes it easier to follow through?' },
    ],
  },
  {
    id: 'eq', label: 'Emotional awareness', daysAfterStart: 3,
    intro: 'Use a recent low-stakes conversation to practise noticing emotion, checking assumptions and naming a boundary.',
    prompts: [
      { id: 'noticed', text: 'What did you feel, and what did you notice in your body or behaviour?' },
      { id: 'assumed', text: 'What did you assume about the other person? What could you ask to check it?' },
      { id: 'boundary', text: 'What request or boundary would make the next conversation clearer?' },
    ],
  },
  {
    id: 'reasoning', label: 'Reasoning practice', daysAfterStart: 4,
    intro: 'Try three everyday decisions. You’ll see the explanation after answering.',
    prompts: [
      { id: 'rates', text: 'A fee falls from £20 to £15 and later rises from £15 to £20. Which percentage change is larger?',
        options: ['The fall', 'The rise', 'They are equal'], correct: 1,
        explanation: 'The fall is £5 out of £20 (25%). The rise is £5 out of £15 (about 33%). The starting amount matters.' },
      { id: 'signal', text: 'A check flags nine people who need follow-up and nine who don’t. What share of the flagged group needs follow-up?',
        options: ['10%', '50%', '90%'], correct: 1,
        explanation: 'There are 18 flagged people. Nine out of 18 is half.' },
      { id: 'sunk', text: 'You paid for a course you no longer need. You can’t get a refund. Which question best informs whether to finish?',
        options: ['How much did it cost?', 'What do I gain from the remaining hours?', 'How many lessons have I finished?'], correct: 1,
        explanation: 'Compare the remaining time and benefits with what else you could do with those hours.' },
    ],
  },
  {
    id: 'values', label: 'Values and civic trade-offs', daysAfterStart: 5, optional: true,
    intro: 'An optional private reflection on public choices. Your answers stay in this browser and sit outside the task and level engine.',
    prompts: [
      { id: 'civic', text: 'Pick a public issue. Whose interests or values should a good decision account for?' },
      { id: 'tradeoff', text: 'What trade-off would you accept, and what would be too much to give up?' },
      { id: 'evidence', text: 'What evidence or perspective could change your view?' },
    ],
  },
];

function shiftDay(date: string, days: number): string {
  const start = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(start)) return date;
  return new Date(start + days * 86_400_000).toISOString().slice(0, 10);
}

export function getGrowthTimeline(plan: GrowthPlan, today: string) {
  const snoozed = Boolean(plan.snoozeUntil && today < plan.snoozeUntil);
  return GROWTH_CHECK_INS.map((checkIn) => {
    const history = plan.checkIns?.[checkIn.id] ?? [];
    const last = history[history.length - 1];
    const availableOn = shiftDay(plan.startedOn, checkIn.daysAfterStart);
    const skipped = plan.skippedCheckIns?.includes(checkIn.id) ?? false;
    const reviewDue = Boolean(last && plan.cadenceDays && !snoozed && !checkIn.optional
      && checkIn.id !== 'reasoning' && shiftDay(last.on, plan.cadenceDays) <= today);
    return { ...checkIn, availableOn, available: availableOn <= today, last, skipped, reviewDue };
  });
}

export function isGrowthProgressReviewDue(plan: GrowthPlan, today: string): boolean {
  const reviews = plan.reviews ?? [];
  const lastReviewed = reviews[reviews.length - 1]?.on ?? plan.startedOn;
  return Boolean(plan.path && plan.cadenceDays && (!plan.snoozeUntil || plan.snoozeUntil <= today)
    && shiftDay(lastReviewed, plan.cadenceDays) <= today);
}

export function startGrowthPlan(today: string): GrowthPlan {
  return { startedOn: today, cadenceDays: 30 };
}

export function snoozeGrowthReview(plan: GrowthPlan, today: string): GrowthPlan {
  return { ...plan, snoozeUntil: shiftDay(today, 7) };
}

export function saveGrowthCheckIn(plan: GrowthPlan, checkIn: GrowthCheckInId, answers: Record<string, string>, today: string): GrowthPlan {
  const checkInHistory = plan.checkIns?.[checkIn] ?? [];
  return {
    ...plan,
    checkIns: {
      ...plan.checkIns,
      [checkIn]: [...checkInHistory, { on: today, answers }],
    },
    skippedCheckIns: plan.skippedCheckIns?.filter((id) => id !== checkIn),
  };
}

export function preferenceSnapshot(answers: Record<string, string>) {
  const axes = PREFERENCES.map((axis) => {
    const picks = axis.prompts.map((_, index) => answers[`${axis.id}-${index}`]);
    if (picks.some((pick) => pick !== '0' && pick !== '1')) return undefined;
    const choice = picks.filter((pick) => pick === '1').length >= 2 ? 1 : 0;
    return { code: axis.codes[choice], label: axis.labels[choice] };
  });
  if (axes.some((axis) => axis === undefined)) return null;
  return {
    code: axes.map((axis) => axis?.code).join(''),
    labels: axes.flatMap((axis) => axis ? [axis.label] : []),
    practiceTip: axes[1]?.code === 'S'
      ? 'Try the worked example first, then explain it with something from your day.'
      : 'Start with the big idea, then find an example from your own day.',
  };
}

export const RESET_STEPS: Array<{ title: string; guidance: string; lesson: LessonId }> = [
  { title: 'Five minutes for tomorrow', guidance: 'Ask what you could do in five minutes that would make tomorrow easier. Choose the smallest action you can finish now.', lesson: 'next-step' },
  { title: 'Spot what pulls you off course', guidance: 'Name one trigger and its usual response. Change the room, the device or the timing so the next useful action takes less effort.', lesson: 'change-the-cue' },
  { title: 'Try one small improvement', guidance: 'Make a slightly better choice in a routine you already repeat. Give it a week and notice what becomes easier.', lesson: 'small-changes' },
];

type Lesson = {
  id: LessonId;
  title: string;
  depths: Record<LessonDepth, string>;
  teachBack: string;
  example: string;
};

export const GROWTH_LESSONS: Lesson[] = [
  {
    id: 'next-step', title: 'Make the next action small',
    depths: {
      starter: 'Choose an action with a visible finish that takes five minutes or less.',
      practice: 'Write your goal, then underline the first physical action. Attach it to something you already do, using “When this happens, I’ll do this.”',
      deep: 'Pick a cue that happens reliably and a response you can do even on a difficult day. If the same obstacle appears twice, shrink the step or change the cue before the next attempt.',
    },
    teachBack: 'Explain to a friend how “get organised” becomes a step they can finish today.',
    example: 'After I plug in my phone tonight, I’ll put tomorrow’s appointment letter next to my keys.',
  },
  {
    id: 'change-the-cue', title: 'Change the cue',
    depths: {
      starter: 'Notice what happens just before a habit. Change one detail in that moment.',
      practice: 'Write the cue, the usual response and how you feel after it. Put a useful alternative within reach before the cue happens again.',
      deep: 'Use the same cue for a week. Track attempts and what got in the way. Compare a change to your environment with trying harder under the old setup.',
    },
    teachBack: 'Explain what you’d change for someone who reaches for their phone while waiting for the kettle.',
    example: 'Charge the phone outside the kitchen and leave a glass next to the kettle. When it boils, fill the glass and check how often that makes the pause easier.',
  },
  {
    id: 'small-changes', title: 'See what repeats',
    depths: {
      starter: 'A small change matters most when it fits something you already do regularly.',
      practice: 'Count repetitions or savings for a week. Keep one measure you can observe, such as minutes walking or money moved to a buffer.',
      deep: 'Estimate the monthly effect, then account for days the plan is interrupted. In money decisions use a range of returns and give near-term needs their own buffer.',
    },
    teachBack: 'Explain how you’d measure a small change so someone could tell whether it helped.',
    example: 'A ten-minute walk after lunch on four workdays adds forty minutes this week. I can record whether it happened and adjust for days with meetings.',
  },
  {
    id: 'check-the-evidence', title: 'Check the evidence',
    depths: {
      starter: 'Before acting on a claim, ask what was measured and how they measured it.',
      practice: 'Find the source of a number. Look for what it was compared with, who was counted and what unit the number uses.',
      deep: 'Consider other explanations, base rates and uncertainty. Ask what would change your decision and set a point to look again.',
    },
    teachBack: 'Explain why “twice as likely” is easier to interpret when you know the starting risk.',
    example: 'Moving from one in a hundred to two in a hundred doubles the relative risk. The absolute change is one extra case per hundred.',
  },
];
