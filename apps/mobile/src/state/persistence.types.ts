export const LEGACY_STATE_KEY = 'life_track_a_v17';

export interface ProjectionStorage {
  readonly mode: 'sqlite' | 'web-preview';
  load(): Promise<unknown>;
  save(projection: unknown): Promise<void>;
  clear(): Promise<void>;
  exportEverything(): Promise<unknown>;
  close(): Promise<void>;
}
