import type { Request } from '../../packages/brain/src/index.ts';

/** The same base request as runtime.test.ts, shared by the newer brain tests. */
export function request(text = 'Explain this carefully'): Request {
  return { id: 'request-a', job: 'ask', text, context: { sample: false, moves: [], memories: [], facts: [{ id: 'net', label: 'Take-home', value: '£2,400', source: { id: 'engine:income', label: 'Income calculator', kind: 'engine' } }] }, history: [], attachments: [], privateMode: false, consent: null };
}
