import { detectCrisis, supportResponse, type SupportReply } from './safety.ts';

export type TeachBackAnalysis = { mode: 'rules'; understood: ('allowance' | 'letter')[]; gaps: ('allowance' | 'letter')[]; support?: SupportReply };
export function analyseTeachBack(text: string): TeachBackAnalysis {
  const normal = text.toLowerCase();
  const understood: TeachBackAnalysis['understood'] = [];
  if (/\b(?:allowance|tax[- ]?free|before tax|earn before tax|number)\b/.test(normal)) understood.push('allowance');
  if (/\b(?:letter|payroll|employer|rules? appl(?:y|ies))\b/.test(normal)) understood.push('letter');
  const gaps = (['allowance', 'letter'] as const).filter(part => !understood.includes(part));
  // A tell-back is spoken in your own words, so it gets the same crisis check as Talk and chat.
  const crisis = detectCrisis(text);
  return crisis ? { mode: 'rules', understood, gaps, support: supportResponse(crisis) } : { mode: 'rules', understood, gaps };
}
