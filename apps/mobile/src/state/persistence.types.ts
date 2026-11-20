import type { SyncTransport } from '../data/store';

export const LEGACY_STATE_KEY = 'life_track_a_v17';

export interface ProjectionStorage {
  readonly mode: 'sqlite' | 'web-preview';
  load(): Promise<unknown>;
  save(projection: unknown): Promise<void>;
  clear(): Promise<void>;
  exportEverything(): Promise<unknown>;
  close(): Promise<void>;
  /** Pushes this phone's changes and pulls the account's others (Phase 22). `applied` counts rows that changed here. */
  sync(transport: SyncTransport): Promise<{ applied: number }>;
  /** First sign-in: restore onto a phone with nothing of its own, or move this phone's things to the account's ids. */
  adoptAccount(accountId: string, restore: boolean): Promise<void>;
}
