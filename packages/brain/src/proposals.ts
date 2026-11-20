/**
 * The proposal schema. A proposal is accepted when its shape is right and
 * everything in it is grounded in the words it quotes: the quote must appear
 * in what you said (or in a file you asked life to read), and every number,
 * name, month and "how often" in it must appear in that quote. This replaces
 * the old rule that a model could only repeat what the patterns had found,
 * so a model can file a birthday or a bill the patterns missed, but it still
 * cannot invent one.
 */
import { BrainError, type Area, type DocumentKind, type Field, type Frequency, type Proposal, type ProposalDetails, type When } from './types.ts';

const reject = (): never => { throw new BrainError('INVALID_OUTPUT', 'The model proposed an unsupported change. Nothing was filed.'); };
const check = (ok: unknown): void => { if (!ok) reject(); };

// ---------------------------------------------------------------- words

/** Lower case, straight quotes, single spaces: how quotes are compared. */
export const plainWords = (text: string): string => text.normalize('NFKC').toLowerCase().replace(/[’‘ʼ`´]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const trimQuote = (text: string) => plainWords(text).replace(/^[\s"'.,;:!-]+|[\s"',;:-]+$/g, '');
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH = '\\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\b';
export const monthNumber = (word: string): number => ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(word.slice(0, 3).toLowerCase()) + 1;

const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const ORDINALS = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, twentieth: 20, thirtieth: 30 };
const WORD_NUMBERS = new Map<string, number>([...UNITS.map((w, i) => [w, i] as const), ...ORDINALS.map((w, i) => [w, i] as const), ...Object.entries(TENS), ['hundred', 100], ['a dozen', 12]]);

/** Every number a piece of text states: digits (with commas, decimals, "k"),
 * ordinals (3rd) and number words up to ninety-nine (third, twenty-first). */
export function numbersIn(text: string): number[] {
  const t = plainWords(text), out: number[] = [];
  for (const m of t.matchAll(/(\d[\d,]*(?:\.\d+)?)(k\b|m\b)?/g)) {
    const n = Number(m[1].replace(/,/g, '').replace(/\.$/, ''));
    if (!Number.isFinite(n)) continue;
    out.push(n);
    if (m[2] === 'k') out.push(n * 1000);
    if (m[2] === 'm') out.push(n * 1e6);
  }
  for (const m of t.matchAll(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[- ]([a-z]+)\b/g)) {
    const unit = UNITS.indexOf(m[2]) >= 0 ? UNITS.indexOf(m[2]) : ORDINALS.indexOf(m[2]);
    if (unit > 0 && unit < 10) out.push(TENS[m[1]] + unit);
  }
  for (const m of t.matchAll(/\b[a-z]+\b/g)) { const n = WORD_NUMBERS.get(m[0]); if (n !== undefined) out.push(n); }
  return out;
}
const stated = (numbers: number[], n: number) => numbers.some(x => Math.abs(x - n) < 0.005);
const mentions = (quote: string, words: string) => plainWords(quote).includes(plainWords(words));
const HYPOTHETICAL = /\b(?:if|suppose|imagine|hypothetically|would|used to|no longer)\b/i;

// ---------------------------------------------------------------- dates

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am', hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`;
}
/** "4 May", "August 2027", "1 March 2027 at 3pm". British order, no commas. */
export function whenText(when: When): string {
  return [when.day, when.month ? MONTH_NAMES[when.month - 1] : undefined, when.year].filter(v => v !== undefined).join(' ') + (when.time ? ` at ${formatTime(when.time)}` : '');
}
const D_M = new RegExp(`^(\\d{1,2})(?:st|nd|rd|th)?(?: of)? ${MONTH}(?:,? (\\d{4}))?`, 'i');
const M_D = new RegExp(`^${MONTH} (\\d{1,2})(?:st|nd|rd|th)?\\b(?:,? (\\d{4}))?`, 'i');
const M_Y = new RegExp(`^${MONTH},? (\\d{4})\\b`, 'i');
const M_ONLY = new RegExp(`^${MONTH}`, 'i');
const Y_ONLY = /^(\d{4})\b/;
/** Reads a date at the start of `text`. `loose` also accepts a month or a
 * year on its own (for expiries); otherwise a day and a month are needed. */
export function readDate(text: string, loose = false): When | null {
  const t = text.trim();
  let m: RegExpMatchArray | null;
  const valid = (w: When) => (!w.day || (w.day >= 1 && w.day <= 31)) && (!w.year || (w.year >= 1900 && w.year <= 2100)) ? w : null;
  if ((m = t.match(D_M))) return valid({ day: Number(m[1]), month: monthNumber(m[2]), ...(m[3] ? { year: Number(m[3]) } : {}) });
  if ((m = t.match(M_D))) return valid({ month: monthNumber(m[1]), day: Number(m[2]), ...(m[3] ? { year: Number(m[3]) } : {}) });
  if (!loose) return null;
  if ((m = t.match(M_Y))) return valid({ month: monthNumber(m[1]), year: Number(m[2]) });
  if ((m = t.match(M_ONLY)) && m[1].toLowerCase() !== 'may') return { month: monthNumber(m[1]) };
  if ((m = t.match(M_ONLY))) return { month: 5 };
  if ((m = t.match(Y_ONLY))) return valid({ year: Number(m[1]) });
  return null;
}
const readTime = (text: string): string | undefined => {
  const m = text.match(/^\s*at (\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i);
  if (!m) return undefined;
  let h = Number(m[1]); const min = Number(m[2] ?? 0);
  if (m[3]?.toLowerCase() === 'pm' && h < 12) h += 12;
  if (m[3]?.toLowerCase() === 'am' && h === 12) h = 0;
  return h <= 23 && min <= 59 ? `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}` : undefined;
};

// ---------------------------------------------------------------- the kinds

export const FIELD_AREAS: Record<Field, Area[]> = {
  age: ['you'], location: ['you'], household: ['home'], work: ['work'], income: ['money'], rent: ['money'], goal: ['goal'],
  note: ['you', 'home', 'work', 'money', 'health', 'goal'],
  bill: ['money', 'home'], subscription: ['money'], date: ['you'], person: ['you'], document: ['you', 'home', 'money'], appointment: ['health', 'you', 'work', 'home'],
};
const RECORD_FIELDS = new Set<Field>(['bill', 'subscription', 'date', 'person', 'document', 'appointment']);
const FREQUENCY_CUES: Record<Frequency, RegExp> = { weekly: /\bweek(?:ly)?\b/, monthly: /\bmonth(?:ly)?\b|\bpcm\b/, quarterly: /\bquarter(?:ly)?\b/, yearly: /\byear(?:ly)?\b|\bannual(?:ly)?\b|\bannum\b/ };
const DOCUMENTS: [DocumentKind, string, string][] = [
  ['passport', 'passport', 'Passport'],
  ['driving-licence', "driving licen[cs]e|driver'?s licen[cs]e", 'Driving licence'],
  ['mot', 'mot', 'MOT'],
  ['car-insurance', 'car insurance', 'Car insurance'],
  ['home-insurance', 'home insurance|contents insurance|buildings insurance', 'Home insurance'],
  ['tv-licence', 'tv licen[cs]e', 'TV licence'],
  ['railcard', 'railcard', 'Railcard'],
  ['visa', 'visa', 'Visa'],
  ['residence-permit', 'biometric residence permit|residence permit|brp', 'Residence permit'],
  ['ghic', 'ghic|ehic', 'GHIC'],
  ['car-tax', 'car tax|vehicle tax|road tax', 'Car tax'],
  ['boiler-service', 'boiler service', 'Boiler service'],
];
const IDENTITY = new Set<DocumentKind>(['passport', 'driving-licence', 'railcard', 'visa', 'residence-permit', 'ghic']);
const EVENT_CUES = { expires: /\bexpir|\bruns? out\b/, renews: /\brenew/, due: /\bdue\b/ };
export const RELATIONS = ['best friend', 'close friend', 'oldest friend', 'friend', 'sister', 'brother', 'mum', 'mom', 'dad', 'partner', 'wife', 'husband', 'boyfriend', 'girlfriend', 'son', 'daughter', 'boss', 'manager', 'flatmate', 'housemate', 'landlord', 'landlady', 'accountant', 'neighbour', 'cousin', 'nan', 'gran', 'grandma', 'grandad', 'niece', 'nephew', 'uncle', 'aunt', 'auntie', 'aunty', 'godson', 'goddaughter', 'stepdad', 'stepmum', 'stepson', 'stepdaughter', 'fiance', 'fiancee', 'fiancé', 'fiancée'];
const RELATION_RE = RELATIONS.map(r => r.replace(/ /g, '\\s')).join('|');

/** The value a record kind carries, derived from its details. */
export function canonicalValue(details: ProposalDetails): string | number {
  switch (details.kind) {
    case 'bill': case 'subscription': return details.amount;
    case 'date': return `${String(details.when.month).padStart(2, '0')}-${String(details.when.day).padStart(2, '0')}`;
    case 'person': return details.name;
    case 'document': case 'appointment': return whenText(details.when);
  }
}

// ---------------------------------------------------------------- the check

const keysOnly = (value: object, allowed: string[], required: string[]) => {
  const keys = Object.keys(value);
  check(keys.every(k => allowed.includes(k)) && required.every(k => keys.includes(k)));
};
const isText = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const isInt = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
function checkWhen(when: unknown, quote: string, numbers: number[], need: { day?: boolean; month?: boolean; time?: boolean; monthOrYear?: boolean }): asserts when is When {
  check(when && typeof when === 'object' && !Array.isArray(when));
  const w = when as Record<string, unknown>;
  keysOnly(w, need.time ? ['year', 'month', 'day', 'time'] : ['year', 'month', 'day'], []);
  if (need.day) check(w.day !== undefined);
  if (need.month) check(w.month !== undefined);
  if (need.monthOrYear) check(w.month !== undefined || w.year !== undefined);
  if (w.month !== undefined) { check(isInt(w.month, 1, 12)); check(new RegExp(MONTH, 'gi').test(quote) && [...quote.matchAll(new RegExp(MONTH, 'gi'))].some(m => monthNumber(m[1]) === w.month)); }
  if (w.day !== undefined) { check(isInt(w.day, 1, 31) && stated(numbers, w.day as number)); check(w.month !== undefined); }
  if (w.year !== undefined) check(isInt(w.year, 1900, 2100) && stated(numbers, w.year as number));
  if (w.time !== undefined) {
    check(typeof w.time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(w.time));
    const h = Number((w.time as string).slice(0, 2));
    check(stated(numbers, h) || stated(numbers, h - 12) || (h === 0 && stated(numbers, 12)));
  }
}

/** Validates one proposal against the evidence it claims to quote. Returns
 * it unchanged, or throws INVALID_OUTPUT. */
export function validateProposal(raw: unknown, evidence: string): Proposal {
  check(raw && typeof raw === 'object' && !Array.isArray(raw));
  const p = raw as Record<string, unknown>;
  keysOnly(p, ['id', 'field', 'label', 'area', 'quote', 'value', 'details'], ['id', 'field', 'label', 'area', 'quote', 'value']);
  check(typeof p.id === 'string' && /^[a-z0-9][a-z0-9:_-]{0,119}$/i.test(p.id));
  check(typeof p.field === 'string' && p.field in FIELD_AREAS);
  const field = p.field as Field;
  check(FIELD_AREAS[field].includes(p.area as Area));
  check(isText(p.label, 160) && isText(p.quote, 500));
  const quote = p.quote as string;
  check(!quote.trim().endsWith('?') && !HYPOTHETICAL.test(quote));
  check(plainWords(evidence).includes(trimQuote(quote)));
  check(typeof p.value === 'string' || (typeof p.value === 'number' && Number.isFinite(p.value)));
  const numbers = numbersIn(quote), value = p.value;
  for (const n of numbersIn(p.label as string)) check(stated(numbers, n));
  const q = plainWords(quote);
  if (!RECORD_FIELDS.has(field)) check(p.details === undefined);
  switch (field) {
    case 'age': check(isInt(value, 18, 120) && stated(numbers, value as number)); break;
    case 'location': check(isText(value, 60) && mentions(quote, value as string)); break;
    case 'household': check(isInt(value, 1, 16) && ((value === 1 && /\balone\b/.test(q)) || stated(numbers, (value as number) - 1) || stated(numbers, value as number))); break;
    case 'work': check((value === 'sole-trader' && /self-employed|freelanc|sole trader|own business|contractor/.test(q)) || (value === 'employed' && /\bemploy|\bjob\b|\bwork (?:for|at)\b/.test(q))); break;
    case 'income': check(typeof value === 'number' && value > 0 && value <= 1e9 && (stated(numbers, value) || (stated(numbers, value / 12) && /\bmonth/.test(q)))); break;
    case 'rent': check(typeof value === 'number' && value > 0 && value <= 1e6 && stated(numbers, value) && /\brent\b/.test(q)); break;
    case 'goal': check((value === 'buy-home' && /\b(?:buy|own)\b/.test(q)) || (isText(value, 200) && mentions(quote, value as string))); break;
    case 'note': check(isText(value, 500) && mentions(quote, value as string)); break;
    default: {
      check(p.details && typeof p.details === 'object' && !Array.isArray(p.details));
      const d = p.details as Record<string, unknown>;
      check(d.kind === field);
      if (field === 'bill' || field === 'subscription') {
        const name = field === 'bill' ? 'payee' : 'service';
        keysOnly(d, field === 'bill' ? ['kind', 'payee', 'amount', 'frequency', 'dueDay'] : ['kind', 'service', 'amount', 'frequency'], ['kind', name, 'amount']);
        check(isText(d[name], 60) && mentions(quote, d[name] as string));
        check(typeof d.amount === 'number' && d.amount > 0 && d.amount <= 1e6 && stated(numbers, d.amount));
        if (d.frequency !== undefined) check(typeof d.frequency === 'string' && d.frequency in FREQUENCY_CUES && FREQUENCY_CUES[d.frequency as Frequency].test(q));
        if (d.dueDay !== undefined) check(isInt(d.dueDay, 1, 31) && stated(numbers, d.dueDay as number));
      } else if (field === 'date') {
        keysOnly(d, ['kind', 'person', 'occasion', 'when'], ['kind', 'person', 'occasion', 'when']);
        check(isText(d.person, 60));
        check(d.person === 'Me' ? /\bmy\b/.test(q) : d.person === 'Us' ? /\bour\b/.test(q) : mentions(quote, d.person as string));
        check((d.occasion === 'birthday' && /\b(?:birthday|bday|born|turns?|turning)\b/.test(q)) || (d.occasion === 'anniversary' && /\banniversary\b/.test(q)));
        checkWhen(d.when, quote, numbers, { day: true, month: true });
      } else if (field === 'person') {
        keysOnly(d, ['kind', 'name', 'relation'], ['kind', 'name', 'relation']);
        check(isText(d.name, 60) && mentions(quote, d.name as string));
        check(typeof d.relation === 'string' && RELATIONS.includes(d.relation) && mentions(quote, d.relation));
      } else if (field === 'document') {
        keysOnly(d, ['kind', 'document', 'event', 'when'], ['kind', 'document', 'event', 'when']);
        const doc = DOCUMENTS.find(([kind]) => kind === d.document);
        check(doc && new RegExp(`\\b(?:${doc[1]})\\b`).test(q));
        check(typeof d.event === 'string' && d.event in EVENT_CUES && EVENT_CUES[d.event as keyof typeof EVENT_CUES].test(q));
        checkWhen(d.when, quote, numbers, { monthOrYear: true });
      } else if (field === 'appointment') {
        keysOnly(d, ['kind', 'what', 'when'], ['kind', 'what', 'when']);
        check(isText(d.what, 60) && mentions(quote, d.what as string));
        checkWhen(d.when, quote, numbers, { day: true, month: true, time: true });
      }
      check(value === canonicalValue(d as ProposalDetails));
    }
  }
  return raw as Proposal;
}

// ---------------------------------------------------------------- rules filing

export type Add = (field: Field, area: Area, label: string, quote: string, value: string | number, details?: ProposalDetails, id?: string) => void;
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const NAMES: Record<string, string> = { 'tv licence': 'TV licence', 'tv license': 'TV licence', icloud: 'iCloud', 'icloud+': 'iCloud+', 'youtube premium': 'YouTube Premium', 'now tv': 'NOW TV', 'ps plus': 'PS Plus', 'playstation plus': 'PlayStation Plus', 'chatgpt plus': 'ChatGPT Plus', 'apple tv+': 'Apple TV+', 'apple tv': 'Apple TV', 'disney+': 'Disney+', gp: 'GP', mot: 'MOT', 'microsoft 365': 'Microsoft 365', dazn: 'DAZN', britbox: 'BritBox' };
const display = (s: string) => NAMES[s.toLowerCase()] ?? capitalise(s.toLowerCase());
const BILLS = "council tax|water(?: bill)?|electric(?:ity)?(?: bill)?|gas(?: bill)?|energy(?: bill)?|broadband(?: bill)?|internet(?: bill)?|(?:mobile )?phone(?: bill| contract)?|tv licen[cs]e|car insurance|home insurance|contents insurance|life insurance|pet insurance|mortgage|childcare|nursery fees|car finance|car payment|gym(?: membership)?|[a-z]+ bill";
const SUBS = 'netflix|spotify|disney\\+|disney plus|amazon prime|prime video|apple music|apple tv\\+?|apple one|icloud\\+?|youtube premium|now tv|audible|xbox game pass|game pass|playstation plus|ps plus|adobe(?: creative cloud)?|deliveroo plus|uber one|duolingo|headspace|strava|chatgpt plus|claude pro|microsoft 365|office 365|dropbox|patreon|paramount\\+|britbox|dazn';
const SUB_RE = new RegExp(`^(?:${SUBS})$`, 'i');
const AMOUNT = '£\\s?(\\d[\\d,]*(?:\\.\\d{1,2})?)';
const FREQ = '(?:\\s*(?:a|per|every|each)\\s+(week|month|quarter|year)|\\s+(weekly|monthly|quarterly|yearly|annually|pcm))?';
const MONEY_A = new RegExp(`\\b(?:my |the |our )?(${BILLS}|${SUBS})\\s+(?:is|costs?(?: me)?|comes to|went up to|has gone up to|is going up to)\\s+${AMOUNT}${FREQ}`, 'i');
const MONEY_B = new RegExp(`\\bi pay\\s+${AMOUNT}${FREQ}\\s+(?:for|on)\\s+(?:my |the |our )?(${BILLS}|${SUBS})\\b`, 'i');
const NOT_PAYEES = new Set(['the bill', 'a bill', 'my bill', 'our bill', 'this bill', 'that bill', 'total bill', 'restaurant bill', 'dinner bill', 'lunch bill']);
const frequencyOf = (word?: string): Frequency | undefined => !word ? undefined : /week/i.test(word) ? 'weekly' : /month|pcm/i.test(word) ? 'monthly' : /quarter/i.test(word) ? 'quarterly' : 'yearly';
const PER: Record<Frequency, string> = { weekly: 'a week', monthly: 'a month', quarterly: 'a quarter', yearly: 'a year' };
// Case matters here: a second name word must be capitalised, so "for Kofi's
// birthday" reads as Kofi, not "for Kofi". A lone name may be lower case
// (speech recognisers sometimes drop capitals).
const OCCASION = new RegExp(`(?<![\\p{L}])(?:([Mm]y|[Oo]ur) (${RELATION_RE})|(\\p{Lu}[\\p{L}-]+ \\p{Lu}[\\p{L}-]+|\\p{L}[\\p{L}-]+))'s ([Bb]irthday|[Bb]day|[Aa]nniversary)\\b|\\b([Mm]y|[Oo]ur) ([Bb]irthday|[Aa]nniversary)\\b`, 'u');
const NOT_NAMES = new Set(['it', 'that', 'this', 'what', 'who', 'today', 'tomorrow', 'yesterday', 'everyone', 'someone', 'his', 'her', 'their', 'one', 'there', 'here', 'mine']);
const DOCUMENT_RE = new RegExp(`\\b(?:my |the |our )?(${DOCUMENTS.map(d => d[1]).join('|')})\\b(?:\\s+(?:is|was))?\\s+(expires?|runs out|is due|due|renews?|is up for renewal|needs renewing)(?:\\s+(?:on|in|by|at the end of))?(?:\\s+the)?\\s+`, 'i');
const APPOINTMENTS: [string, Area][] = [['dentist', 'health'], ['gp', 'health'], ['doctor', 'health'], ['optician', 'health'], ['hospital', 'health'], ['physio', 'health'], ['physiotherapist', 'health'], ['nurse', 'health'], ['hygienist', 'health'], ['therapist', 'health'], ['counsellor', 'health'], ['smear test', 'health'], ['blood test', 'health'], ['eye test', 'health'], ['vaccination', 'health'], ['scan', 'health'], ['vet', 'home'], ['interview', 'work'], ['hairdresser', 'you'], ['barber', 'you']];
const APPOINTMENT_RE = new RegExp(`\\b(${APPOINTMENTS.map(a => a[0]).join('|')})(?:'s)?(?:\\s+(?:appointment|appt|check-?up))?\\b`, 'i');
const APPOINTMENT_CUE = /\b(?:appointment|appt|booked|book(?:ed)? in|have an?|got an?|i'?m seeing|seeing the|check-?up)\b/i;
const PERSON_RE = new RegExp(`\\b[Mm]y (${RELATION_RE})(?:'s name)? is (?:called |named )?(\\p{Lu}[\\p{L}'-]+(?: \\p{Lu}[\\p{L}'-]+)?)`, 'u');
const PERSON_CUE = /'s name is|\bis (?:called|named)\b/i;

/** The record kinds, read from one clause. `raw` is kept as the quote. */
export function extractRecords(clause: string, raw: string, add: Add, hash: (text: string) => string): void {
  let m: RegExpMatchArray | null;
  // Birthdays and anniversaries.
  if ((m = clause.match(OCCASION)) && m.index !== undefined) {
    const occasion = /anniversary/i.test(m[4] ?? m[6]) ? 'anniversary' as const : 'birthday' as const;
    const who = m[1] && m[2] ? display(m[2]) : m[3] ? m[3] : m[5]?.toLowerCase() === 'our' ? 'Us' : 'Me';
    const rest = clause.slice(m.index + m[0].length).replace(/^\s*(?:is|falls|was|'s)?\s*(?:on\s+)?(?:the\s+)?/i, '');
    const when = readDate(rest);
    if (when && !NOT_NAMES.has(who.toLowerCase())) {
      const person = m[3] ? capitalise(who) : who;
      const owner = person === 'Me' || person === 'Us' ? 'Your' : `${person}’s`;
      add('date', 'you', `${owner} ${occasion}, ${whenText(when)}`, raw, canonicalValue({ kind: 'date', person, occasion, when }), { kind: 'date', person, occasion, when }, `date-${hash(`${person}:${occasion}`.toLowerCase())}`);
    }
  }
  // Bills and subscriptions.
  const money = (m = clause.match(MONEY_A)) ? { name: m[1], amount: m[2], freq: m[3] ?? m[4] } : (m = clause.match(MONEY_B)) ? { name: m[4], amount: m[1], freq: m[2] ?? m[3] } : null;
  if (money && !NOT_PAYEES.has(money.name.toLowerCase())) {
    const amount = Number(money.amount.replace(/,/g, '')), frequency = frequencyOf(money.freq), name = display(money.name);
    const due = clause.match(/\bdue (?:on )?(?:the )?(\d{1,2})(?:st|nd|rd|th)\b/i), dueDay = due ? Number(due[1]) : undefined;
    const label = `${name} £${money.amount}${frequency ? ` ${PER[frequency]}` : ''}`;
    if (amount > 0 && amount <= 1e6) {
      if (SUB_RE.test(money.name)) add('subscription', 'money', label, raw, amount, { kind: 'subscription', service: name, amount, ...(frequency ? { frequency } : {}) }, `sub-${hash(name.toLowerCase())}`);
      else add('bill', 'money', label, raw, amount, { kind: 'bill', payee: name, amount, ...(frequency ? { frequency } : {}), ...(dueDay && dueDay <= 31 ? { dueDay } : {}) }, `bill-${hash(name.toLowerCase())}`);
    }
  }
  // Document expiries and renewals.
  if ((m = clause.match(DOCUMENT_RE)) && m.index !== undefined) {
    const doc = DOCUMENTS.find(([, pattern]) => new RegExp(`^(?:${pattern})$`, 'i').test(m![1]))!;
    const event = /expir|run/i.test(m[2]) ? 'expires' as const : /renew/i.test(m[2]) ? 'renews' as const : 'due' as const;
    const when = readDate(clause.slice(m.index + m[0].length), true);
    if (when) add('document', IDENTITY.has(doc[0]) ? 'you' : 'home', `${doc[2]} ${event} ${whenText(when)}`, raw, whenText(when), { kind: 'document', document: doc[0], event, when }, `doc-${doc[0]}`);
  }
  // Appointments on a known date.
  if ((m = clause.match(APPOINTMENT_RE)) && m.index !== undefined && APPOINTMENT_CUE.test(clause)) {
    const after = clause.slice(m.index + m[0].length);
    const on = after.match(/^(?:[^.?!]{0,30}?)\b(?:on|for)\s+(?:the\s+)?/i);
    const when = on ? readDate(after.slice(on[0].length)) : null;
    if (when) {
      const tail = after.slice(on![0].length).replace(D_M, '').replace(M_D, '');
      const time = readTime(tail);
      const full: When = { ...when, ...(time ? { time } : {}) };
      const what = display(m[1]), area = APPOINTMENTS.find(([name]) => name === m![1].toLowerCase())?.[1] ?? 'you';
      add('appointment', area, `${what}, ${whenText(full)}`, raw, whenText(full), { kind: 'appointment', what, when: full }, `appt-${hash(`${what}:${whenText(full)}`.toLowerCase())}`);
    }
  }
  // People you name, with how they relate to you.
  if (PERSON_CUE.test(clause) && (m = clause.match(PERSON_RE))) {
    const relation = m[1].toLowerCase().replace(/\s+/g, ' '), name = m[2];
    add('person', 'you', `${name}, your ${relation}`, raw, name, { kind: 'person', name, relation }, `person-${hash(name.toLowerCase())}`);
  }
}
