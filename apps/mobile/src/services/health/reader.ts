/**
 * Where health readings come from (BUILD_V26 Phase 26). The phone's own store (Apple Health on iPhone, Health
 * Connect on Android) and, through the life API, WHOOP and Oura. Every reader returns the engine's `HealthSample`.
 */
import type { HealthSample, SampleType } from '@life/core';

export type ReaderId = 'apple-health' | 'health-connect' | 'whoop' | 'oura';

export interface SampleReader {
  id: ReaderId;
  name: string;
  /** Readings that started between `from` and `to` (UTC milliseconds), only of the types allowed. */
  read(from: number, to: number, allowed: Set<SampleType>): Promise<HealthSample[]>;
}

export interface PhoneHealthReader extends SampleReader {
  /** True on a phone that has the health store and a build with its native module. */
  available(): Promise<boolean>;
  /** Shows the system's own permission sheet for the types allowed. False when the person said no or it failed. */
  requestAccess(allowed: Set<SampleType>): Promise<boolean>;
}

/** Long reads go in chunks so a 60-day backfill of heart rate never arrives as one huge answer. */
export const CHUNK_MS = 7 * 86_400_000;
export function chunks(from: number, to: number, size = CHUNK_MS): [number, number][] {
  const out: [number, number][] = [];
  for (let a = from; a < to; a += size) out.push([a, Math.min(to, a + size)]);
  return out;
}
