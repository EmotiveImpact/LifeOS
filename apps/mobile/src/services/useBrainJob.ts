import { useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { BrainError, type Job, type Request, type Result } from '@life/brain';
import { useSeed } from '@/state/SeedProvider';
import { apiConfigured, brain } from './brain';
import { brainContext } from './brainContext';
import { enqueue, postMessage, waitingMessage, waits } from './aiQueue';
import { memoriesFor, noteUse } from './memory';

/**
 * One job sent to a model on purpose, outside a chat (BUILD_V26 Phase 25): "Ask life to read it" in Talk, for a start.
 *
 * - The phone's own model goes first when it has one. Anything leaving the phone shows what it sends and waits for
 *   the person's OK for that one request (`ask`), exactly like chat.
 * - Offline, or every model busy: the request waits in the queue (services/aiQueue.ts) inside a conversation named
 *   for where it came from, so the answer is there to review when life is back (`waiting`).
 * - The answer comes back checked (`done`). What it picked out to file is only ever proposed.
 */
export type JobStep =
  | { step: 'idle' }
  | { step: 'ask'; request: Request }
  | { step: 'working' }
  | { step: 'waiting'; note: string }
  | { step: 'done'; result: Result }
  | { step: 'failed'; message: string };

export function useBrainJob(title: string) {
  const { data, update } = useSeed();
  const latest = useRef(data); latest.current = data;
  const [state, setState] = useState<JobStep>({ step: 'idle' });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (data.prefs.privateMode) { controller.current?.abort(); setState(s => s.step === 'ask' ? { step: 'idle' } : s); } }, [data.prefs.privateMode]);

  const run = async (request: Request) => {
    setState({ step: 'working' });
    const running = new AbortController(); controller.current = running;
    try {
      const result = await brain.run(request, running.signal, { rules: false });
      if (running.signal.aborted) return;
      update(c => ({ ...c, memories: noteUse(c.memories, result.output?.citations ?? []) }));
      setState({ step: 'done', result });
    } catch (error) {
      if (running.signal.aborted) return;
      if (error instanceof BrainError && error.code === 'CONSENT_REQUIRED') { setState({ step: 'ask', request }); return; }
      if (waits(error)) {
        const now = new Date().toISOString(), conversationId = Crypto.randomUUID();
        update(c => {
          const thread = { id: conversationId, title, createdAt: now, updatedAt: now, attachments: [], messages: [{ id: request.id, role: 'user' as const, text: request.text, at: now }] };
          const brainState = postMessage({ ...c.brain, conversations: [...c.brain.conversations, thread] }, conversationId, waitingMessage(request, now, error.message));
          return { ...c, brain: brainState, aiQueue: enqueue(c.aiQueue ?? [], { id: request.id, request, conversationId, at: now, model: true }) };
        });
        setState({ step: 'waiting', note: error.message });
        return;
      }
      setState({ step: 'failed', message: error instanceof Error ? error.message : 'That didn’t work. Nothing was changed.' });
    } finally { if (controller.current === running) controller.current = null; }
  };
  return {
    state,
    /** Whether to offer it: not in private mode, and only when the life API is set up (the phone's own model still goes first). */
    available: !data.prefs.privateMode && apiConfigured,
    /** Builds the request from what life knows that fits these words, then tries the phone's own model; the cloud asks first. */
    start: (job: Job, text: string) => {
      const words = text.trim();
      if (!words || state.step === 'working') return;
      const context = brainContext(latest.current);
      context.memories = memoriesFor(words, context.memories, latest.current.memories);
      context.facts = context.facts.filter(fact => !fact.id.startsWith('income.') && fact.id !== 'life.score');
      context.moves = [];
      void run({ id: Crypto.randomUUID(), job, text: words, context, history: [], attachments: [], privateMode: latest.current.prefs.privateMode, consent: null });
    },
    allow: () => { if (state.step === 'ask' && !latest.current.prefs.privateMode) void run({ ...state.request, consent: { requestId: state.request.id, locations: ['server', 'cloud'] } }); },
    reset: () => { controller.current?.abort(); setState({ step: 'idle' }); },
  };
}
