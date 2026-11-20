import { analyseTeachBack, screenWords } from '@life/brain';
import { proposalRecord } from './brainState';
import { brain } from './brain';

/** Compatibility facade: no canned sample facts or fabricated lesson grades. */
export const ai = {
  // Words in distress file nothing and carry the support reply (`support`).
  talk: async (text: string) => { const words = screenWords(text); return { data: words.proposals.map(proposal => proposalRecord(proposal, 'talk')), support: words.support, mode: 'rules' as const }; },
  extract: async (text: string) => { const words = screenWords(text); return { data: words.proposals.map(proposal => proposalRecord(proposal, 'document')), support: words.support, mode: 'rules' as const }; },
  run: brain.run,
  capabilities: brain.capabilities,
  analyse: async (text: string) => analyseTeachBack(text),
};
