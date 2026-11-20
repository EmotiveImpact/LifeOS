/**
 * Your people and dates: the board's words, photographs and the birthday plan (`settings-people.js`). The people
 * themselves and their dates live in the seed; dates are counted from the sample's day. Screens read from here.
 */
import type { PhotoName } from '@/design/photos';
import { seed, type SeedPerson } from './seed';

type Focal = { x?: number; y?: number; zoom?: number };

/** A small round photograph of someone: the same few photographs, cropped to the face (board `FACE`). */
export const faces: Record<string, { photo: PhotoName; focal: Focal }> = {
  ama: { photo: 'desk', focal: { x: 0.88, y: 0.1, zoom: 1.3 } },
  kofi: { photo: 'siblings', focal: { x: 0.42, y: 0.46, zoom: 4.4 } },
  mum: { photo: 'birthday', focal: { x: 0.45, y: 0.55, zoom: 4.2 } },
  priya: { photo: 'people', focal: { x: 0, y: 0.33, zoom: 2.5 } },
  sam: { photo: 'friends', focal: { x: 0.62, y: 0.94, zoom: 3 } },
  kwame: { photo: 'calm', focal: { x: 0.71, y: 0.64, zoom: 3 } },
  tom: { photo: 'bench', focal: { x: 0.6, y: 0.46, zoom: 2.8 } },
};

/** The photograph each person's card uses on Your people. */
export const personPhotos: Record<string, { photo: PhotoName; focal: Focal }> = {
  kofi: { photo: 'siblings', focal: { y: 0.42 } },
  mum: { photo: 'birthday', focal: { x: 0.35, y: 0.67, zoom: 1.5 } },
  priya: { photo: 'people', focal: { y: 0.4 } },
  sam: { photo: 'friends', focal: { x: 0.69, y: 1, zoom: 2 } },
  efua: { photo: 'sunday', focal: { y: 0.9 } },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const snapshot = new Date(`${seed.date}T00:00:00Z`);

/** The next time a "18 November" date comes round, counted from the sample's day. */
export function nextDate(value: string) {
  const m = /^(\d{1,2}) ([A-Za-z]+)$/.exec(value), month = m ? MONTHS.indexOf(m[2]) : -1;
  if (!m || month < 0) return undefined;
  const day = Number(m[1]), at = new Date(Date.UTC(snapshot.getUTCFullYear(), month, day));
  if (at.getUTCMonth() !== month || at.getUTCDate() !== day) return undefined;
  if (at < snapshot) at.setUTCFullYear(at.getUTCFullYear() + 1);
  return at;
}
export const daysUntil = (at: Date) => Math.round((at.getTime() - snapshot.getTime()) / 86400000);
export const weekday = (at: Date) => at.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
export const shortDay = (at: Date) => `${at.getUTCDate()} ${MONTHS[at.getUTCMonth()].slice(0, 3)}`;
export const monthName = (m: number) => MONTHS[m];

export type DatedPerson = { person: SeedPerson; at: Date; days: number };
/** Everyone with a date, soonest first. */
export function datedPeople(people: SeedPerson[]): DatedPerson[] {
  return people.flatMap(person => { const at = nextDate(person.date); return at ? [{ person, at, days: daysUntil(at) }] : []; }).sort((a, b) => a.at.getTime() - b.at.getTime());
}
export const kindOf = (p: SeedPerson) => p.id === 'kwame' ? 'memorial' : p.id === 'sam' ? 'anniversary' : 'birthday';

/** Card words for Your people (board copy where the sample knows more than the seed). */
export const peopleWords: Record<string, { tag?: string; sub: string }> = {
  kofi: { sub: 'Your brother · card by Wednesday' },
  mum: { sub: 'Birthday · reminder a week before' },
  priya: { sub: 'Birthday' },
  sam: { sub: 'Anniversary · 5 years' },
  efua: { tag: 'In touch', sub: 'Called 2 weeks ago' },
};
export const turning: Record<string, number> = { kofi: 31 };
export const quietPerson = { id: 'tom', name: 'Tom', sub: 'Haven’t spoken in 6 weeks' };

/** Kofi's birthday told as a small case: what you said, the card, the gift, the draft (board `person`). */
export const kofiCase = {
  idea1: { when: 'AUGUST · IN A CHAT', text: 'You mentioned {Ghana match tickets.}', chip: 'Gift idea' },
  idea2: { when: 'SEPTEMBER · IN TALK', text: '“His old one’s falling apart.”', gift: 'Running vest', giftSub: 'Gift idea, from what you said' },
  card: { when: 'BY WEDNESDAY', text: 'Order a card, so it lands for Saturday.', post: 'Second-class post takes until Friday.' },
  gift: { when: 'BEFORE SATURDAY', text: 'Get the gift, from your two ideas.' },
  message: { when: 'SATURDAY MORNING', text: 'Message on the day. Life drafts it, you send it.', draft: 'Happy birthday, Kofi! Hope 31 starts well. Call you tonight.' },
  lastSpoke: 'Sunday · phone call',
};
export const planSteps = ['Order a card', 'Get the gift', 'Message on the day'];

/** Kofi's case dated from his real next birthday: the card's day, how the post lands, the gift and the message. */
export function kofiCaseFor(at: Date, days: number) {
  const day = (d: Date) => weekday(d).toUpperCase(), before = (n: number) => new Date(at.getTime() - n * 86400000);
  return {
    ...kofiCase,
    card: { when: days >= 3 ? `BY ${day(before(3))}` : 'TODAY', text: `Order a card, so it lands for ${weekday(at)}.`, post: days >= 3 ? `Second-class post takes until ${weekday(before(1))}.` : days === 2 ? 'First-class post still arrives in time.' : 'Too late for the post. Give it in person.' },
    gift: { ...kofiCase.gift, when: `BEFORE ${day(at)}` },
    message: { ...kofiCase.message, when: `${day(at)} MORNING` },
  };
}

/** Contacts offered on Add people (sample address book; the real one is read only with permission). */
export const contacts = [
  { id: 'kofi', initials: 'KM', name: 'Kofi Mensah', date: '18 November', relation: 'Brother' },
  { id: 'priya', initials: 'PS', name: 'Priya Shah', date: '2 December', relation: 'Friend' },
  { id: 'efua', initials: 'EM', name: 'Efua Mensah', date: '', relation: 'Grandma' },
  { id: 'daniel', initials: 'DO', name: 'Daniel Okafor', date: '30 April', relation: 'Friend' },
  { id: 'hannah', initials: 'HL', name: 'Hannah Lee', date: '', relation: 'Friend' },
];
