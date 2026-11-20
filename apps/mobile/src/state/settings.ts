/**
 * Settings and life Plus: the board's words and figures (`settings-people.js`, `core.js` plus). The price is the
 * seed's membership (owner decision 3 is still open; the board shows £48 a year). Screens read from here.
 */
import type { GlyphName } from '@/design';
import type { ScreenKey } from '@/navigation/screens';
import { seed } from './seed';

export const plusPrice = {
  annual: seed.membership.annual, monthly: seed.membership.monthly,
  perMonth: seed.membership.annual / 12,
  save: Math.round((1 - seed.membership.annual / (seed.membership.monthly * 12)) * 100),
  renews: '14 Nov 2027',
};
/** What life Plus opens, in the board's words: "your routines", never the parked "Do it for me". */
export const plusOpens: { icon: GlyphName; label: string }[] = [
  { icon: 'grid', label: 'Every tool unlocked' }, { icon: 'repeat', label: 'Your routines' }, { icon: 'book', label: 'Unlimited Teach me' }, { icon: 'shield', label: 'Private mode' },
];

/** Notifications: the kinds that can reach you, grouped by meaning. */
export const notifGroups: { title: string; kinds: { key: string; icon: GlyphName; title: string; sub: string; on: boolean }[] }[] = [
  { title: 'To do', kinds: [{ key: 'move', icon: 'arrow', title: 'Today’s move', sub: 'The one nudge a day', on: true }, { key: 'deadlines', icon: 'clock', title: 'Deadlines under 24 hours', sub: 'Always calm, never at night', on: true }] },
  { title: 'Body and habits', kinds: [{ key: 'bedtime', icon: 'moon', title: 'Bedtime reminder', sub: '45 minutes before your target', on: true }, { key: 'habit', icon: 'repeat', title: 'Habit rescue', sub: 'After one missed day', on: true }] },
  { title: 'Looking back, looking in', kinds: [{ key: 'recap', icon: 'chart', title: 'Weekly recap', sub: 'Sunday evening', on: true }, { key: 'recall', icon: 'bulb', title: 'Learn: recall', sub: 'A 20-second question', on: false }] },
];
export const quietHours = { from: 21, until: 8 };
export const nudgeWindow = '9am and 7pm';

/** Private mode: the three jobs that stay on the phone and the two that ask first. */
export const phoneJobs: { icon: GlyphName; title: string; sub: string }[] = [
  { icon: 'mic', title: 'Turning your voice into text', sub: 'Talk, journal, tell-back' },
  { icon: 'folder', title: 'Filing what you say', sub: 'Bills, dates, people' },
  { icon: 'doc', title: 'Short drafts and replies', sub: 'Slower than the cloud' },
];
export const cloudJobs: { icon: GlyphName; title: string; sub: string }[] = [
  { icon: 'book', title: 'Building a new lesson', sub: 'Needs a bigger model' },
  { icon: 'camera', title: 'Reading a photo of a meal', sub: 'Needs vision' },
];
/** The size on a phone with built-in AI (board figure until the Phase 28 download manager measures it). */
export const onPhoneMB = 174;

/** Your AI: what your usual assistant may read. */
export const aiScopes: { icon: GlyphName; title: string; on: boolean }[] = [
  { icon: 'moon', title: 'Sleep, readiness and workouts', on: true }, { icon: 'repeat', title: 'Habits and streaks', on: true },
  { icon: 'chart', title: 'Spending by category', on: false }, { icon: 'calendar', title: 'Missions and deadlines', on: true }, { icon: 'book', title: 'Journal entries', on: false },
];

/** Connected services as calm tiles. */
export const connections: { name: string; dot: 'health' | 'you' | 'work' | 'home'; shares: string; when: string; to: ScreenKey }[] = [
  { name: 'Apple Health', dot: 'health', shares: 'Sleep, heart, workouts', when: 'Synced 2 min ago', to: 'devices' },
  { name: 'Oura', dot: 'you', shares: 'Sleep, HRV', when: 'Synced 07:02', to: 'devices' },
  { name: 'Calendar', dot: 'work', shares: 'Busy times only', when: 'Synced just now', to: 'calprimer' },
  { name: 'Your AI (MCP)', dot: 'home', shares: 'Read-only', when: 'Last used 2h ago', to: 'yourai' },
];

/** What stays on your phone: the four parts with their sizes. */
export const modelParts: { key: string; title: string; size: string; text: string; uses: string[] }[] = [
  { key: 'in', title: 'Your voice in', size: '0–150 MB', text: 'Built into iOS 26, and Android where available. Otherwise Whisper (whisper.rn).', uses: ['Talk', 'Journal', 'Tell it back'] },
  { key: 'out', title: 'life’s voice out', size: '~24 MB +', text: 'Phonon on iPhone, speaking as Maeve. Kitten TTS Nano elsewhere.', uses: ['Brief', 'Lessons', 'Replies'] },
  { key: 'think', title: 'Thinking and filing', size: '0–1.1 GB', text: 'Apple’s on-device model on Apple Intelligence phones with iOS 26, or Gemini Nano on supported Android. Otherwise a small open model, such as Qwen3 1.7B (4-bit), through llama.rn.', uses: ['Filing', 'Short drafts', 'Tips'] },
  { key: 'memory', title: 'Memory search', size: '~30–90 MB', text: 'A small embedding model.', uses: ['Finding what life remembers'] },
];

/** Help: the three likeliest answers. */
export const helpAnswers = [
  { key: 'moves', title: 'How life picks your moves', count: '2 min', text: 'life weighs what’s due, what you’re owed and what moves your Aim, then shows the one move that fits the time you have. {Tap “Why this?” on any move} to see its reason.', link: 'Read the guide', to: 'why' as ScreenKey },
  { key: 'scores', title: 'How scores work', count: '', text: 'Readiness, sleep and load are worked out from your own readings and shown against {your own normal}. Wellness guidance, not a diagnosis.' },
  { key: 'report', title: 'Report a wrong number', count: '', text: 'Tell us which number looks off. {It goes to a person} on the team.', button: 'Report a number' },
];

export const openSource = { count: 38, licences: 'MIT and Apache' };
