/** Pure local-day helpers; kept separate so date behavior is testable without React Native. */
export function localDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function isOnLocalDay(iso: string, day: string): boolean {
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) && localDayKey(date) === day;
}
export function aimReadKey(period: string, date = new Date()): string { return `${localDayKey(date)}-${period}`; }
