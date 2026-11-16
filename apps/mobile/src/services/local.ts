import type { FiledRecord, MealItem } from '@/state/seed';
import { seedMeal, seedRecords } from '@/state/seed';
/** Track A boundary: never makes a network request or asks for a system permission. */
export type PermissionState = 'local-preview' | 'declined';
export type LocalResult<T> = { data: T; mode: 'local-preview' };
export const local = <T>(data: T): LocalResult<T> => ({ data, mode: 'local-preview' });
export interface HealthService { connect(source: string): Promise<LocalResult<{ source: string; granted: string[] }>>; }
export const health: HealthService = { connect: async source => local({ source, granted: ['sleep', 'heart_rate', 'workouts', 'steps'] }) };
export interface FoodService { readPhoto(uri?: string): Promise<LocalResult<MealItem[]>>; }
export const food: FoodService = { readPhoto: async () => local(seedMeal) };
export interface VoiceService { transcribe(): Promise<LocalResult<string>>; speak(text: string): Promise<LocalResult<string>>; }
export const voice: VoiceService = { transcribe: async () => local('I’m 27, I live in London with two flatmates, and I’ve gone self-employed doing design work. I think I overpaid tax last year. I’ve been waiting eleven weeks for a heart referral. Long term I want to buy a place.'), speak: async text => local(text) };
export interface AuthService { signIn(provider: 'apple' | 'google' | 'email'): Promise<LocalResult<{ name: string }>>; }
export const auth: AuthService = { signIn: async () => local({ name: 'Ama' }) };
export interface RecordRepository { propose(text: string): Promise<LocalResult<FiledRecord[]>>; }
export const records: RecordRepository = { propose: async text => local(seedRecords.map(r => ({ ...r, source: { ...r.source, excerpt: text } }))) };
