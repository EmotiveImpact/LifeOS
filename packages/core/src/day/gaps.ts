/**
 * Free time from the calendar (Phase 29, read only). Busy stretches come in as start and end instants, nothing else:
 * no titles, no attendees, no places. Overlaps merge, and only stretches long enough to do something count.
 */
export interface Busy { start: number; end: number }
export interface Gap { start: number; end: number; minutes: number }

/** The shortest free stretch worth offering a move in. */
export const MIN_GAP_MINUTES = 15;
const MIN = 60_000;

/** Free stretches between `from` and `to`, in order. An event that ends before it starts is ignored. */
export function freeGaps(busy: readonly Busy[], from: number, to: number, minMinutes = MIN_GAP_MINUTES): Gap[] {
  if (!(to > from)) return [];
  const spans = busy
    .filter(b => Number.isFinite(b.start) && Number.isFinite(b.end) && b.end > b.start && b.end > from && b.start < to)
    .map(b => ({ start: Math.max(from, b.start), end: Math.min(to, b.end) }))
    .sort((a, b) => a.start - b.start);
  const gaps: Gap[] = [];
  let cursor = from;
  const push = (start: number, end: number) => {
    const minutes = Math.floor((end - start) / MIN);
    if (minutes >= minMinutes) gaps.push({ start, end, minutes });
  };
  for (const s of spans) {
    if (s.start > cursor) push(cursor, s.start);
    cursor = Math.max(cursor, s.end);
  }
  if (to > cursor) push(cursor, to);
  return gaps;
}

/**
 * The first free stretch with room for `minutes`, from `after` on. By default the stretch is clipped to start at
 * `after`; `whole` returns it as it is.
 */
export function gapFor(gaps: readonly Gap[], minutes: number, after: number, whole = false): Gap | null {
  for (const g of gaps) {
    const start = Math.max(g.start, after);
    const room = Math.floor((g.end - start) / MIN);
    if (room >= minutes) return whole ? g : { start, end: g.end, minutes: room };
  }
  return null;
}
