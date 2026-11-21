/**
 * Requests that wait for a connection (BUILD_V26 Phase 25; review focus 3, "Offline and AI down").
 *
 * When the phone can't reach the life API, a request the person has already sent (and, for anything leaving the
 * phone, already said OK to) waits here instead of failing. The queue is saved with the rest of the phone's state,
 * so closing the app loses nothing. When the phone is back, each request is sent once, oldest first, and its answer
 * lands in the conversation it came from. A request leaves the queue as soon as it has an answer or a final refusal,
 * so it is never sent twice; still offline, it stays and the rest wait behind it.
 */
import { BrainError, type BrainState, type Conversation, type Message, type Request, type Result } from '@life/brain';

/** `model: true` skips life's own rules, for a request the person sent to a model on purpose ("Ask life to read it"). */
export type QueuedAi = { id: string; request: Request; conversationId: string; at: string; model?: boolean };
export type Delivery = { item: QueuedAi; result?: Result; error?: Error };
export const MAX_QUEUED = 20;
const MAX_AGE = 7 * 86_400_000;
export const OFFLINE_NOTE = 'You’re offline. Your message is saved, and Life will answer when you’re back online.';
export const BUSY_NOTE = 'Life’s AI is busy right now. Your message is saved, and Life will answer when it’s back.';
/** Worth another try later: no connection, or every model busy. Anything else is final. */
export const waits = (error: unknown): error is BrainError => error instanceof BrainError && error.code === 'OFFLINE';

/**
 * Turns the phone's reports about its connection into the moments it comes back (fix F-46): only a change from offline
 * to online counts, so a report that it is still online, or the first report, sends nothing.
 */
export function whenBack(back: () => void): (online: boolean) => void {
  let last: boolean | null = null;
  return online => { const was = last; last = online; if (online && was === false) back(); };
}

/** Adds a request once, however often it is offered. The oldest goes first if the queue is full. */
export const enqueue = (queue: QueuedAi[], item: QueuedAi): QueuedAi[] => queue.some(q => q.id === item.id) ? queue : [...queue, item].slice(-MAX_QUEUED);

/** Sends what is waiting, oldest first. Stops at the first request that still can't get through. */
export async function drain(queue: QueuedAi[], send: (item: QueuedAi) => Promise<Result>, now = Date.now()): Promise<{ left: QueuedAi[]; delivered: Delivery[] }> {
  const delivered: Delivery[] = [];
  let left = [...queue];
  for (const item of queue) {
    if (now - Date.parse(item.at) > MAX_AGE) delivered.push({ item, error: new BrainError('UNAVAILABLE', 'This waited more than a week without a connection, so it wasn’t sent. Ask again when you’re ready.') });
    else {
      try { delivered.push({ item, result: await send(item) }); }
      catch (error) {
        if (waits(error)) break;
        delivered.push({ item, error: error instanceof Error ? error : new Error('The answer could not be completed. Your message is saved.') });
      }
    }
    left = left.filter(q => q.id !== item.id);
  }
  return { left, delivered };
}

/** life's reply as a message: the answer, anything it picked out to file (for review, never filed), and its sources. */
const madeText = (data: unknown): string | undefined => { const body = (data as { body?: unknown } | undefined)?.body; return typeof body === 'string' ? body : undefined; };
/** A draft that waited arrives with its text, so it can be copied from the conversation. */
export const replyMessage = (request: Request, reply: Result, at = new Date().toISOString()): Message => ({ id: `${request.id}:reply`, role: 'life', text: reply.answer, detail: reply.detail ?? madeText(reply.data), at, proposals: reply.proposals, sources: reply.sources, route: `${reply.route.location} · ${reply.route.model}` });
export const errorMessage = (request: Request, error: unknown, at = new Date().toISOString()): Message => ({ id: `${request.id}:error`, role: 'life', text: error instanceof Error ? error.message : 'The answer could not be completed. Your message is saved.', at, error: true });
export const waitingMessage = (request: Request, at = new Date().toISOString(), text = OFFLINE_NOTE): Message => ({ id: `${request.id}:waiting`, role: 'life', text, at });

/** Puts a message in its conversation once, replacing the "waiting" note for the same request. */
export function postMessage(state: BrainState, conversationId: string, message: Message): BrainState {
  const requestId = message.id.replace(/:(?:reply|error|waiting)$/, '');
  return { ...state, conversations: state.conversations.map((thread: Conversation) => {
    if (thread.id !== conversationId || thread.messages.some(m => m.id === message.id)) return thread;
    return { ...thread, updatedAt: message.at, messages: [...thread.messages.filter(m => m.id !== `${requestId}:waiting`), message] };
  }) };
}
/** Each delivered answer, or final refusal, into the conversation it came from. */
export const deliver = (state: BrainState, delivered: Delivery[], at = new Date().toISOString()): BrainState =>
  delivered.reduce((next, d) => postMessage(next, d.item.conversationId, d.result ? replyMessage(d.item.request, d.result, at) : errorMessage(d.item.request, d.error, at)), state);
