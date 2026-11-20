import type { FiledRecord, MealItem } from '@/state/seed';
import { seedMeal } from '@/state/seed';
import { screenWords } from '@life/brain';
import { proposalRecord } from './brainState';
/** Remaining Track A integration stubs. Conversation filing is now real and
 * conservative; no shared canned record set or fake voice transcript. */
export type PermissionState = 'local-preview' | 'declined';
export type LocalResult<T> = { data: T; mode: 'local-preview' };
export const local = <T>(data: T): LocalResult<T> => ({ data, mode: 'local-preview' });
export interface HealthService { connect(source: string): Promise<LocalResult<{ source: string; granted: string[] }>>; }
export const health: HealthService = { connect: async source => local({ source, granted: ['sleep', 'heart_rate', 'workouts', 'steps'] }) };
export interface FoodService { readPhoto(uri?: string): Promise<LocalResult<MealItem[]>>; }
export const food: FoodService = { readPhoto: async () => local(seedMeal) };
export interface AuthService { signIn(provider: 'apple' | 'google' | 'email'): Promise<LocalResult<{ name: string }>>; }
export const auth: AuthService = { signIn: async () => local({ name: 'Ama' }) };
export interface RecordRepository { propose(text: string): Promise<{ data: FiledRecord[]; mode: 'rules' }>; }
export const records: RecordRepository = { propose: async text => ({ data: screenWords(text).proposals.map(proposal => proposalRecord(proposal, 'talk')), mode: 'rules' }) };
