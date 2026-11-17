import { analyseTeachBack, extractStatements } from '@life/brain';
import { proposalRecord } from './brainState';
import { brain } from './brain';

/** Compatibility facade: no canned sample facts or fabricated lesson grades. */
export const ai = {
  talk: async (text: string) => ({ data: extractStatements(text).map(proposal => proposalRecord(proposal, 'talk')), mode: 'rules' as const }),
  extract: async (text: string) => ({ data: extractStatements(text).map(proposal => proposalRecord(proposal, 'document')), mode: 'rules' as const }),
  run: brain.run,
  capabilities: brain.capabilities,
  analyse: async (text: string) => analyseTeachBack(text),
};
