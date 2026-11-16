import type { Area } from './tokens';
/** Canvas-only light fields transcribed from v17’s .glow elements. The one-colour
 * ellipse and 14pt dot field are DESIGN §27, not blur/glass/mesh. */
export type FieldSignal = Area | 'ember' | 'mood';
export const fieldMood = '#3DC8AA';
export const screenLightFields: Record<string, readonly [FieldSignal, number?]> = {
  tell: ['work', .22], building: ['ember'], signin: ['ember'], healthprimer: ['health', .20],
  notifprimer: ['ember'], micprimer: ['ember'], today: ['ember'], nudge: ['ember'],
  pulse: ['mood', .24], checkin: ['work', .16], evening: ['you', .18], focus: ['work', .22],
  scan: ['home', .24], mission: ['money', .22], areahealth: ['health', .22], aimnew: ['ember'],
  money: ['money', .26], area: ['money', .20], cashplan: ['money', .20], income: ['work', .22],
  rentbuy: ['home', .22], blood: ['health', .20], growth: ['ember'], body: ['health', .18],
  readiness: ['money', .18], sleep: ['work', .20], load: ['ember', .18], hrv: ['work', .18],
  signals: ['ember', .16], breathe: ['work', .26], workout: ['ember', .22], cycle: ['health', .18],
  fitnessage: ['money', .18], illness: ['ember', .16], fuelplan: ['money', .16], library: ['work', .20],
  lens: ['ember', .22], idea: ['ember'], recall: ['home', .20], lessonready: ['ember'],
  lessonrecap: ['money', .14], mood: ['mood', .18], levels: ['ember'], experiment: ['work', .18],
  chronotype: ['money', .20], plussuccess: ['ember'], recap: ['ember'], vantage: ['ember'],
  emptytoday: ['ember'], watch: ['ember'], orb: ['ember'],
};
