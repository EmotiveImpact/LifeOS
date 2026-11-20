import type { Proposal } from './types.ts';
import { extractRecords, type Add } from './proposals.ts';
import { detectCrisis, supportResponse, type CrisisSignal, type SupportReply } from './safety.ts';

/** Conservative offline extraction. Only explicit statements; no
 * keyword-to-profile mutations, hypothetical facts, or fabricated seed records.
 * Profile facts, goals and notes here; bills, subscriptions, dates, people,
 * documents and appointments in proposals.ts. */
export function extractStatements(text: string): Proposal[] {
  const proposals: Proposal[] = [];
  const add: Add = (field, area, label, quote, value, details, given) => {
    const id = given ?? (field === 'note' ? `note-${hash(quote.toLowerCase())}` : `profile-${field}`);
    const at = proposals.findIndex(p => p.id === id);
    const proposal: Proposal = details ? { id, field, area, label, quote: quote.trim(), value, details } : { id, field, area, label, quote: quote.trim(), value };
    if (at >= 0) proposals[at] = proposal; else proposals.push(proposal);
  };
  for (const raw of text.split(/(?<=[.!?\n])\s+|\n+/)) {
    const clause = raw.trim().replace(/[’]/g, "'");
    if (!clause || clause.endsWith('?') || /\b(?:if|suppose|imagine|hypothetically|would|used to|no longer)\b/i.test(clause)) continue;
    let m: RegExpMatchArray | null;
    if ((m = clause.match(/\b(?:i am|i'm)\s+(\d{1,3})(?:\s+years?\s+old)?\b/i))) {
      const age = Number(m[1]); if (age >= 18 && age <= 120) add('age', 'you', `Age ${age}`, raw, age);
    }
    if ((m = clause.match(/\bi (?:live|am living) in\s+(London|Manchester|New York|NYC|Berlin|Lagos)\b/i))) {
      const cities: Record<string, string> = { london: 'London', manchester: 'Manchester', 'new york': 'New York', nyc: 'New York', berlin: 'Berlin', lagos: 'Lagos' };
      const city = cities[m[1].toLowerCase()]; add('location', 'you', `Lives in ${city}`, raw, city);
    }
    if (/\bi (?:live|am living) alone\b/i.test(clause)) add('household', 'home', 'Lives alone', raw, 1);
    if ((m = clause.match(/\bi (?:live|am living|share (?:a |my )?(?:home|flat|house)) with\s+(\d+|one|two|three|four|five|six)\s+(?:flatmates?|housemates?|other adults?)\b/i))) {
      const numbers: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
      const others = numbers[m[1].toLowerCase()] ?? Number(m[1]);
      if (others >= 1 && others <= 15) add('household', 'home', `Shares with ${others} other ${others === 1 ? 'adult' : 'adults'}`, raw, others + 1);
    }
    if (/\b(?:i(?:'m| am) (?:now )?(?:self-employed|freelance|a freelancer)|i(?:'ve| have) (?:just )?gone (?:freelance|self-employed))\b/i.test(clause)) add('work', 'work', 'Self-employed', raw, 'sole-trader');
    else if (/\bi(?:'m| am) (?:now )?(?:employed|an employee)\b/i.test(clause)) add('work', 'work', 'Employed', raw, 'employed');
    if ((m = clause.match(/\b(?:i earn|my (?:annual income|salary|annual profit) is)\s*£?\s*([\d,]+(?:\.\d+)?)\s*(k)?\s*(?:(?:a|per)\s*)?(year|annually|month)\b/i))) {
      const amount = Number(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1) * (m[3].toLowerCase() === 'month' ? 12 : 1);
      if (Number.isFinite(amount) && amount > 0 && amount <= 1e9) add('income', 'money', 'Annual income', raw, amount);
    }
    if ((m = clause.match(/\bmy rent is\s*£?\s*([\d,]+(?:\.\d+)?)\s*(?:(?:a|per)\s*)?month\b/i))) {
      const amount = Number(m[1].replace(/,/g, '')); if (amount > 0 && amount <= 1e6) add('rent', 'money', 'Monthly rent', raw, amount);
    }
    if (/\bi want to buy (?:my (?:first |own )?|a )(?:home|house|flat|place)\b/i.test(clause)) add('goal', 'goal', 'Buy a home', raw, 'buy-home');
    extractRecords(clause, raw, add, hash);
    const note = raw.match(/^\s*(?:please\s+)?remember(?:\s+that)?\s+(.+?)[.!]?\s*$/i);
    if (note?.[1].trim()) add('note', 'you', note[1].trim(), raw, note[1].trim());
  }
  return proposals;
}
export function hash(text: string): string { let value = 2166136261; for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619); return (value >>> 0).toString(16); }

/** Talk's entry point: the crisis check first, then filing. Words in distress
 * file nothing and carry the support reply instead. */
export function screenWords(text: string): { crisis: CrisisSignal | null; support: SupportReply | null; proposals: Proposal[] } {
  const crisis = detectCrisis(text);
  return crisis ? { crisis, support: supportResponse(crisis), proposals: [] } : { crisis: null, support: null, proposals: extractStatements(text) };
}
