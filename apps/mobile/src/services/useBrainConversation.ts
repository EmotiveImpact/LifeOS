import { useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { BrainError, reconcilePendingRequest, terms, isMemoryOverview, type Conversation, type Request, type Result } from '@life/brain';
import { useSeed } from '@/state/SeedProvider';
import { brain } from './brain';
import { brainContext } from './brainContext';
import { proposalRecord } from './brainState';
import { memoriesFor, noteUse } from './memory';
import { enqueue, errorMessage, postMessage, replyMessage, waitingMessage, waits } from './aiQueue';
import { flushAiQueue } from './useAiQueue';

export function newConversation(): Conversation { const now = new Date().toISOString(); return { id: Crypto.randomUUID(), title: 'New conversation', createdAt: now, updatedAt: now, messages: [], attachments: [] }; }
export function useBrainConversation() {
  const { data, update, set } = useSeed();
  const current = data.brain.conversations.find(thread => thread.id === data.brain.activeConversationId);
  const latest = useRef(data); latest.current = data;
  const controller = useRef<AbortController | null>(null);
  const [thinking, setThinking] = useState(false), [pending, setPending] = useState<{ request: Request; conversationId: string } | null>(null);
  const locked = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (data.prefs.privateMode) { controller.current?.abort(); setPending(null); } }, [data.prefs.privateMode]);
  const append = (id: string, message: Conversation['messages'][number]) => update(state => ({ ...state, brain: postMessage(state.brain, id, message) }));
  const run = async (request: Request, conversationId: string) => {
    if (locked.current) return;
    if (request.consent && latest.current.prefs.privateMode) return;
    locked.current = true; setThinking(true); setPending(null);
    const running = new AbortController(); controller.current = running;
    try {
      const reply: Result = await brain.run(request, running.signal);
      if (running.signal.aborted) return;
      // Memories the answer cited count as useful, which lifts them next time.
      update(state => ({ ...state, brain: postMessage(state.brain, conversationId, replyMessage(request, reply)), memories: noteUse(state.memories, reply.output?.citations ?? reply.sources.map(s => s.id)) }));
      // The connection is back, so anything still waiting goes now.
      void flushAiQueue();
    } catch (error) {
      if (error instanceof BrainError && error.code === 'CONSENT_REQUIRED') setPending({ request, conversationId });
      // Offline, or every model busy: the request waits on this phone and is answered here when life is back.
      else if (waits(error) && !running.signal.aborted) update(state => ({ ...state, aiQueue: enqueue(state.aiQueue ?? [], { id: request.id, request, conversationId, at: new Date().toISOString() }), brain: postMessage(state.brain, conversationId, waitingMessage(request, undefined, error.message)) }));
      else if (!running.signal.aborted) append(conversationId, errorMessage(request, error));
    } finally { if (controller.current === running) controller.current = null; locked.current = false; setThinking(false); }
  };
  const send = async (text: string) => {
    if (locked.current || !text.trim() || pending) return;
    const state = latest.current;
    let thread = state.brain.conversations.find(value => value.id === state.brain.activeConversationId);
    if (!thread) { thread = newConversation(); const created = thread; update(value => ({ ...value, brain: { ...value.brain, activeConversationId: created.id, conversations: [...value.brain.conversations, created] } })); }
    const now = new Date().toISOString(), id = Crypto.randomUUID();
    if (!thread.messages.length) { const threadId = thread.id; update(value => ({ ...value, brain: { ...value.brain, conversations: value.brain.conversations.map(item => item.id === threadId ? { ...item, title: text.trim().slice(0, 70) } : item) } })); }
    append(thread.id, { id, role: 'user', text: text.trim(), at: now, attachmentIds: thread.attachments.map(attachment => attachment.id) });
    const context = brainContext(state);
    // Retrieval is local. The model gets a bounded, relevant context, not the
    // entire personal store. The full transcript remains saved on the phone.
    const words = new Set(terms(text));
    const money = /\b(?:money|tax|income|salary|pay|company|pension|rent|buy|finance|bill)\b/i.test(text);
    context.facts = context.facts.filter(fact => fact.id.startsWith('income.') ? money : fact.id === 'life.score' ? /doing|score|progress/i.test(text) : terms(fact.label).some(word => words.has(word)));
    context.memories = isMemoryOverview(text) ? context.memories.slice(0, 6) : memoriesFor(text, context.memories, state.memories);
    if (!/urgent|next|plan|today|start|overwhelmed|move/i.test(text)) context.moves = [];
    const request: Request = { id, job: 'ask', text: text.trim(), context, history: thread.messages.filter(message => !message.error).slice(-20).map(({ role, text: message }) => ({ role, text: message })), attachments: thread.attachments, privateMode: state.prefs.privateMode, consent: null };
    await run(request, thread.id);
  };
  return { current, thinking, pending, send, stop: () => { controller.current?.abort(); setThinking(false); }, allowNetwork: () => pending ? (() => { const state = latest.current; const context = brainContext(state); const thread = state.brain.conversations.find(item => item.id === pending.conversationId); const current = reconcilePendingRequest(pending.request, context, new Set(thread?.attachments.map(attachment => attachment.id) ?? [])); return run({ ...current, consent: { requestId: current.id, locations: ['server', 'cloud'] } }, pending.conversationId); })() : Promise.resolve(), declineNetwork: () => setPending(null), review: (proposals: NonNullable<Conversation['messages'][number]['proposals']>) => { set({ proposals: proposals.map(proposal => proposalRecord(proposal, 'chat')) }); }, newThread: () => update(state => ({ ...state, brain: { ...state.brain, activeConversationId: null } })), openThread: (id: string) => update(state => ({ ...state, brain: { ...state.brain, activeConversationId: id } })) };
}
