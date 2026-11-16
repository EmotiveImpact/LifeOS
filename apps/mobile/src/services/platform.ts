import { seed } from '@/state/seed';
/** Native extension boundary. Track A supplies local snapshots; Track B installs targets. */
export type WidgetSnapshot = { move: string; readiness: number; sleep: string; fuel: number; step: number; steps: number };
export const platform = {
  widget: (): WidgetSnapshot => ({ move: 'Finish the P87', readiness: seed.health.readiness, sleep: '7h 10m', fuel: seed.fuel.eaten, step: 2, steps: 3 }),
  shortcut: (text: string) => ({ text, proposed: { label: 'Dentist', at: 'Friday 15:00', area: 'Health' as const }, mode: 'local-preview' as const }),
  watch: () => ({ move: 'Move money to your buffer', readiness: seed.health.readiness, done: 2, total: 3, mode: 'local-preview' as const }),
};
