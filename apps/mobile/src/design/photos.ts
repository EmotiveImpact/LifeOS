import type { ImageSourcePropType } from 'react-native';

/**
 * V26 photographs, copied from the board (`review/v26/img`) so the app and the board show the same pictures.
 * Use them by name: `photos.food`. Daylight photography only; never stretch a photo past its focal point.
 */
export const photos = {
  desk: require('../../assets/images/v26/desk.webp'),
  terrace: require('../../assets/images/v26/terrace.webp'),
  home: require('../../assets/images/v26/home.webp'),
  work: require('../../assets/images/v26/work.webp'),
  people: require('../../assets/images/v26/people.webp'),
  keys: require('../../assets/images/v26/keys.webp'),
  keyshome: require('../../assets/images/v26/keyshome.jpg'),
  food: require('../../assets/images/v26/food.jpg'),
  sky: require('../../assets/images/v26/sky.jpg'),
  run: require('../../assets/images/v26/run.jpg'),
  journal: require('../../assets/images/v26/journal.jpg'),
  friends: require('../../assets/images/v26/friends.jpg'),
  bench: require('../../assets/images/v26/bench.jpg'),
  birthday: require('../../assets/images/v26/birthday.jpg'),
  gotit: require('../../assets/images/v26/gotit.jpg'),
  aimwrite: require('../../assets/images/v26/aimwrite.jpg'),
  areahome: require('../../assets/images/v26/areahome.jpg'),
  areawork: require('../../assets/images/v26/areawork.jpg'),
  aimdesk: require('../../assets/images/v26/aimdesk.jpg'),
  movein: require('../../assets/images/v26/movein.jpg'),
  sunday: require('../../assets/images/v26/sunday.jpg'),
  freedom: require('../../assets/images/v26/freedom.jpg'),
  calmdesk: require('../../assets/images/v26/calmdesk.jpg'),
  vantage: require('../../assets/images/v26/vantage.jpg'),
  calm: require('../../assets/images/v26/calm.jpg'),
  breakfast: require('../../assets/images/v26/breakfast.jpg'),
  wrap: require('../../assets/images/v26/wrap.jpg'),
  snack: require('../../assets/images/v26/snack.jpg'),
  cook: require('../../assets/images/v26/cook.jpg'),
  label: require('../../assets/images/v26/label.jpg'),
  payslip: require('../../assets/images/v26/payslip.jpg'),
  letter: require('../../assets/images/v26/letter.jpg'),
  passport: require('../../assets/images/v26/passport.jpg'),
  bedroom: require('../../assets/images/v26/bedroom.jpg'),
  walk: require('../../assets/images/v26/walk.jpg'),
  breathe: require('../../assets/images/v26/breathe.jpg'),
  siblings: require('../../assets/images/v26/siblings.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export type PhotoName = keyof typeof photos;

/** Pixel size of each photograph, so a card can keep its focal point when it crops (on every platform, web included). */
export const photoSizes: Record<PhotoName, readonly [number, number]> = {
  aimdesk: [760, 1140],
  aimwrite: [760, 1140],
  areahome: [760, 1140],
  areawork: [760, 1140],
  bedroom: [760, 1140],
  bench: [760, 1140],
  birthday: [760, 1140],
  breakfast: [760, 1140],
  breathe: [760, 1140],
  calm: [760, 1140],
  calmdesk: [760, 1140],
  cook: [760, 1140],
  desk: [850, 425],
  food: [760, 1140],
  freedom: [760, 1140],
  friends: [760, 1140],
  gotit: [760, 1140],
  home: [274, 400],
  journal: [760, 1140],
  keys: [157, 156],
  keyshome: [760, 1140],
  label: [760, 1140],
  letter: [760, 1140],
  movein: [760, 1140],
  passport: [760, 1140],
  payslip: [760, 1140],
  people: [270, 400],
  run: [760, 1140],
  siblings: [760, 1140],
  sky: [760, 1140],
  snack: [760, 1140],
  sunday: [760, 1140],
  terrace: [820, 488],
  vantage: [760, 1140],
  walk: [760, 1140],
  work: [262, 400],
  wrap: [760, 1140],
};

const bySource = new Map<unknown, readonly [number, number]>(Object.entries(photos).map(([k, v]) => [v, photoSizes[k as PhotoName]]));
/** The pixel size of a V26 photograph, or null for any other source. */
export function sizeOfPhoto(source: unknown): readonly [number, number] | null {
  return bySource.get(source) ?? null;
}
