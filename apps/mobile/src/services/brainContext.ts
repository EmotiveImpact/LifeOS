import type { Context, Fact, Memory, Move, Source } from '@life/brain';
import { computeIncomeBreakdown, computeLifeScore, getEligibleTasks } from '@life/core/engine';
import type { SeedData } from '@/state/SeedProvider';

/** The engine, not a prompt, calculates every financial/score fact. The demo
 * profile remains explicitly sample until each relevant field is confirmed. */
export function brainContext(data: SeedData): Context {
  const confirmed = new Set(data.brain.confirmedRecordIds);
  const income = computeIncomeBreakdown(data.profile);
  const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: ({ UK: 'GBP', US: 'USD', DE: 'EUR', NG: 'NGN' } as const)[data.profile.countryCode], maximumFractionDigits: 2 }).format(value);
  const incomeSource: Source = { id: 'engine:income', label: `Income calculator · ${income.taxYear}`, kind: 'engine', sample: !confirmed.has('income') || !confirmed.has('work') };
  const facts: Fact[] = [
    { id: 'income.netMonthly', label: 'Estimated monthly take-home', value: money(income.netTakeHomeMonthly), source: incomeSource },
    { id: 'income.taxReserveMonthly', label: 'Estimated monthly tax reserve', value: money(income.taxReserveMonthly), source: incomeSource },
    { id: 'life.score', label: 'Life engine score', value: String(computeLifeScore(data.profile, data.completed).total), source: { id: 'engine:score', label: 'Life engine · saved profile and completed tasks', kind: 'engine', sample: true } },
  ];
  for (const record of data.records.filter(record => record.status === 'confirmed')) facts.push({ id: `record:${record.id}`, label: record.label, value: record.label, source: { id: `record:${record.id}`, label: `${confirmed.has(record.id) ? 'Confirmed' : 'Sample'} · ${record.source.type}`, kind: 'record', at: record.source.at, sample: !confirmed.has(record.id) } });
  const liveRecords = new Set(data.records.filter(record => record.status === 'confirmed').map(record => record.id));
  const memories: Memory[] = data.memories.filter(memory => !data.flags[`forgot-${memory.id}`] && (!memory.recordId || liveRecords.has(memory.recordId))).map(memory => ({ id: memory.id, text: memory.text, recordId: memory.recordId, source: { id: `memory:${memory.id}`, kind: 'memory', label: memory.source, sample: !memory.recordId && ['rent', 'kofi', 'aim'].includes(memory.id) } }));
  // Values remain engine-owned. Do not infer deadlines or readiness from a
  // fixture, and do not claim a contextual bandit is already learning.
  const rank = { urgent: 0, high: 1, recommended: 2 };
  const tasks = getEligibleTasks(data.profile, data.completed).filter(task => !data.completed.includes(task.id)).sort((a, b) => rank[a.urgency] - rank[b.urgency]);
  const moves: Move[] = tasks.slice(0, 3).map(task => ({ id: task.id, title: task.shortTitle || task.title, area: task.lifeArea === 'relationships' ? 'you' : task.lifeArea === 'admin' ? 'home' : task.lifeArea ?? (task.category === 'health' ? 'health' : 'money'), urgent: task.urgency === 'urgent', reasons: [task.whySurfaced || task.personalWhy || task.insightSummary].filter(Boolean) }));
  return { facts, memories, moves, sample: facts.some(fact => fact.source.sample) || memories.some(memory => memory.source.sample) };
}
