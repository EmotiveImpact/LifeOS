/** Runtime-independent brain contracts. No UI, credentials, I/O or model SDKs. */
import type { SupportReply } from './safety.ts';
export type Area = 'you' | 'home' | 'work' | 'money' | 'health' | 'goal';
export type Job = 'ask' | 'extract' | 'draft' | 'lesson' | 'analyse' | 'showMe' | 'food' | 'coach' | 'plan-explain' | 'read-document';
export type Tier = 'fast' | 'strong' | 'vision';
export type ModelLocation = 'device' | 'server' | 'cloud';
export type Source = { id: string; label: string; kind: 'engine' | 'record' | 'memory' | 'attachment' | 'profile'; at?: string; sample?: boolean };
export type Fact = { id: string; label: string; value: string; source: Source };
export type Memory = { id: string; text: string; source: Source; recordId?: string };
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
export type Request = { id: string; job: Job; text: string; context: Context; history: Pick<Message, 'role' | 'text'>[]; attachments: Attachment[]; privateMode: boolean; consent: { requestId: string; locations: ModelLocation[] } | null };
export type ModelOutput = { answer: string; detail?: string; citations: string[]; proposals: Proposal[]; data?: unknown };
export type Result = { answer: string; detail?: string; sources: Source[]; proposals: Proposal[]; route: { location: ModelLocation | 'rules'; model: string; tier: Tier }; data?: unknown; notices: string[]; safety?: SupportReply };
export type Capability = { id: string; location: ModelLocation; jobs: Job[]; available: boolean; reason?: string };
export interface ModelAdapter { id: string; location: ModelLocation; jobs: Job[]; available(): Promise<boolean>; generate(request: Request, signal: AbortSignal): Promise<unknown> }
export class BrainError extends Error {
  constructor(public code: 'UNAVAILABLE' | 'CONSENT_REQUIRED' | 'INVALID_INPUT' | 'INVALID_OUTPUT' | 'CANCELLED' | 'TIMEOUT' | 'RATE_LIMITED', message: string) { super(message); this.name = 'BrainError'; }
}
export const tierFor = (job: Job): Tier => job === 'food' ? 'vision' : job === 'extract' ? 'fast' : 'strong';
