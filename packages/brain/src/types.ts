/** Runtime-independent brain contracts. No UI, credentials, I/O or model SDKs. */
import type { SupportReply } from './safety.ts';
import type { ConsentGrant } from './consent.ts';
export type Area = 'you' | 'home' | 'work' | 'money' | 'health' | 'goal';
export type Job = 'ask' | 'extract' | 'draft' | 'lesson' | 'analyse' | 'showMe' | 'food' | 'coach' | 'plan-explain' | 'read-document' | 'remember';
/** Model strength, cheapest first. `top` is for big decisions only; `vision` reads photos. */
export type Tier = 'fast' | 'strong' | 'top' | 'vision';
export type ModelLocation = 'device' | 'server' | 'cloud';
export type Source = { id: string; label: string; kind: 'engine' | 'record' | 'memory' | 'attachment' | 'profile'; at?: string; sample?: boolean };
/** `sensitivity: 'health'` keeps a fact or memory off the cloud unless consent names health. */
export type Sensitivity = 'health' | 'money' | 'other';
export type Fact = { id: string; label: string; value: string; source: Source; sensitivity?: Sensitivity };
export type Memory = { id: string; text: string; source: Source; recordId?: string; sensitivity?: Sensitivity };
export type Move = { id: string; title: string; reasons: string[]; area: Area; urgent: boolean };
/** The six profile facts, a goal, a note, and the record kinds Talk can now
 * file. `details` carries the structured fields for the record kinds; its
 * `kind` always equals `field`. Every value in it must appear in `quote`. */
export type ProfileField = 'age' | 'location' | 'household' | 'work' | 'income' | 'rent';
export type RecordField = 'bill' | 'subscription' | 'date' | 'person' | 'document' | 'appointment';
export type Field = ProfileField | 'goal' | 'note' | RecordField;
export type When = { year?: number; month?: number; day?: number; time?: string };
export type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type DocumentKind = 'passport' | 'driving-licence' | 'mot' | 'car-insurance' | 'home-insurance' | 'tv-licence' | 'railcard' | 'visa' | 'residence-permit' | 'ghic' | 'car-tax' | 'boiler-service';
export type ProposalDetails =
  | { kind: 'bill'; payee: string; amount: number; frequency?: Frequency; dueDay?: number }
  | { kind: 'subscription'; service: string; amount: number; frequency?: Frequency }
  | { kind: 'date'; person: string; occasion: 'birthday' | 'anniversary'; when: When }
  | { kind: 'person'; name: string; relation: string }
  | { kind: 'document'; document: DocumentKind; event: 'expires' | 'renews' | 'due'; when: When }
  | { kind: 'appointment'; what: string; when: When };
export type Proposal = { id: string; field: Field; label: string; area: Area; quote: string; value: string | number; details?: ProposalDetails };
export type Attachment = { id: string; name: string; mime: string; uri: string; size: number; text?: string; status: 'ready' | 'needs-reader' | 'failed'; error?: string };
export type Message = { id: string; role: 'user' | 'life'; text: string; at: string; sources?: Source[]; proposals?: Proposal[]; route?: string; error?: boolean; attachmentIds?: string[]; detail?: string };
export type Conversation = { id: string; title: string; createdAt: string; updatedAt: string; messages: Message[]; attachments: Attachment[] };
export type BrainState = { version: 1; conversations: Conversation[]; activeConversationId: string | null; confirmedRecordIds: string[] };
export const emptyBrainState = (): BrainState => ({ version: 1, conversations: [], activeConversationId: null, confirmedRecordIds: [] });
export type Context = { facts: Fact[]; memories: Memory[]; moves: Move[]; sample: boolean };
export type Request = { id: string; job: Job; text: string; context: Context; history: Pick<Message, 'role' | 'text'>[]; attachments: Attachment[]; privateMode: boolean; consent: { requestId: string; locations: ModelLocation[] } | null; grants?: ConsentGrant[] };
export type ModelOutput = { answer: string; detail?: string; citations: string[]; proposals: Proposal[]; data?: unknown };
/** `output` is the model's checked answer before facts are filled in: what the life API sends back to the phone,
 * which checks it again against its own request. */
export type Result = { answer: string; detail?: string; sources: Source[]; proposals: Proposal[]; route: { location: ModelLocation | 'rules'; model: string; tier: Tier }; data?: unknown; notices: string[]; safety?: SupportReply; output?: ModelOutput };
export type Capability = { id: string; location: ModelLocation; jobs: Job[]; available: boolean; reason?: string };
/** `tiers` limits an adapter to the strengths it can serve (all when left out);
 * `maxContextChars` makes the runtime trim history and memories to fit.
 * `relay` marks the life API, which has already checked the model's answer: it
 * may add one line of `notice` (an allowance running out) or a `support` signal
 * (the phone then shows its own support screen). A model's answer can do neither. */
export interface ModelAdapter { id: string; location: ModelLocation; jobs: Job[]; tiers?: Tier[]; maxContextChars?: number; relay?: boolean; available(): Promise<boolean>; generate(request: Request, signal: AbortSignal): Promise<unknown> }
export class BrainError extends Error {
  /** `OFFLINE`: the phone couldn't reach the life API. The request is kept and sent once the phone is back. */
  constructor(public code: 'UNAVAILABLE' | 'OFFLINE' | 'CONSENT_REQUIRED' | 'INVALID_INPUT' | 'INVALID_OUTPUT' | 'CANCELLED' | 'TIMEOUT' | 'RATE_LIMITED', message: string) { super(message); this.name = 'BrainError'; }
}
/** A job's starting tier (router.ts BASE_TIERS; the tier table can move it). */
export const tierFor = (job: Job): Tier => job === 'food' ? 'vision' : job === 'extract' || job === 'ask' || job === 'remember' ? 'fast' : 'strong';
