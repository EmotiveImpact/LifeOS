export type TeachBackAnalysis = { mode: 'rules'; understood: ('allowance' | 'letter')[]; gaps: ('allowance' | 'letter')[] };
export function analyseTeachBack(text: string): TeachBackAnalysis {
  const normal = text.toLowerCase();
  const understood: TeachBackAnalysis['understood'] = [];
  if (/\b(?:allowance|tax[- ]?free|before tax|earn before tax|number)\b/.test(normal)) understood.push('allowance');
  if (/\b(?:letter|payroll|employer|rules? appl(?:y|ies))\b/.test(normal)) understood.push('letter');
  const gaps = (['allowance', 'letter'] as const).filter(part => !understood.includes(part));
  return { mode: 'rules', understood, gaps };
}
