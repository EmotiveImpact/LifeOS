import { analyseTeachBack, screenWords, type AnalyseData } from '@life/brain';
import * as Crypto from 'expo-crypto';
import { proposalRecord } from './brainState';
import { brain } from './brain';

/** Compatibility facade: no canned sample facts or fabricated lesson grades. */
export const ai = {
  // Words in distress file nothing and carry the support reply (`support`).
  talk: async (text: string) => { const words = screenWords(text); return { data: words.proposals.map(proposal => proposalRecord(proposal, 'talk')), support: words.support, mode: 'rules' as const }; },
  extract: async (text: string) => { const words = screenWords(text); return { data: words.proposals.map(proposal => proposalRecord(proposal, 'document')), support: words.support, mode: 'rules' as const }; },
  run: brain.run,
  capabilities: brain.capabilities,
  /** A tell-back, checked by life's rules, and by the phone's own model when it has one. A lesson never sends your
   * words off the phone: the request is marked private, so only an on-device model may take it. `parts` are the
   * lesson's links, so the model says which ones you explained, quoting you. */
  analyse: async (text: string, parts: string[] = []): Promise<ReturnType<typeof analyseTeachBack> & { model?: AnalyseData }> => {
    const local = analyseTeachBack(text);
    if (local.support || !parts.length) return local;
    try {
      const result = await brain.run({ id: Crypto.randomUUID(), job: 'analyse', text, context: { sample: false, facts: [], memories: [], moves: [] }, history: [{ role: 'life', text: `The parts of the idea to listen for: ${parts.join('; ')}. Name a part only if they explained it.` }], attachments: [], privateMode: true, consent: null }, undefined, { rules: false });
      return result.data ? { ...local, model: result.data as AnalyseData } : local;
    } catch { return local; }
  },
};
