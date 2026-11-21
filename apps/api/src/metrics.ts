import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { MOVES_CAP, REPORT_WEEKS, weekKey } from '../../../packages/core/src/day/metrics.ts';
import type { Db } from './db/client';
import { weeklyMoves } from './db/schema';

/**
 * Life's north star (Phase 30): moves finished per week. A phone whose person switched it on sends one number per
 * finished week. The route needs a session only so strangers can't fill the tally; nothing of the sender is kept.
 */
export const MovesBody = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/),
  moves: z.number().int().min(0).max(MOVES_CAP),
  platform: z.enum(['ios', 'android']),
});

/**
 * The weeks a phone may report at `now`: finished somewhere on Earth (the earliest time zone, UTC+14, finishes a week
 * first) and no more than a few weeks back, with one week's grace for the slowest time zones.
 */
export function reportableWeeks(now: number): Set<string> {
  const ahead = weekKey(now, 'Pacific/Kiritimati');
  const weeks = new Set<string>();
  for (let k = 0; weeks.size < REPORT_WEEKS + 1 && k < 60; k++) {
    const w = weekKey(now - k * 86_400_000, 'Pacific/Kiritimati');
    if (w !== ahead) weeks.add(w);
  }
  return weeks;
}

/** Adds one to the tally for that week, platform and count. */
export async function countWeek(db: Db, body: z.infer<typeof MovesBody>): Promise<void> {
  await db.db.insert(weeklyMoves).values({ ...body, reports: 1 })
    .onConflictDoUpdate({ target: [weeklyMoves.week, weeklyMoves.platform, weeklyMoves.moves], set: { reports: sql`${weeklyMoves.reports} + 1` } });
}
